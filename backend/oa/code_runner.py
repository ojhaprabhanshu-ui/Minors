"""Public entry point for executing OA candidate submissions.

`aiservices/app.py` imports only `run_candidate_code` from here. The actual
work — harness generation, compilation, sandboxed invocation and grading —
lives in the `oa.runner` package, one module per language.
"""

import time

from .runner import cpp_runner, java_runner, python_runner, wire

# The frontend sends "python" / "java" / "cpp"; the aliases are kept because
# the same route is reachable by anything that can POST to it.
_RUNNERS = {
    "python": python_runner,
    "python3": python_runner,
    "py": python_runner,
    "java": java_runner,
    "cpp": cpp_runner,
    "c++": cpp_runner,
    "cxx": cpp_runner,
}


def run_candidate_code(language: str, code: str, test_cases: list, question_info: dict) -> dict:
    """Run one submission against every supplied test case and grade it.

    Returns the uniform report shape from `wire.make_response`. `success` is
    True only when per-case results were produced; a compile error, a missing
    toolchain or a timeout all come back as `success` False with an actionable
    `error`, never as a fabricated grade.
    """
    test_cases = test_cases or []
    lang = (language or "").lower().strip()
    runner = _RUNNERS.get(lang)

    if runner is None:
        return wire.failure(
            "Unsupported language: %s. Choose Python, Java or C++." % (language or "<none>"),
            len(test_cases), language=lang,
        )

    if not code or not code.strip():
        return wire.failure("No code provided.", len(test_cases), language=lang)

    return runner.run(code, test_cases, question_info or {}, time.time())
