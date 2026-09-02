"""Verification matrix for the OA code execution engine.

Run from backend/:

    python -m oa.tests.test_code_runner

Exits non-zero if any check fails. Every case in here either failed outright
before the runner rewrite or could not be exercised at all.
"""

import os
import sys
import time

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from oa.code_runner import run_candidate_code  # noqa: E402
from oa.gemini_generator import QUESTION_BANK  # noqa: E402
from oa.runner import wire  # noqa: E402
from oa.scoring_engine import calculate_oa_objective_score  # noqa: E402
from oa.tests.solutions import LANGUAGES, SOLUTIONS  # noqa: E402

RESULTS = []
STARTED = time.time()


def section(title):
    print("\n" + title)
    print("-" * len(title))


def check(name, condition, detail=""):
    RESULTS.append((name, bool(condition)))
    status = "pass" if condition else "FAIL"
    line = "  [%s] %s" % (status, name)
    if detail and not condition:
        line += "\n         %s" % detail
    print(line)
    return bool(condition)


def question(function_name):
    for entry in QUESTION_BANK:
        if entry.get("functionName") == function_name:
            return entry
    raise AssertionError("no QUESTION_BANK entry for %s" % function_name)


def all_cases(q):
    return q["testCases"]["public"] + q["testCases"]["hidden"]


def execute(language, code, q, cases=None):
    return run_candidate_code(language, code, cases if cases is not None else all_cases(q), q)


def summarize(res):
    return "success=%s passed=%s/%s error=%s" % (
        res["success"], res["totalPassed"], res["totalCases"],
        (res.get("error") or "")[:400])


# ===========================================================================
# 1. Regressions that failed before the rewrite
# ===========================================================================

