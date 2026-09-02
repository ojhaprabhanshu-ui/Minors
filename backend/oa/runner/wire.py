"""Shared wire protocol for the OA runners.

All test-input parsing and all result comparison happen here, in the Python
parent process. The generated Java/C++ drivers only read already-parsed JSON
arguments, invoke the candidate function, and write the return value back as
JSON. Keeping the comparator in one place means Python, Java and C++ can never
disagree about whether an answer is correct.

Wire format, both directions are files whose paths are passed as argv:

    spec.json   {"functionName": str, "unordered": bool,
                 "cases": [{"args": [<json>...], "expected": str}]}
    result.json {"stdout": str,
                 "invocations": [{"ok": bool, "actual": <json>,
                                  "error": str|null, "ms": float}]}
"""

import ast
import json
import math
import re

_BRACKETS = {"[": "]", "(": ")", "{": "}"}
_CLOSERS = set(_BRACKETS.values())
_QUOTES = "\"'"

_SENTINEL = object()

_UNORDERED_RE = re.compile(r"\bany order\b|order does not matter", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Value parsing
# ---------------------------------------------------------------------------

def parse_value(text):
    """Parse a test-case literal into a Python value.

    JSON first (so `true`/`false`/`null` and quoted strings behave), then
    `ast.literal_eval` (so Python spellings like `(0, 1)` and `'abc'` work),
    and finally the bare string itself. Used for both arguments and expected
    values so the two sides normalize identically.
    """
    if text is None:
        return None
    if not isinstance(text, str):
        return text

    s = text.strip()
    if not s:
        return ""

    try:
        return json.loads(s)
    except Exception:
        pass
    try:
        return ast.literal_eval(s)
    except Exception:
        pass
    return s


def _try_parse(text):
    """Like parse_value but signals failure instead of falling back to str."""
    s = text.strip()
    if not s:
        return ""
    try:
        return json.loads(s)
    except Exception:
        pass
    try:
        return ast.literal_eval(s)
    except Exception:
        pass
    return _SENTINEL


def split_top_level(text, sep=","):
    """Split on `sep` ignoring separators inside brackets or quotes."""
    parts, buf = [], []
    depth = 0
    quote = None
    i = 0
    while i < len(text):
        ch = text[i]
        if quote:
            buf.append(ch)
            if ch == "\\" and i + 1 < len(text):
                buf.append(text[i + 1])
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch in _QUOTES:
            quote = ch
            buf.append(ch)
        elif ch in _BRACKETS:
            depth += 1
            buf.append(ch)
        elif ch in _CLOSERS:
            depth = max(0, depth - 1)
            buf.append(ch)
        elif ch == sep and depth == 0:
            parts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
        i += 1
    parts.append("".join(buf))
    return [p.strip() for p in parts]


def _find_top_level(text, ch):
    depth = 0
    quote = None
    i = 0
    while i < len(text):
        cur = text[i]
        if quote:
            if cur == "\\":
                i += 2
                continue
            if cur == quote:
                quote = None
        elif cur in _QUOTES:
            quote = cur
        elif cur in _BRACKETS:
            depth += 1
        elif cur in _CLOSERS:
            depth = max(0, depth - 1)
        elif cur == ch and depth == 0:
            return i
        i += 1
    return -1


def _parse_arg_line(line):
    """Parse one argument, tolerating the `name = value` and bare forms."""
    value = _try_parse(line)
    if value is not _SENTINEL:
        return value

    eq = _find_top_level(line, "=")
    if eq >= 0:
        lhs = line[:eq].strip()
        rhs = line[eq + 1:].strip()
        value = _try_parse(rhs)
        # Only the `name = value` form splits. Requiring an identifier on the
        # left and a literal on the right is what keeps a bare string argument
        # like "a=b" intact instead of collapsing to "b".
        if re.fullmatch(r"[A-Za-z_]\w*", lhs) and value is not _SENTINEL:
            return value

    return line


def parse_args(input_str, arity):
    """Turn a test case's `input` string into a list of argument values.

    The bank uses newline-delimited args ("[2, 7]\\n9"), but LLM-generated
    questions also produce "nums = [2,7]\\ntarget = 9" and the single-line
    "[2,7], 9". All three must land on the same argument list.
    """
    if arity is None or arity < 1:
        arity = 1

    raw = "" if input_str is None else str(input_str)
    lines = [l.strip() for l in raw.splitlines() if l.strip()]
    if not lines:
        return []

    if len(lines) == arity:
        return [_parse_arg_line(l) for l in lines]

    if len(lines) == 1:
        line = lines[0]
        if arity > 1:
            parts = split_top_level(line, ",")
            if len(parts) == arity and all(_try_parse(p) is not _SENTINEL for p in parts):
                return [_try_parse(p) for p in parts]
        value = _parse_arg_line(line)
        if (
            arity > 1
            and isinstance(value, (tuple, list))
            and len(value) == arity
        ):
            return list(value)
        return [value]

    if arity == 1:
        return [parse_value(raw)]

    # More lines than parameters: trust the declared arity and take the first.
    return [_parse_arg_line(l) for l in lines[:arity]]


# ---------------------------------------------------------------------------
# Normalization and comparison
# ---------------------------------------------------------------------------

def normalize(value):
    """Canonicalize a value for comparison and display.

    Tuples and sets become lists, and integral floats become ints so that a
    Python `4.0` and a C++ `4` compare equal against the expected `"4"`.
    """
    if isinstance(value, bool):
        return value
    if isinstance(value, tuple):
        return [normalize(v) for v in value]
    if isinstance(value, (set, frozenset)):
        return sorted(_key(normalize(v)) for v in value)
    if isinstance(value, list):
        return [normalize(v) for v in value]
    if isinstance(value, dict):
        return {str(k): normalize(v) for k, v in value.items()}
    if isinstance(value, float) and math.isfinite(value) and value.is_integer():
        return int(value)
    return value


def _key(value):
    try:
        return json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)
    except Exception:
        return str(value)


