"""C++ submission runner.

C++ has no reflection, so the runner parses the candidate's own source to find
the enclosing class and the method signature, then emits a driver that calls it
with correctly typed temporaries.

The signature is read from the source rather than from the question's
`argTypes`, because the two disagree in the bank: `numIslands` declares
`list[list[str]]` but its C++ stub actually takes `vector<vector<char>>`.

Generated code is C++11/14 only. The installed g++ is 6.3.0, which accepts
`-std=c++17` but ships a C++14-era library, so `std::optional`,
`std::string_view`, `std::variant` and structured bindings are all off limits.
"""

import os
import re
import shutil
import subprocess
import tempfile
import time

from . import wire
from .toolchain import resolve_any, tool_version

_CLASS_OPEN_RE = re.compile(
    r"\b(?:class|struct)\s+([A-Za-z_]\w*)"
    r"(?:\s+final)?"
    r"(?:\s*:[^{;]*)?"
    r"\s*\{"
)

# Canonical type key -> (converter for arguments, whether we can serialize it)
_CONVERTERS = {
    "int": "jInt",
    "longlong": "jLong",
    "double": "jDouble",
    "float": "jFloat",
    "bool": "jBool",
    "char": "jChar",
    "string": "jStr",
    "vector<int>": "jVecInt",
    "vector<longlong>": "jVecLong",
    "vector<double>": "jVecDouble",
    "vector<char>": "jVecChar",
    "vector<string>": "jVecStr",
    "vector<vector<int>>": "jVecVecInt",
    "vector<vector<char>>": "jVecVecChar",
    "vector<vector<string>>": "jVecVecStr",
}

# Fully qualified spelling for each canonical type. The driver declares its
# temporaries from this table rather than echoing the candidate's own text, so
# the harness still compiles for a submission that omits `using namespace std;`.
_STD_TYPES = {
    "int": "int",
    "longlong": "long long",
    "double": "double",
    "float": "float",
    "bool": "bool",
    "char": "char",
    "string": "std::string",
    "vector<int>": "std::vector<int>",
    "vector<longlong>": "std::vector<long long>",
    "vector<double>": "std::vector<double>",
    "vector<char>": "std::vector<char>",
    "vector<string>": "std::vector<std::string>",
    "vector<vector<int>>": "std::vector<std::vector<int> >",
    "vector<vector<char>>": "std::vector<std::vector<char> >",
    "vector<vector<string>>": "std::vector<std::vector<std::string> >",
}

# Fallback when the source cannot be parsed: derive types from question metadata.
_ARGTYPE_FALLBACK = {
    "int": "int", "float": "double", "double": "double",
    "str": "string", "string": "string",
    "bool": "bool", "boolean": "bool",
    "list[int]": "vector<int>", "list[str]": "vector<string>",
    "list[list[int]]": "vector<vector<int>>",
    "list[list[str]]": "vector<vector<string>>",
}

_RETURN_FALLBACK = dict(_ARGTYPE_FALLBACK)


class UnsupportedType(Exception):
    pass


# ---------------------------------------------------------------------------
# Source analysis
#
# Everything below runs on masked source: string literals, char literals and
# comments are blanked to spaces so a stray brace or identifier inside them
# cannot mislead the scanner. Offsets are preserved exactly, so positions found
# in the masked text can be applied to the original.
# ---------------------------------------------------------------------------

def mask_code(code):
    out = list(code or "")
    n = len(out)
    i = 0
    while i < n:
        ch = out[i]
        if ch == "/" and i + 1 < n and out[i + 1] == "/":
            end = code.find("\n", i)
            stop = n if end < 0 else end
            for j in range(i, stop):
                out[j] = " "
            i = stop
            continue
        if ch == "/" and i + 1 < n and out[i + 1] == "*":
            end = code.find("*/", i + 2)
            stop = n if end < 0 else end + 2
            for j in range(i, stop):
                if out[j] != "\n":
                    out[j] = " "
            i = stop
            continue
        if ch in "\"'":
            out[i] = " "
            j = i + 1
            while j < n:
                if out[j] == "\\":
                    out[j] = " "
                    if j + 1 < n and out[j + 1] != "\n":
                        out[j + 1] = " "
                    j += 2
                    continue
                closing = out[j] == ch
                if out[j] != "\n":
                    out[j] = " "
                j += 1
                if closing:
                    break
            i = j
            continue
        i += 1
    return "".join(out)