def test_regressions():
    section("1. Regressions that must now pass")
    q = question("twoSum")

    res = execute("cpp", SOLUTIONS["twoSum"]["cpp"]["correct"], q)
    check("C++ correct twoSum compiles and passes (was: WinMain link error)",
          res["success"] and res["totalPassed"] == res["totalCases"], summarize(res))

    res = execute("java", SOLUTIONS["twoSum"]["java"]["correct"], q)
    check("Java correct twoSum passes (was: 'Main method not found')",
          res["success"] and res["totalPassed"] == res["totalCases"], summarize(res))

    tuple_code = ("def twoSum(nums, target):\n"
                  "    for i in range(len(nums)):\n"
                  "        for j in range(i + 1, len(nums)):\n"
                  "            if nums[i] + nums[j] == target:\n"
                  "                return (i, j)\n"
                  "    return ()\n")
    res = execute("python", tuple_code, q)
    check("Python tuple (0, 1) equals expected '[0, 1]' (was: string compare)",
          res["success"] and res["totalPassed"] == res["totalCases"], summarize(res))

    one_case = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}]

    printing_code = ("def twoSum(nums, target):\n"
                     "    print('debugging', nums)\n"
                     "    return [0, 1]\n")
    res = execute("python", printing_code, q, one_case)
    check("Python print() no longer corrupts the result channel",
          res["success"] and res["totalPassed"] == 1, summarize(res))
    check("Python print() is surfaced as consoleOutput",
          "debugging" in (res.get("consoleOutput") or ""),
          repr(res.get("consoleOutput")))

    float_code = "def search(nums, target):\n    return 4.0\n"
    search_q = question("search")
    res = execute("python", float_code, search_q,
                  [{"input": "[-1,0,3,5,9,12]\n9", "expected": "4"}])
    check("Python 4.0 equals expected '4' (was: string compare)",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    class_code = ("class Solution:\n"
                  "    def twoSum(self, nums, target):\n"
                  "        return [0, 1]\n")
    res = execute("python", class_code, q, one_case)
    check("Python class-based submission is called, not instantiated",
          res["success"] and res["totalPassed"] == 1, summarize(res))


# ===========================================================================
# 2. Cross-language parity matrix
# ===========================================================================

def test_parity_matrix():
    section("2. Parity matrix: 6 questions x 3 languages x {correct, wrong, stub}")
    for func_name, per_lang in SOLUTIONS.items():
        q = question(func_name)
        cases = all_cases(q)
        correct_counts = set()

        for variant in ("correct", "wrong"):
            counts = {}
            for language in LANGUAGES:
                res = execute(language, per_lang[language][variant], q, cases)
                counts[language] = res["totalPassed"]
                if variant == "correct":
                    correct_counts.add(res["totalPassed"])
                    if not res["success"]:
                        print("      %s/%s -> %s" % (func_name, language, summarize(res)))

            check("%s [%s]: identical pass count in all 3 languages" % (func_name, variant),
                  len(set(counts.values())) == 1, str(counts))

        check("%s: a correct solution passes all %d cases" % (func_name, len(cases)),
              correct_counts == {len(cases)}, "pass counts seen: %s" % correct_counts)

        # The bank's starter code is not the same logic in every language
        # (Python `pass` returns None, Java returns `false`), so the guarantee
        # here is weaker: an untouched editor must still produce a full set of
        # per-case results rather than a toolchain error or a crash.
        for language in LANGUAGES:
            stub = q.get("starterCode", {}).get(language, "")
            res = execute(language, stub, q, cases)
            check("%s [stub] %s runs to completion" % (func_name, language),
                  len(res.get("testResults") or []) == len(cases), summarize(res))


# ===========================================================================
# 3. Error paths must report, never crash or fabricate a grade
# ===========================================================================

def test_error_paths():
    section("3. Error paths")
    q = question("twoSum")
    cases = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}]

    res = execute("python", "def twoSum(nums, target\n    return [0, 1]\n", q, cases)
    check("Python SyntaxError -> success False with a readable error",
          res["success"] is False and bool(res["error"]), summarize(res))

    res = execute("python", "def twoSum(nums, target):\n    return nums[999]\n", q, cases)
    check("Python IndexError -> per-case error, run still reports",
          res["success"] and res["totalPassed"] == 0
          and res["testResults"][0]["error"], summarize(res))

    res = execute("java", "class Solution {\n  public int[] twoSum(int[] n, int t) {\n"
                          "    this is not java\n  }\n}\n", q, cases)
    check("Java compile error -> success False",
          res["success"] is False and "error" in str(res["error"]).lower(), summarize(res))

    res = execute("java", "class Solution {\n  public int[] twoSum(int[] n, int t) {\n"
                          "    throw new IllegalStateException(\"boom\");\n  }\n}\n", q, cases)
    check("Java thrown exception -> per-case error naming the cause",
          res["success"] and res["totalPassed"] == 0
          and "boom" in str(res["testResults"][0]["error"]), summarize(res))

    res = execute("cpp", "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n"
                         "  vector<int> twoSum(vector<int>& n, int t) {\n"
                         "    this is not c++\n  }\n};\n", q, cases)
    check("C++ compile error -> success False, points at candidate.cpp",
          res["success"] is False and "candidate.cpp" in (res["error"] or ""), summarize(res))

    res = execute("cpp", "#include <stdexcept>\n#include <vector>\nusing namespace std;\n"
                         "class Solution {\npublic:\n"
                         "  vector<int> twoSum(vector<int>& n, int t) {\n"
                         "    throw std::runtime_error(\"boom\");\n  }\n};\n", q, cases)
    check("C++ thrown exception -> per-case error naming the cause",
          res["success"] and res["totalPassed"] == 0
          and "boom" in str(res["testResults"][0]["error"]), summarize(res))

    res = execute("cpp", "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n"
                         "  set<int> twoSum(vector<int>& n, int t) { return set<int>(); }\n};\n",
                  q, cases)
    check("Unsupported C++ return type -> clear diagnostic, no template cascade",
          res["success"] is False and "Unsupported C++ return type" in (res["error"] or ""),
          summarize(res))

    res = execute("cpp", "", q, cases)
    check("Empty C++ submission -> rejected before any compile is attempted",
          res["success"] is False and "No code provided" in (res["error"] or "")
          and res["compileMs"] == 0, summarize(res))

    res = execute("cpp", "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n"
                         "  vector<int> otherMethod(vector<int>& n) { return n; }\n};\n", q, cases)
    check("C++ submission missing the target function -> names it, no compile attempted",
          res["success"] is False and "Could not find a definition" in (res["error"] or "")
          and "twoSum" in (res["error"] or "") and res["compileMs"] == 0, summarize(res))

    res = run_candidate_code("brainfuck", "+++", cases, q)
    check("Unsupported language -> clear diagnostic",
          res["success"] is False and "Unsupported language" in (res["error"] or ""),
          summarize(res))


