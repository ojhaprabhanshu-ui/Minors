"""Python submission runner.

The candidate's code is written to its own file and loaded by a *static*
harness — nothing is interpolated into generated source, so no submission can
break the harness by containing braces, quotes or f-string syntax.

Results travel back through `result.json`, never through stdout. That is the
fix for the old harness, which printed the result payload to stdout and then
failed to parse it whenever the candidate's own code printed anything.
"""

import contextlib
import os
import shutil
import subprocess
import sys
import tempfile
import time

from . import wire

# Static harness. Deliberately contains no format placeholders.
HARNESS = r'''
import contextlib
import inspect
import io
import json
import os
import sys
import time
import traceback

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC_PATH = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "spec.json")
OUT_PATH = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "result.json")
MAX_STDOUT = 50000


def _fallback(obj):
    if isinstance(obj, (set, frozenset)):
        return sorted(obj, key=repr)
    if isinstance(obj, tuple):
        return list(obj)
    if isinstance(obj, complex):
        return str(obj)
    return repr(obj)


def emit(payload):
    try:
        with open(OUT_PATH, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, default=_fallback)
    except Exception:
        sys.stderr.write("harness: failed to write results\n")


def short_error():
    lines = traceback.format_exc(limit=3).strip().splitlines()
    keep = [l for l in lines if not l.strip().startswith('File "<')]
    return "\n".join(keep[-3:]).strip() or "Runtime error"


class _Capped(io.StringIO):
    """StringIO that stops growing past MAX_STDOUT."""

    def write(self, text):
        if self.tell() < MAX_STDOUT:
            return super().write(text[: MAX_STDOUT - self.tell()])
        return len(text)


def resolve(ns, func_name):
    """Find the callable the candidate means to submit.

    Only real functions are accepted — the previous fallback matched any
    `callable()`, which includes classes, so a class-based submission was
    instantiated instead of called.
    """
    candidate = ns.get(func_name)
    if inspect.isfunction(candidate) or inspect.ismethod(candidate):
        return candidate, None

    # LeetCode-style Python: `class Solution: def twoSum(self, ...)`
    classes = [v for v in ns.values() if inspect.isclass(v)]
    ordered = [c for c in classes if c.__name__ == "Solution"] + \
              [c for c in classes if c.__name__ != "Solution"]
    for klass in ordered:
        method = klass.__dict__.get(func_name)
        if inspect.isfunction(method):
            try:
                return method.__get__(klass()), None
            except Exception:
                return None, "Could not instantiate class '%s' to call '%s'." % (
                    klass.__name__, func_name)

    for name, value in ns.items():
        if not name.startswith("__") and inspect.isfunction(value):
            return value, None

    if inspect.isclass(ns.get(func_name)):
        return None, ("'%s' is a class, not a function. Define it as "
                      "`def %s(...)` or put the method inside `class Solution`."
                      % (func_name, func_name))
    return None, "Function '%s' was not found in your code." % func_name


def main():
    with open(SPEC_PATH, "r", encoding="utf-8") as handle:
        spec = json.load(handle)

    func_name = spec.get("functionName") or "solution"
    cases = spec.get("cases") or []
    buffer = _Capped()
    invocations = []

    with open(os.path.join(HERE, "candidate.py"), "r", encoding="utf-8") as handle:
        source = handle.read()

    with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(buffer):
        try:
            compiled = compile(source, "candidate.py", "exec")
        except SyntaxError as exc:
            emit({"stdout": buffer.getvalue(), "invocations": [],
                  "fatal": "SyntaxError: %s (line %s)" % (exc.msg, exc.lineno)})
            return
        except Exception:
            emit({"stdout": buffer.getvalue(), "invocations": [],
                  "fatal": short_error()})
            return

        namespace = {"__name__": "candidate", "__file__": os.path.join(HERE, "candidate.py")}
        try:
            exec(compiled, namespace)
        except Exception:
            emit({"stdout": buffer.getvalue(), "invocations": [],
                  "fatal": "Error while loading your code:\n" + short_error()})
            return

        target, error = resolve(namespace, func_name)
        if target is None:
            emit({"stdout": buffer.getvalue(), "invocations": [], "fatal": error})
            return

        for case in cases:
            args = case.get("args") or []
            started = time.perf_counter()
            try:
                actual = target(*args)
            except Exception as exc:
                invocations.append({
                    "ok": False, "actual": None,
                    "error": "%s: %s" % (type(exc).__name__, exc),
                    "ms": (time.perf_counter() - started) * 1000.0,
                })
            else:
                invocations.append({
                    "ok": True, "actual": actual, "error": None,
                    "ms": (time.perf_counter() - started) * 1000.0,
                })

    emit({"stdout": buffer.getvalue(), "invocations": invocations, "fatal": None})


try:
    main()
except Exception:
    emit({"stdout": "", "invocations": [], "fatal": short_error()})
'''


def run(code, test_cases, question_info, start_time):
    """Execute a Python submission against every test case in one process."""
    total_cases = len(test_cases or [])
    arity = wire.arity_of(question_info)
    cases = wire.build_cases(test_cases, arity)
    unordered = wire.is_unordered_question(question_info)

    work_dir = tempfile.mkdtemp(prefix="vireza_py_")
    try:
        with open(os.path.join(work_dir, "candidate.py"), "w", encoding="utf-8") as handle:
            handle.write(code)
        with open(os.path.join(work_dir, "harness.py"), "w", encoding="utf-8") as handle:
            handle.write(HARNESS)

        spec_path = os.path.join(work_dir, "spec.json")
        result_path = os.path.join(work_dir, "result.json")
        wire.write_json(spec_path, wire.build_spec(
            wire.function_name_of(question_info), cases, unordered))

        env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1", PYTHONIOENCODING="utf-8")
        try:
            proc = subprocess.run(
                [sys.executable, "-B", "harness.py", spec_path, result_path],
                cwd=work_dir, capture_output=True, text=True,
                encoding="utf-8", errors="replace", env=env,
                timeout=wire.timeout_seconds(total_cases, base=5.0, per_case=2.0),
            )
        except subprocess.TimeoutExpired:
            return wire.failure(
                "Time Limit Exceeded - your code did not finish within the "
                "allotted time. Check for infinite loops or very large inputs.",
                total_cases, language="python",
                runtime_ms=(time.time() - start_time) * 1000.0,
                toolchain={"interpreter": sys.executable},
            )

        if not os.path.isfile(result_path):
            detail = (proc.stderr or proc.stdout or "").strip()[:1500]
            return wire.failure(
                "The Python runner crashed before reporting results (exit code "
                "%s).%s" % (proc.returncode, "\n" + detail if detail else ""),
                total_cases, language="python",
                runtime_ms=(time.time() - start_time) * 1000.0,
                toolchain={"interpreter": sys.executable},
            )

        payload = wire.read_json(result_path)
        console_output = payload.get("stdout") or ""
        fatal = payload.get("fatal")
        invocations = payload.get("invocations") or []
        runtime_ms = sum(float(inv.get("ms") or 0.0) for inv in invocations)

        if fatal:
            return wire.failure(
                fatal, total_cases, language="python", runtime_ms=runtime_ms,
                console_output=console_output,
                toolchain={"interpreter": sys.executable},
            )

        results, _ = wire.grade(invocations, cases, unordered)
        return wire.make_response(
            success=True, error=None, test_results=results, total_cases=total_cases,
            runtime_ms=runtime_ms, compile_ms=0, console_output=console_output,
            language="python", toolchain={"interpreter": sys.executable},
        )
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