def _match_paren(text, open_index):
    depth = 0
    for i in range(open_index, len(text)):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return i
    return -1


def _class_braces(masked):
    """Map each class/struct opening-brace offset to its name."""
    return {m.end() - 1: m.group(1) for m in _CLASS_OPEN_RE.finditer(masked)}


def enclosing_class(masked, index, braces):
    """Innermost class/struct whose body contains `index`, else None."""
    stack = []
    for i in range(min(index, len(masked))):
        if masked[i] == "{":
            stack.append(braces.get(i))
        elif masked[i] == "}" and stack:
            stack.pop()
    return stack[-1] if stack else None


def normalize_type(raw):
    """Reduce a C++ type spelling to a canonical key for the converter table."""
    text = raw.strip()
    text = re.sub(r"\bconst\b", " ", text)
    text = text.replace("std::", "")
    text = text.replace("&&", "").replace("&", "")
    text = re.sub(r"\s+", "", text)
    text = text.replace("unsignedint", "int").replace("signedint", "int")
    text = text.replace("unsignedlonglong", "longlong").replace("longlong", "longlong")
    text = re.sub(r"^unsigned$", "int", text)
    text = text.replace("size_t", "longlong")
    if text in ("long", "int64_t", "longint"):
        text = "longlong"
    if text in ("int32_t", "short", "int16_t"):
        text = "int"
    if text in ("float32_t",):
        text = "double"
    if text in ("str", "std::string"):
        text = "string"
    return text


def _split_params(params_raw):
    parts = []
    depth = 0
    current = []
    for ch in params_raw:
        if ch in "<([":
            depth += 1
        elif ch in ">)]":
            depth = max(0, depth - 1)
        if ch == "," and depth == 0:
            parts.append("".join(current))
            current = []
        else:
            current.append(ch)
    parts.append("".join(current))
    return [p.strip() for p in parts if p.strip()]


def _split_type_and_name(param):
    """`vector<int>& nums` -> 'vector<int>'; `int target = 0` -> 'int'."""
    text = param.strip()
    if text in ("", "void"):
        return ""
    if "=" in text:
        text = text.split("=", 1)[0].strip()
    match = re.match(r"^(.*?)([A-Za-z_]\w*)$", text, re.DOTALL)
    if not match:
        return text
    head = match.group(1).strip()
    return head or text


def _is_declaration(masked, close_paren_index):
    """A definition/declaration is followed by `{`, `;`, `const`, `noexcept`
    or `override`; a call site is not distinguishable that way, so callers also
    reject matches whose preceding text ends in `.` or `->`."""
    tail = masked[close_paren_index + 1: close_paren_index + 40].lstrip()
    return bool(re.match(r"^(\{|;|const\b|noexcept\b|override\b|final\b|->)", tail))


def find_signature(masked, func_name, braces, arity):
    """Locate the candidate's definition of `func_name`.

    Returns (class_name, return_type_text, [param_type_text, ...], is_static)
    or None if nothing that looks like a declaration was found. When several
    overloads exist, the one matching `arity` wins.
    """
    first = None
    for match in re.finditer(r"\b" + re.escape(func_name) + r"\s*\(", masked):
        name_start = match.start()
        open_index = match.end() - 1
        close_index = _match_paren(masked, open_index)
        if close_index < 0:
            continue

        head = masked[:name_start].rstrip()
        if head.endswith(".") or head.endswith("->"):
            continue  # a call site, e.g. `sol.twoSum(...)`
        if not _is_declaration(masked, close_index):
            continue

        # Return type: the tokens on the declaration's own line. Fall back one
        # line further up for the rare `vector<int>\ntwoSum(...)` formatting.
        lines = head.splitlines()
        raw_line = lines[-1].strip() if lines else ""
        if not raw_line and len(lines) > 1:
            raw_line = lines[-2].strip()

        is_static = bool(re.search(r"\bstatic\b", raw_line))
        return_type = re.sub(r"\b(static|inline|virtual|explicit|constexpr)\b", " ", raw_line)
        return_type = re.sub(r"\s+", " ", return_type).strip()
        if not return_type or "=" in return_type or "return" in return_type:
            continue

        params = _split_params(masked[open_index + 1: close_index])
        param_types = [_split_type_and_name(p) for p in params]
        found = (enclosing_class(masked, name_start, braces), return_type,
                 param_types, is_static)
        if len(param_types) == arity:
            return found
        if first is None:
            first = found

    return first