def test_crash_preserves_earlier_results():
    section("4. Crash mid-run preserves earlier results")
    q = question("twoSum")
    cases = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"},
             {"input": "[1, 2]\n3", "expected": "[0, 1]"}]
    crashing = """
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        if (nums.size() > 2) { vector<int> o; o.push_back(0); o.push_back(1); return o; }
        int* p = 0;
        return vector<int>(1, *p);
    }
};
"""
    res = execute("cpp", crashing, q, cases)
    check("C++ segfault on case 2 keeps case 1's passing result",
          res["success"] is False and res["totalPassed"] == 1
          and len(res["testResults"]) == 2, summarize(res))


# ===========================================================================
# 5. Timeouts
# ===========================================================================

def test_timeouts():
    section("5. Infinite loops hit the time limit")
    q = question("twoSum")
    cases = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}]

    for language, code in (
        ("python", "def twoSum(nums, target):\n    while True:\n        pass\n"),
        ("java", "class Solution {\n  public int[] twoSum(int[] n, int t) {\n"
                 "    while (true) {}\n  }\n}\n"),
        ("cpp", "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n"
                "  vector<int> twoSum(vector<int>& n, int t) { while (true) {} }\n};\n"),
    ):
        res = execute(language, code, q, cases)
        check("%s infinite loop -> time limit, not a hang" % language,
              res["success"] is False and "Time Limit Exceeded" in (res["error"] or ""),
              summarize(res))


# ===========================================================================
# 6. Language-specific shapes
# ===========================================================================

