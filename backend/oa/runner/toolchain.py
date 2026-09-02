"""Toolchain discovery for the OA runners.

`shutil.which` only sees the current process's PATH. If the AI service was
started before a JDK was added to the user PATH, or was launched from an
environment that does not inherit it, the compiler would be missed even though
it is installed. We layer fallbacks so a usable toolchain is found whenever one
exists on the machine.
"""

import os
import shutil
import subprocess

_JDK_HOMES = [
    os.path.expanduser(r"~\java\jdk-21.0.5+11"),
    os.path.expanduser(r"~\jdk-21.0.5+11"),
    r"C:\Program Files\Eclipse Adoptium\jdk-21.0.5.11-hotspot",
    r"C:\Program Files\Java\jdk-21",
    r"C:\Program Files\Microsoft\jdk-21.0.5.11",
]

_MINGW_BINS = [r"C:\MinGW\bin", r"C:\msys64\mingw64\bin", r"C:\TDM-GCC-64\bin"]


def _exe_names(name):
    if os.name != "nt":
        return [name]
    return [name + ".exe", name]


def _candidate_executables(name):
    """Absolute paths to try for `name` (e.g. "javac", "java", "g++"), best first."""
    candidates = []

    found = shutil.which(name)
    if found:
        candidates.append(found)

    if name in ("javac", "java"):
        homes = [os.environ.get("JAVA_HOME"), os.environ.get("JDK_HOME")] + _JDK_HOMES
        for home in homes:
            if not home:
                continue
            for exe in _exe_names(name):
                path = os.path.join(home, "bin", exe)
                if path not in candidates:
                    candidates.append(path)

    if name in ("g++", "clang++", "gcc"):
        for bindir in _MINGW_BINS:
            for exe in _exe_names(name):
                path = os.path.join(bindir, exe)
                if path not in candidates:
                    candidates.append(path)

    return candidates


def resolve_tool(name):
    """First usable path for `name`, or None if it is not installed anywhere."""
    for path in _candidate_executables(name):
        if os.path.isfile(path):
            return path
    return None


def resolve_any(*names):
    for name in names:
        path = resolve_tool(name)
        if path:
            return path
    return None


def tool_version(path, flag="--version"):
    """Best-effort one-line version string; never raises."""
    if not path:
        return None
    try:
        proc = subprocess.run(
            [path, flag], capture_output=True, text=True, timeout=10
        )
    except Exception:
        return None
    out = (proc.stdout or proc.stderr or "").strip()
    return out.splitlines()[0][:120] if out else None