def strip_candidate_main(code, masked):
    """Rename a candidate-supplied `main` so it cannot collide with the driver's.

    `-Dmain=...` is not an option here: it would rename the generated driver's
    entry point too. Positions come from the masked text but the edit is applied
    to the original, so string literals survive.
    """
    spans = []
    for match in re.finditer(r"\bmain\s*\(", masked):
        close_index = _match_paren(masked, match.end() - 1)
        if close_index >= 0 and _is_declaration(masked, close_index):
            spans.append((match.start(), match.start() + 4))

    if not spans:
        return code

    pieces = []
    cursor = 0
    for start, end in spans:
        pieces.append(code[cursor:start])
        pieces.append("vireza_candidate_main")
        cursor = end
    pieces.append(code[cursor:])
    return "".join(pieces)


def _fallback_signature(question_info, arity):
    arg_types = question_info.get("argTypes") or []
    params = []
    for raw in list(arg_types)[:arity]:
        mapped = _ARGTYPE_FALLBACK.get(str(raw).strip().lower())
        if not mapped:
            raise UnsupportedType(
                "Could not determine the C++ parameter type for declared argType "
                "'%s'. Supported: %s." % (raw, ", ".join(sorted(_ARGTYPE_FALLBACK))))
        params.append(mapped)
    while len(params) < arity:
        params.append("int")
    ret = _RETURN_FALLBACK.get(str(question_info.get("returnType", "")).strip().lower(), "int")
    return "Solution", ret, params, False


# ---------------------------------------------------------------------------
# Generated driver
# ---------------------------------------------------------------------------