def test_java_shapes():
    section("6. Java-specific shapes")
    q = question("twoSum")
    cases = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}]

    res = execute("java", "class Solution {\n"
                          "  public static int[] twoSum(int[] n, int t) { return new int[]{0, 1}; }\n"
                          "}\n", q, cases)
    check("static method invoked without an instance",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    res = execute("java", "class RenamedByCandidate {\n"
                          "  public int[] twoSum(int[] n, int t) { return new int[]{0, 1}; }\n"
                          "}\n", q, cases)
    check("candidate-renamed class still located",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    res = execute("java", "class Solution {\n"
                          "  public int[] twoSum(int[] n, int t) { return new int[]{0, 1}; }\n"
                          "  public static void main(String[] a) { System.out.println(\"ignored\"); }\n"
                          "}\n", q, cases)
    check("candidate-added main() is ignored, not executed",
          res["success"] and res["totalPassed"] == 1
          and "ignored" not in (res.get("consoleOutput") or ""), summarize(res))

    res = execute("java", "class Solution {\n"
                          "  public int[] twoSum(int[] n) { return new int[]{-1}; }\n"
                          "  public int[] twoSum(int[] n, int t) { return new int[]{0, 1}; }\n"
                          "}\n", q, cases)
    check("overloaded method resolves to the matching arity",
          res["success"] and res["totalPassed"] == 1, summarize(res))


def test_cpp_shapes():
    section("7. C++-specific shapes")
    q = question("twoSum")
    cases = [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}]

    res = execute("cpp", "#include <cstdio>\n#include <vector>\nusing namespace std;\n"
                         "class Solution {\npublic:\n"
                         "  vector<int> twoSum(vector<int>& n, int t) { return {0, 1}; }\n};\n"
                         "int main() { printf(\"ignored\"); return 0; }\n", q, cases)
    check("candidate-added main() renamed away, driver entry point wins",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    res = execute("cpp", "class Solution {\npublic:\n"
                         "  std::vector<int> twoSum(const std::vector<int>& n, int t) {\n"
                         "    return std::vector<int>{0, 1};\n  }\n};\n", q, cases)
    check("const-ref + std::-qualified signature parsed",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    res = execute("cpp", "std::vector<int> twoSum(std::vector<int>& n, int t) { return {0, 1}; }\n",
                  q, cases)
    check("free function with no enclosing class",
          res["success"] and res["totalPassed"] == 1, summarize(res))

    islands = question("numIslands")
    res = execute("cpp", SOLUTIONS["numIslands"]["cpp"]["correct"], islands)
    check("vector<vector<char>> grid converted from JSON strings",
          res["success"] and res["totalPassed"] == res["totalCases"], summarize(res))

    # The driver must declare its temporaries with fully qualified types, not
    # echo the candidate's spelling, or this submission cannot compile.
    qualified = """
class Solution {
public:
    int numIslands(std::vector<std::vector<char>>& grid) {
        int count = 0;
        for (size_t r = 0; r < grid.size(); ++r) {
            for (size_t c = 0; c < grid[r].size(); ++c) {
                if (grid[r][c] != '1') continue;
                ++count;
                std::vector<std::pair<size_t, size_t>> stack;
                stack.push_back(std::make_pair(r, c));
                grid[r][c] = '0';
                while (!stack.empty()) {
                    std::pair<size_t, size_t> cur = stack.back();
                    stack.pop_back();
                    const int dr[4] = {-1, 1, 0, 0};
                    const int dc[4] = {0, 0, -1, 1};
                    for (int k = 0; k < 4; ++k) {
                        long nr = static_cast<long>(cur.first) + dr[k];
                        long nc = static_cast<long>(cur.second) + dc[k];
                        if (nr < 0 || nc < 0 || nr >= (long)grid.size()
                            || nc >= (long)grid[nr].size()) continue;
                        if (grid[nr][nc] != '1') continue;
                        grid[nr][nc] = '0';
                        stack.push_back(std::make_pair(static_cast<size_t>(nr),
                                                       static_cast<size_t>(nc)));
                    }
                }
            }
        }
        return count;
    }
};
"""
    res = execute("cpp", qualified, islands)
    check("std::-qualified grid solution with no `using namespace std;` still compiles",
          res["success"] and res["totalPassed"] == res["totalCases"], summarize(res))

    res = execute("cpp", "#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n"
                         "  vector<int> twoSum(vector<int>& n, int t) {\n"
                         "    vector<int> out; out.push_back(0); out.push_back(1); return out;\n"
                         "  }\n"
                         "  int twoSum(int n) { return n; }\n};\n", q, cases)
    check("C++ overload resolves to the matching arity",
          res["success"] and res["totalPassed"] == 1, summarize(res))


# ===========================================================================
# 8. Argument parsing
# ===========================================================================

def test_arg_parsing():
    section("8. Test-case input parsing")
    for label, raw, arity, expected in (
        ("newline separated", "[2,7]\n9", 2, [[2, 7], 9]),
        ("named arguments", "nums = [2,7]\ntarget = 9", 2, [[2, 7], 9]),
        ("comma separated on one line", "[2,7], 9", 2, [[2, 7], 9]),
        ("quoted string containing '='", '"a=b"', 1, ["a=b"]),
        ("bare string containing '='", "a=b", 1, ["a=b"]),
        ("nested lists", '[["1","0"],["0","1"]]', 1, [[["1", "0"], ["0", "1"]]]),
        ("quoted string argument", '"abcabcbb"', 1, ["abcabcbb"]),
        ("boolean", "true", 1, [True]),
    ):
        got = wire.parse_args(raw, arity)
        check("parse_args: %s" % label, got == expected, "got %r want %r" % (got, expected))

    q = question("twoSum")
    correct = SOLUTIONS["twoSum"]
    for label, raw in (("newline", "[2,7]\n9"),
                       ("named", "nums = [2,7]\ntarget = 9"),
                       ("comma", "[2,7], 9")):
        counts = set()
        for language in LANGUAGES:
            res = execute(language, correct[language]["correct"], q,
                          [{"input": raw, "expected": "[0, 1]"}])
            counts.add(res["totalPassed"])
        check("input form '%s' graded identically in all 3 languages" % label,
              counts == {1}, str(counts))


def test_comparison_semantics():
    section("9. Comparison semantics")
    for label, actual, expected, unordered, want in (
        ("list equals list", [0, 1], "[0, 1]", False, True),
        ("tuple equals list", (0, 1), "[0, 1]", False, True),
        ("integral float equals int", 4.0, "4", False, True),
        ("bool True equals 'true'", True, "true", False, True),
        ("bool False equals 'false'", False, "false", False, True),
        ("set equals sorted list", {1, 2}, "[1, 2]", False, True),
        ("wrong order is a failure when ordered", [1, 0], "[0, 1]", False, False),
        ("wrong order passes when unordered", [1, 0], "[0, 1]", True, True),
        ("nested order-insensitive", [["b"], ["a"]], '[["a"],["b"]]', True, True),
        ("different values fail", [0, 0], "[0, 1]", False, False),
        ("string case is significant", "Yes", "yes", False, False),
        ("string whitespace is not", "  4  ", "4", False, True),
        ("null vs value", None, "0", False, False),
        ("dict equality", {"a": 1}, '{"a": 1}', False, True),
    ):
        got = wire.values_equal(actual, expected, unordered)
        check("values_equal: %s" % label, got is want,
              "got %r want %r" % (got, want))

    ordered_q = question("twoSum")
    unordered_q = question("groupAnagrams")
    check("order-insensitivity comes from the description, not the return type",
          wire.is_unordered_question(ordered_q) is False
          and wire.is_unordered_question(unordered_q) is True)


# ===========================================================================
# 10. Timing fairness and scoring parity
# ===========================================================================

def test_timing_and_scoring():
    section("10. Timing fairness and scoring parity")
    q = question("twoSum")
    cases = all_cases(q)
    scores = {}
    timings = {}

    for language in LANGUAGES:
        res = execute(language, SOLUTIONS["twoSum"][language]["correct"], q, cases)
        timings[language] = (res["runtimeMs"], res["compileMs"])
        check("%s runtimeMs < 500 so scoring_engine awards full time_efficiency" % language,
              res["runtimeMs"] < 500, str(timings[language]))

        session = {
            "questions": [q],
            "submissions": {q["id"]: res},
            "startedAt": time.time() - 900,
            "endsAt": time.time() + 4500,
            "integrityEvents": [],
        }
        scores[language] = calculate_oa_objective_score(session)["overallScore"]

    check("Python reports no compile step", timings["python"][1] == 0, str(timings["python"]))
    check("Java reports a compile step separate from runtime",
          timings["java"][1] > 0, str(timings["java"]))
    check("C++ reports a compile step separate from runtime",
          timings["cpp"][1] > 0, str(timings["cpp"]))
    check("the same correct logic scores identically in all 3 languages",
          len(set(scores.values())) == 1, str(scores))


def main():
    for test in (test_regressions, test_parity_matrix, test_error_paths,
                 test_crash_preserves_earlier_results, test_timeouts,
                 test_java_shapes, test_cpp_shapes, test_arg_parsing,
                 test_comparison_semantics, test_timing_and_scoring):
        test()

    failed = [name for name, ok in RESULTS if not ok]
    print("\n" + "=" * 70)
    print("%d checks, %d passed, %d failed  (%.1fs)"
          % (len(RESULTS), len(RESULTS) - len(failed), len(failed), time.time() - STARTED))
    if failed:
        print("\nFailures:")
        for name in failed:
            print("  - %s" % name)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