def _unordered_key(value):
    """Multiset key for order-insensitive comparison.

    A list of scalars is also sorted, because problems that say "any order"
    (groupAnagrams) permit reordering both the groups and their members.
    """
    if isinstance(value, list) and all(
        isinstance(item, (str, int, float, bool)) for item in value
    ):
        return json.dumps(sorted(_key(item) for item in value))
    return _key(value)


def _scalar_str(value):
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, str):
        return value.strip()
    return _key(value)


def _deep_equal(a, b, unordered):
    # bool is a subclass of int, so it must be dispatched first.
    if isinstance(a, bool) or isinstance(b, bool):
        if isinstance(a, bool) and isinstance(b, bool):
            return a == b
        if isinstance(a, bool) and isinstance(b, str):
            return _scalar_str(a) == b.strip().lower()
        if isinstance(b, bool) and isinstance(a, str):
            return _scalar_str(b) == a.strip().lower()
        if isinstance(a, bool) and isinstance(b, (int, float)):
            return int(a) == b
        if isinstance(b, bool) and isinstance(a, (int, float)):
            return int(b) == a
        return False

    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        try:
            return math.isclose(float(a), float(b), rel_tol=1e-9, abs_tol=1e-9)
        except Exception:
            return a == b

    if isinstance(a, str) and isinstance(b, str):
        return a.strip() == b.strip()

    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        if unordered:
            return sorted(_unordered_key(x) for x in a) == sorted(
                _unordered_key(y) for y in b
            )
        return all(_deep_equal(x, y, unordered) for x, y in zip(a, b))

    if isinstance(a, dict) and isinstance(b, dict):
        if set(a) != set(b):
            return False
        return all(_deep_equal(a[k], b[k], unordered) for k in a)

    if isinstance(a, str) or isinstance(b, str):
        return _scalar_str(a) == _scalar_str(b)

    return _key(a) == _key(b)