PRELUDE = r'''
// ---- generated OA harness (do not edit) ----
#include <algorithm>
#include <cctype>
#include <climits>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <chrono>
#include <deque>
#include <fstream>
#include <functional>
#include <iostream>
#include <list>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <string>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>

namespace vireza {

struct JVal {
    enum Kind { NUL, BOOL, NUM, STR, ARR, OBJ } kind;
    bool b;
    double num;
    std::string str;
    std::vector<JVal> arr;
    std::map<std::string, JVal> obj;

    JVal() : kind(NUL), b(false), num(0.0) {}
    static JVal nul() { return JVal(); }
    static JVal boolean(bool v) { JVal j; j.kind = BOOL; j.b = v; return j; }
    static JVal number(double v) { JVal j; j.kind = NUM; j.num = v; return j; }
    static JVal string(const std::string& v) { JVal j; j.kind = STR; j.str = v; return j; }
    static JVal array(const std::vector<JVal>& v) { JVal j; j.kind = ARR; j.arr = v; return j; }

    const std::vector<JVal>& items() const {
        static const std::vector<JVal> empty;
        return kind == ARR ? arr : empty;
    }
    double asNumber() const {
        if (kind == NUM) return num;
        if (kind == BOOL) return b ? 1.0 : 0.0;
        if (kind == STR) return std::atof(str.c_str());
        return 0.0;
    }
    bool asBool() const {
        if (kind == BOOL) return b;
        if (kind == NUM) return num != 0.0;
        if (kind == STR) return str == "true" || str == "1";
        return false;
    }
    std::string asString() const {
        if (kind == STR) return str;
        if (kind == BOOL) return b ? "true" : "false";
        if (kind == NUM) return writeNumber(num);
        return "";
    }
    static std::string writeNumber(double d) {
        if (std::isfinite(d) && d == std::floor(d) && std::fabs(d) < 1e15) {
            std::ostringstream oss;
            oss << static_cast<long long>(d);
            return oss.str();
        }
        std::ostringstream oss;
        oss.precision(15);
        oss << d;
        return oss.str();
    }
};

struct Parser {
    const std::string& s;
    size_t i;
    explicit Parser(const std::string& text) : s(text), i(0) {}

    void ws() { while (i < s.size() && std::isspace(static_cast<unsigned char>(s[i]))) ++i; }

    JVal value() {
        ws();
        if (i >= s.size()) return JVal::nul();
        char c = s[i];
        if (c == '{') return object();
        if (c == '[') return array();
        if (c == '"') return JVal::string(string());
        if (c == 't') { i += 4; return JVal::boolean(true); }
        if (c == 'f') { i += 5; return JVal::boolean(false); }
        if (c == 'n') { i += 4; return JVal::nul(); }
        return number();
    }

    JVal object() {
        std::map<std::string, JVal> out;
        ++i;
        ws();
        if (i < s.size() && s[i] == '}') { ++i; JVal j; j.kind = JVal::OBJ; j.obj = out; return j; }
        while (i < s.size()) {
            ws();
            std::string key = string();
            ws();
            if (i < s.size() && s[i] == ':') ++i;
            out[key] = value();
            ws();
            if (i < s.size() && s[i] == ',') { ++i; continue; }
            if (i < s.size() && s[i] == '}') { ++i; break; }
            break;
        }
        JVal j; j.kind = JVal::OBJ; j.obj = out; return j;
    }

    JVal array() {
        std::vector<JVal> out;
        ++i;
        ws();
        if (i < s.size() && s[i] == ']') { ++i; return JVal::array(out); }
        while (i < s.size()) {
            out.push_back(value());
            ws();
            if (i < s.size() && s[i] == ',') { ++i; continue; }
            if (i < s.size() && s[i] == ']') { ++i; break; }
            break;
        }
        return JVal::array(out);
    }

    std::string string() {
        std::string out;
        if (i < s.size() && s[i] == '"') ++i;
        while (i < s.size()) {
            char c = s[i++];
            if (c == '"') break;
            if (c == '\\' && i < s.size()) {
                char e = s[i++];
                if (e == 'n') out += '\n';
                else if (e == 't') out += '\t';
                else if (e == 'r') out += '\r';
                else if (e == 'b') out += '\b';
                else if (e == 'f') out += '\f';
                else if (e == 'u' && i + 4 <= s.size()) {
                    out += static_cast<char>(std::strtol(s.substr(i, 4).c_str(), 0, 16));
                    i += 4;
                } else out += e;
            } else {
                out += c;
            }
        }
        return out;
    }

    JVal number() {
        size_t start = i;
        while (i < s.size() && std::strchr("+-0123456789.eE", s[i])) ++i;
        std::string tok = s.substr(start, i - start);
        if (tok.empty()) return JVal::number(0.0);
        return JVal::number(std::atof(tok.c_str()));
    }
};

std::string escape(const std::string& text) {
    std::string out;
    for (size_t k = 0; k < text.size(); ++k) {
        char c = text[k];
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else if (static_cast<unsigned char>(c) < 0x20) {
            char buf[8];
            std::snprintf(buf, sizeof(buf), "\\u%04x", c);
            out += buf;
        } else out += c;
    }
    return out;
}

std::string dump(const JVal& v) {
    std::ostringstream oss;
    switch (v.kind) {
        case JVal::NUL: oss << "null"; break;
        case JVal::BOOL: oss << (v.b ? "true" : "false"); break;
        case JVal::NUM: oss << JVal::writeNumber(v.num); break;
        case JVal::STR: oss << '"' << escape(v.str) << '"'; break;
        case JVal::ARR: {
            oss << '[';
            for (size_t k = 0; k < v.arr.size(); ++k) {
                if (k) oss << ',';
                oss << dump(v.arr[k]);
            }
            oss << ']';
            break;
        }
        case JVal::OBJ: {
            oss << '{';
            bool first = true;
            for (std::map<std::string, JVal>::const_iterator it = v.obj.begin();
                 it != v.obj.end(); ++it) {
                if (!first) oss << ',';
                first = false;
                oss << '"' << escape(it->first) << "\":" << dump(it->second);
            }
            oss << '}';
            break;
        }
    }
    return oss.str();
}

// ---- argument converters ----

int jInt(const JVal& v) { return static_cast<int>(v.asNumber()); }
long long jLong(const JVal& v) { return static_cast<long long>(v.asNumber()); }
double jDouble(const JVal& v) { return v.asNumber(); }
float jFloat(const JVal& v) { return static_cast<float>(v.asNumber()); }
bool jBool(const JVal& v) { return v.asBool(); }
char jChar(const JVal& v) { std::string s = v.asString(); return s.empty() ? '\0' : s[0]; }
std::string jStr(const JVal& v) { return v.asString(); }

std::vector<char> jVecChar(const JVal& v) {
    std::vector<char> out;
    if (v.kind == JVal::STR) {
        for (size_t k = 0; k < v.str.size(); ++k) out.push_back(v.str[k]);
        return out;
    }
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jChar(items[k]));
    return out;
}

std::vector<int> jVecInt(const JVal& v) {
    std::vector<int> out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jInt(items[k]));
    return out;
}

std::vector<long long> jVecLong(const JVal& v) {
    std::vector<long long> out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jLong(items[k]));
    return out;
}

std::vector<double> jVecDouble(const JVal& v) {
    std::vector<double> out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jDouble(items[k]));
    return out;
}

std::vector<std::string> jVecStr(const JVal& v) {
    std::vector<std::string> out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jStr(items[k]));
    return out;
}

std::vector<std::vector<int> > jVecVecInt(const JVal& v) {
    std::vector<std::vector<int> > out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jVecInt(items[k]));
    return out;
}

std::vector<std::vector<char> > jVecVecChar(const JVal& v) {
    std::vector<std::vector<char> > out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jVecChar(items[k]));
    return out;
}

std::vector<std::vector<std::string> > jVecVecStr(const JVal& v) {
    std::vector<std::vector<std::string> > out;
    const std::vector<JVal>& items = v.items();
    for (size_t k = 0; k < items.size(); ++k) out.push_back(jVecStr(items[k]));
    return out;
}

// ---- result serializers ----
// bool and char are integral too, but a non-template overload is an exact match
// and is preferred over the SFINAE templates below.

JVal toJ(bool v) { return JVal::boolean(v); }
JVal toJ(char v) { return JVal::string(std::string(1, v)); }
JVal toJ(const std::string& v) { return JVal::string(v); }
JVal toJ(const char* v) { return JVal::string(std::string(v ? v : "")); }

template <typename T>
typename std::enable_if<std::is_integral<T>::value, JVal>::type
toJ(T v) { return JVal::number(static_cast<double>(v)); }

template <typename T>
typename std::enable_if<std::is_floating_point<T>::value, JVal>::type
toJ(T v) { return JVal::number(static_cast<double>(v)); }

template <typename T>
JVal toJ(const std::vector<T>& v) {
    std::vector<JVal> out;
    out.reserve(v.size());
    for (size_t k = 0; k < v.size(); ++k) out.push_back(toJ(v[k]));
    return JVal::array(out);
}

std::string read_file(const std::string& path) {
    std::ifstream handle(path.c_str(), std::ios::binary);
    if (!handle) throw std::runtime_error("cannot open " + path);
    std::ostringstream oss;
    oss << handle.rdbuf();
    return oss.str();
}

void write_file(const std::string& path, const std::string& text) {
    std::ofstream handle(path.c_str(), std::ios::binary | std::ios::trunc);
    handle << text;
    handle.flush();
}

std::string shortError(const std::exception& e) {
    std::string what = e.what();
    if (what.size() > 400) what = what.substr(0, 400);
    return what;
}

}  // namespace vireza
// ---- end generated harness prelude ----
'''


def _converter_for(param_type_text):
    key = normalize_type(param_type_text)
    if key not in _CONVERTERS:
        raise UnsupportedType(
            "Unsupported C++ parameter type '%s'. The runner supports: %s."
            % (param_type_text.strip(), ", ".join(sorted(_CONVERTERS))))
    return _CONVERTERS[key], key


def _check_return_supported(return_type_text):
    key = normalize_type(return_type_text)
    if key == "void":
        return "void"
    if key not in _CONVERTERS:
        raise UnsupportedType(
            "Unsupported C++ return type '%s'. The runner can serialize: %s and void."
            % (return_type_text.strip(), ", ".join(sorted(_CONVERTERS))))
    return key


def _build_main(class_name, func_name, return_key, param_types, is_static):
    """Emit the driver's main(): one process runs every test case, flushing
    results after each so a crash on case N still preserves cases 1..N-1."""
    lines = []
    lines.append("int main(int argc, char** argv) {")
    lines.append("    using namespace vireza;")
    lines.append("    std::string specPath = argc > 1 ? argv[1] : \"spec.json\";")
    lines.append("    std::string outPath  = argc > 2 ? argv[2] : \"result.json\";")
    lines.append("    std::vector<JVal> invocations;")
    lines.append("    try {")
    lines.append("        std::string specText = read_file(specPath);")
    lines.append("        JVal spec = Parser(specText).value();")
    resolved = [_converter_for(param) for param in param_types]
    for idx, (_converter, key) in enumerate(resolved):
        lines.append("        typedef %s T%d;" % (_STD_TYPES[key], idx))
    lines.append("        const std::vector<JVal>& caseList = spec.obj.at(\"cases\").items();")
    lines.append("        for (size_t c = 0; c < caseList.size(); ++c) {")
    lines.append("            const JVal& specCase = caseList[c];")
    lines.append("            const std::vector<JVal>& args = specCase.obj.at(\"args\").items();")
    lines.append("            JVal inv; inv.kind = JVal::OBJ;")
    lines.append("            auto started = std::chrono::steady_clock::now();")
    lines.append("            try {")
    for idx, (converter, _key) in enumerate(resolved):
        lines.append("                T%d a%d = %s(args.size() > %d ? args[%d] : JVal());"
                     % (idx, idx, converter, idx, idx))
    arg_list = ", ".join("a%d" % i for i in range(len(param_types)))
    if is_static and class_name:
        call = "%s::%s(%s)" % (class_name, func_name, arg_list)
    elif class_name:
        lines.append("                %s vireza_instance;" % class_name)
        call = "vireza_instance.%s(%s)" % (func_name, arg_list)
    else:
        call = "%s(%s)" % (func_name, arg_list)

    if return_key == "void":
        lines.append("                %s;" % call)
        lines.append("                JVal actual = JVal::nul();")
    else:
        lines.append("                JVal actual = toJ(%s);" % call)
    lines.append("                double ms = std::chrono::duration<double, std::milli>(")
    lines.append("                    std::chrono::steady_clock::now() - started).count();")
    lines.append("                inv.obj[\"ok\"] = JVal::boolean(true);")
    lines.append("                inv.obj[\"actual\"] = actual;")
    lines.append("                inv.obj[\"error\"] = JVal::nul();")
    lines.append("                inv.obj[\"ms\"] = JVal::number(ms);")
    lines.append("            } catch (const std::exception& e) {")
    lines.append("                double ms = std::chrono::duration<double, std::milli>(")
    lines.append("                    std::chrono::steady_clock::now() - started).count();")
    lines.append("                inv.obj[\"ok\"] = JVal::boolean(false);")
    lines.append("                inv.obj[\"actual\"] = JVal::nul();")
    lines.append("                inv.obj[\"error\"] = JVal::string(shortError(e));")
    lines.append("                inv.obj[\"ms\"] = JVal::number(ms);")
    lines.append("            } catch (...) {")
    lines.append("                inv.obj[\"ok\"] = JVal::boolean(false);")
    lines.append("                inv.obj[\"actual\"] = JVal::nul();")
    lines.append("                inv.obj[\"error\"] = JVal::string(\"Unknown C++ exception\");")
    lines.append("                inv.obj[\"ms\"] = JVal::number(0.0);")
    lines.append("            }")
    lines.append("            invocations.push_back(inv);")
    # Flush after every case: a segfault on a later case must not erase earlier results.
    lines.append("            JVal partial; partial.kind = JVal::OBJ;")
    lines.append("            partial.obj[\"invocations\"] = JVal::array(invocations);")
    lines.append("            write_file(outPath, dump(partial));")
    lines.append("        }")
    lines.append("    } catch (const std::exception& e) {")
    lines.append("        JVal fatal; fatal.kind = JVal::OBJ;")
    lines.append("        fatal.obj[\"invocations\"] = JVal::array(invocations);")
    lines.append("        fatal.obj[\"fatal\"] = JVal::string(shortError(e));")
    lines.append("        write_file(outPath, dump(fatal));")
    lines.append("        return 0;")
    lines.append("    }")
    lines.append("    return 0;")
    lines.append("}")
    return "\n".join(lines)