def values_equal(actual, expected_raw, unordered=False):
    """Compare a driver-produced value against the raw `expected` string."""
    return _deep_equal(normalize(actual), normalize(parse_value(expected_raw)), unordered)


def display(value):
    """Readable canonical form for the `actual`/`expected` UI fields."""
    normalized = normalize(value)
    try:
        return json.dumps(normalized, default=str)
    except Exception:
        return str(normalized)


# ---------------------------------------------------------------------------
# Question metadata
# ---------------------------------------------------------------------------

def function_name_of(question):
    return (question or {}).get("functionName") or "solution"


def arity_of(question):
    args = (question or {}).get("arguments")
    if isinstance(args, list) and args:
        return len(args)
    return 1


def is_unordered_question(question):
    """True only when the problem statement says order does not matter.

    Deliberately not inferred from the return type: treating every list result
    as order-insensitive would wrongly pass `twoSum` returning `[1, 0]`.
    """
    q = question or {}
    text = " ".join(str(q.get(k, "")) for k in ("description", "title"))
    return bool(_UNORDERED_RE.search(text))


# ---------------------------------------------------------------------------
# Spec / result files
# ---------------------------------------------------------------------------

def build_spec(function_name, cases, unordered=False):
    return {
        "functionName": function_name,
        "unordered": bool(unordered),
        "cases": cases,
    }


def build_cases(test_cases, arity):
    return [
        {"args": parse_args(tc.get("input", ""), arity),
         "expected": "" if tc.get("expected") is None else str(tc.get("expected"))}
        for tc in (test_cases or [])
    ]


def write_json(path, payload):
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, default=str)


def read_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


# ---------------------------------------------------------------------------
# Grading and response shape
# ---------------------------------------------------------------------------

def grade(invocations, cases, unordered=False):
    """Merge driver invocations with the expected values into testResults."""
    results = []
    for idx, case in enumerate(cases):
        expected_raw = case.get("expected", "")
        expected_display = display(parse_value(expected_raw))

        if idx >= len(invocations):
            results.append({
                "caseIndex": idx + 1,
                "passed": False,
                "actual": None,
                "expected": expected_display,
                "error": "No result was produced for this test case.",
            })
            continue

        inv = invocations[idx] or {}
        if inv.get("ok"):
            actual = inv.get("actual")
            results.append({
                "caseIndex": idx + 1,
                "passed": values_equal(actual, expected_raw, unordered),
                "actual": display(actual),
                "expected": expected_display,
                "error": None,
            })
        else:
            results.append({
                "caseIndex": idx + 1,
                "passed": False,
                "actual": None,
                "expected": expected_display,
                "error": inv.get("error") or "Runtime error",
            })

    return results, sum(1 for r in results if r["passed"])


def make_response(success, error, test_results, total_cases, runtime_ms,
                  compile_ms=0, console_output="", language="", toolchain=None):
    return {
        "success": bool(success),
        "error": error,
        "totalPassed": sum(1 for r in test_results if r.get("passed")),
        "totalCases": total_cases,
        "testResults": test_results,
        "runtimeMs": int(round(runtime_ms or 0)),
        "compileMs": int(round(compile_ms or 0)),
        "consoleOutput": console_output or "",
        "language": language,
        "toolchain": toolchain or {},
    }


def failure(error, total_cases, language="", runtime_ms=0, compile_ms=0,
            console_output="", toolchain=None):
    """Uniform shape for compile errors, missing toolchains and timeouts."""
    return make_response(
        success=False, error=error, test_results=[], total_cases=total_cases,
        runtime_ms=runtime_ms, compile_ms=compile_ms,
        console_output=console_output, language=language, toolchain=toolchain,
    )


def timeout_seconds(case_count, base=5.0, per_case=2.0):
    return base + per_case * max(1, case_count)