def run(code, test_cases, question_info, start_time):
    total_cases = len(test_cases or [])
    compiler = resolve_any("g++", "clang++")
    toolchain = {"compiler": compiler, "version": tool_version(compiler)}

    if not compiler:
        return wire.failure(
            "C++ compiler (g++ or clang++) not available on this server. Install "
            "MinGW-w64 or MSYS2 and ensure g++.exe is reachable, then restart the "
            "AI service.",
            total_cases, language="cpp",
            runtime_ms=(time.time() - start_time) * 1000.0, toolchain=toolchain,
        )

    arity = wire.arity_of(question_info)
    func_name = wire.function_name_of(question_info)
    cases = wire.build_cases(test_cases, arity)
    unordered = wire.is_unordered_question(question_info)

    masked = mask_code(code or "")
    signature = find_signature(masked, func_name, _class_braces(masked), arity)
    used_fallback = False
    if signature is None:
        if not re.search(r"\b" + re.escape(func_name) + r"\b", masked):
            return wire.failure(
                "Could not find a definition of '%s' in your C++ code. Implement it "
                "using the signature from the starter code." % func_name,
                total_cases, language="cpp",
                runtime_ms=(time.time() - start_time) * 1000.0, toolchain=toolchain,
            )
        try:
            signature = _fallback_signature(question_info, arity)
            used_fallback = True
        except UnsupportedType as exc:
            return wire.failure(
                "Could not find a definition of '%s' in your C++ code, and the "
                "question metadata is not usable as a fallback: %s" % (func_name, exc),
                total_cases, language="cpp",
                runtime_ms=(time.time() - start_time) * 1000.0, toolchain=toolchain,
            )

    class_name, return_type, param_types, is_static = signature

    if len(param_types) != arity:
        return wire.failure(
            "Your '%s' takes %d parameter(s) but this question supplies %d. Keep the "
            "original signature: %s(%s)."
            % (func_name, len(param_types), arity, return_type or "auto",
               ", ".join(param_types) or "..."),
            total_cases, language="cpp",
            runtime_ms=(time.time() - start_time) * 1000.0, toolchain=toolchain,
        )

    try:
        return_key = _check_return_supported(return_type)
        for param in param_types:
            _converter_for(param)
    except UnsupportedType as exc:
        return wire.failure(str(exc), total_cases, language="cpp",
                            runtime_ms=(time.time() - start_time) * 1000.0,
                            toolchain=toolchain)

    work_dir = tempfile.mkdtemp(prefix="vireza_cpp_")
    try:
        source = strip_candidate_main(code or "", masked)
        driver_main = _build_main(class_name, func_name, return_key, param_types, is_static)
        # Prelude first: the stubs only include <vector>/<string>, but real
        # solutions reach for <algorithm>, <map>, <queue> and friends.
        # The #line directives keep diagnostics pointing at the candidate's own
        # file and line numbers instead of offsets into this combined unit.
        combined = "\n".join([
            PRELUDE,
            '#line 1 "candidate.cpp"',
            source,
            '#line 1 "vireza_harness.cpp"',
            driver_main,
            "",
        ])

        src_path = os.path.join(work_dir, "submission.cpp")
        exe_path = os.path.join(work_dir, "submission.exe" if os.name == "nt" else "submission")
        with open(src_path, "w", encoding="utf-8") as handle:
            handle.write(combined)

        spec_path = os.path.join(work_dir, "spec.json")
        result_path = os.path.join(work_dir, "result.json")
        wire.write_json(spec_path, wire.build_spec(func_name, cases, unordered))

        compile_started = time.perf_counter()
        try:
            compile_proc = subprocess.run(
                [compiler, src_path, "-o", exe_path, "-std=c++17", "-O0", "-w"],
                cwd=work_dir, capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=60,
            )
        except subprocess.TimeoutExpired:
            return wire.failure(
                "C++ compilation timed out after 60s.", total_cases, language="cpp",
                compile_ms=(time.perf_counter() - compile_started) * 1000.0,
                toolchain=toolchain,
            )
        compile_ms = (time.perf_counter() - compile_started) * 1000.0

        if compile_proc.returncode != 0:
            stderr = (compile_proc.stderr or "").strip()
            return wire.failure(
                "C++ compilation error:\n%s" % (stderr[:2500] or "no details"),
                total_cases, language="cpp", compile_ms=compile_ms, toolchain=toolchain,
            )

        try:
            proc = subprocess.run(
                [exe_path, spec_path, result_path],
                cwd=work_dir, capture_output=True, text=True,
                encoding="utf-8", errors="replace",
                timeout=wire.timeout_seconds(total_cases, base=5.0, per_case=2.0),
            )
        except subprocess.TimeoutExpired:
            return wire.failure(
                "Time Limit Exceeded - your C++ code did not finish within the "
                "allotted time. Check for infinite loops.",
                total_cases, language="cpp", compile_ms=compile_ms, toolchain=toolchain,
            )

        console_output = (proc.stdout or "")[:50000]

        if not os.path.isfile(result_path):
            detail = ""
            if proc.returncode != 0:
                detail = (" Your program exited with code %d, which usually means a "
                          "crash (segmentation fault, out-of-bounds access or a "
                          "null dereference)." % proc.returncode)
            return wire.failure(
                "The C++ runner produced no results.%s" % detail,
                total_cases, language="cpp", compile_ms=compile_ms,
                console_output=console_output, toolchain=toolchain,
            )

        payload = wire.read_json(result_path)
        fatal = payload.get("fatal")
        invocations = payload.get("invocations") or []
        runtime_ms = sum(float(inv.get("ms") or 0.0) for inv in invocations)

        if fatal:
            return wire.failure(
                fatal, total_cases, language="cpp", compile_ms=compile_ms,
                console_output=console_output, toolchain=toolchain,
            )

        if len(invocations) < total_cases and proc.returncode != 0:
            results, _ = wire.grade(invocations, cases, unordered)
            return wire.make_response(
                success=False,
                error=("Your program crashed while running test case %d of %d. This is "
                       "usually an out-of-bounds access, a null dereference or a stack "
                       "overflow from unbounded recursion. Cases that finished before "
                       "the crash are shown below."
                       % (len(invocations) + 1, total_cases)),
                test_results=results,
                total_cases=total_cases,
                runtime_ms=runtime_ms,
                compile_ms=compile_ms,
                console_output=console_output,
                language="cpp",
                toolchain=dict(toolchain, signature_parsed=not used_fallback),
            )

        results, _ = wire.grade(invocations, cases, unordered)
        return wire.make_response(
            success=True, error=None, test_results=results, total_cases=total_cases,
            runtime_ms=runtime_ms, compile_ms=compile_ms, console_output=console_output,
            language="cpp", toolchain=dict(toolchain, signature_parsed=not used_fallback),
        )
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
