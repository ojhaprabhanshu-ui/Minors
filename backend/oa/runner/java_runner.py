"""Java submission runner.

Candidates write a LeetCode-style `class Solution` with no `main`, so the
runner generates a hidden `VirezaDriver` that loads the candidate class by
reflection, discovers the real method signature, converts the pre-parsed JSON
arguments into it, and writes results to a file.

Reflection matters: `argTypes` in the question metadata disagrees with the
actual stub for at least one bank question (`numIslands` declares
`list[list[str]]` but the Java stub takes `char[][]`), so the driver trusts the
JVM's view of the method, never the metadata.
"""

import os
import re
import shutil
import subprocess
import tempfile
import time

from . import wire
from .toolchain import resolve_tool, tool_version

_CLASS_RE = re.compile(r"\bclass\s+([A-Za-z_$][\w$]*)")

DRIVER = r'''
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Generated harness. Reads spec.json (argv[0]) and writes result.json (argv[1]).
 * Results never travel over stdout, so candidate System.out.println cannot
 * corrupt them; that output is captured and returned as `stdout`.
 */
public class VirezaDriver {

    // ---------------------------------------------------------------- JSON --

    static final class Json {
        private final String s;
        private int i;

        private Json(String s) { this.s = s; }

        static Object parse(String text) {
            Json j = new Json(text);
            j.ws();
            Object v = j.value();
            return v;
        }

        private void ws() {
            while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
        }

        private Object value() {
            ws();
            if (i >= s.length()) return null;
            char c = s.charAt(i);
            if (c == '{') return object();
            if (c == '[') return array();
            if (c == '"') return string();
            if (c == 't') { i += 4; return Boolean.TRUE; }
            if (c == 'f') { i += 5; return Boolean.FALSE; }
            if (c == 'n') { i += 4; return null; }
            return number();
        }

        private Map<String, Object> object() {
            Map<String, Object> out = new LinkedHashMap<>();
            i++; // {
            ws();
            if (i < s.length() && s.charAt(i) == '}') { i++; return out; }
            while (i < s.length()) {
                ws();
                String key = string();
                ws();
                if (i < s.length() && s.charAt(i) == ':') i++;
                Object val = value();
                out.put(key, val);
                ws();
                if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
                if (i < s.length() && s.charAt(i) == '}') { i++; break; }
                break;
            }
            return out;
        }

        private List<Object> array() {
            List<Object> out = new ArrayList<>();
            i++; // [
            ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return out; }
            while (i < s.length()) {
                out.add(value());
                ws();
                if (i < s.length() && s.charAt(i) == ',') { i++; continue; }
                if (i < s.length() && s.charAt(i) == ']') { i++; break; }
                break;
            }
            return out;
        }

        private String string() {
            StringBuilder sb = new StringBuilder();
            i++; // opening quote
            while (i < s.length()) {
                char c = s.charAt(i++);
                if (c == '"') break;
                if (c == '\\' && i < s.length()) {
                    char e = s.charAt(i++);
                    switch (e) {
                        case 'n': sb.append('\n'); break;
                        case 't': sb.append('\t'); break;
                        case 'r': sb.append('\r'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'u':
                            if (i + 4 <= s.length()) {
                                sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                                i += 4;
                            }
                            break;
                        default: sb.append(e);
                    }
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();
        }

        private Object number() {
            int start = i;
            while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
            String tok = s.substring(start, i);
            if (tok.isEmpty()) return 0L;
            if (tok.contains(".") || tok.contains("e") || tok.contains("E")) {
                return Double.valueOf(tok);
            }
            try {
                return Long.valueOf(tok);
            } catch (NumberFormatException e) {
                return Double.valueOf(tok);
            }
        }

        static String write(Object o) {
            StringBuilder sb = new StringBuilder();
            writeValue(sb, o);
            return sb.toString();
        }

        @SuppressWarnings("unchecked")
        private static void writeValue(StringBuilder sb, Object o) {
            if (o == null) { sb.append("null"); return; }
            if (o instanceof Boolean) { sb.append(o.toString()); return; }
            if (o instanceof Number) {
                if (o instanceof Double || o instanceof Float) {
                    double d = ((Number) o).doubleValue();
                    if (d == Math.rint(d) && !Double.isInfinite(d) && Math.abs(d) < 1e15) {
                        sb.append(Long.toString((long) d));
                    } else {
                        sb.append(Double.toString(d));
                    }
                } else {
                    sb.append(o.toString());
                }
                return;
            }
            if (o instanceof CharSequence || o instanceof Character) {
                writeString(sb, o.toString());
                return;
            }
            if (o instanceof Map) {
                sb.append('{');
                boolean first = true;
                for (Map.Entry<?, ?> e : ((Map<?, ?>) o).entrySet()) {
                    if (!first) sb.append(',');
                    first = false;
                    writeString(sb, String.valueOf(e.getKey()));
                    sb.append(':');
                    writeValue(sb, e.getValue());
                }
                sb.append('}');
                return;
            }
            if (o instanceof Iterable) {
                sb.append('[');
                boolean first = true;
                for (Object item : (Iterable<?>) o) {
                    if (!first) sb.append(',');
                    first = false;
                    writeValue(sb, item);
                }
                sb.append(']');
                return;
            }
            if (o.getClass().isArray()) {
                sb.append('[');
                int n = Array.getLength(o);
                for (int k = 0; k < n; k++) {
                    if (k > 0) sb.append(',');
                    writeValue(sb, Array.get(o, k));
                }
                sb.append(']');
                return;
            }
            writeString(sb, o.toString());
        }

        private static void writeString(StringBuilder sb, String text) {
            sb.append('"');
            for (int k = 0; k < text.length(); k++) {
                char c = text.charAt(k);
                switch (c) {
                    case '"': sb.append("\\\""); break;
                    case '\\': sb.append("\\\\"); break;
                    case '\n': sb.append("\\n"); break;
                    case '\r': sb.append("\\r"); break;
                    case '\t': sb.append("\\t"); break;
                    default:
                        if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                        else sb.append(c);
                }
            }
            sb.append('"');
        }
    }

    // ----------------------------------------------------------- conversion --

    private static List<Object> asList(Object json, Class<?> component) {
        if (json instanceof List) return (List<Object>) json;
        if (json instanceof String) {
            // A char array may legitimately arrive as a plain string ("110").
            if (component == char.class || component == Character.class) {
                List<Object> chars = new ArrayList<>();
                for (char c : ((String) json).toCharArray()) chars.add(Character.valueOf(c));
                return chars;
            }
            List<Object> single = new ArrayList<>();
            single.add(json);
            return single;
        }
        List<Object> single = new ArrayList<>();
        single.add(json);
        return single;
    }

    private static Type elementTypeOf(Type generic) {
        if (generic instanceof ParameterizedType) {
            Type[] args = ((ParameterizedType) generic).getActualTypeArguments();
            if (args.length > 0) return args[0];
        }
        return Object.class;
    }

    private static Class<?> rawOf(Type type) {
        if (type instanceof Class) return (Class<?>) type;
        if (type instanceof ParameterizedType) return rawOf(((ParameterizedType) type).getRawType());
        return Object.class;
    }

    @SuppressWarnings("unchecked")
    static Object convert(Object json, Class<?> raw, Type generic) {
        if (json == null) {
            if (raw.isPrimitive()) {
                if (raw == boolean.class) return Boolean.FALSE;
                if (raw == char.class) return Character.valueOf('\0');
                if (raw == long.class) return Long.valueOf(0L);
                if (raw == int.class) return Integer.valueOf(0);
                if (raw == double.class) return Double.valueOf(0d);
                if (raw == float.class) return Float.valueOf(0f);
                if (raw == short.class) return Short.valueOf((short) 0);
                if (raw == byte.class) return Byte.valueOf((byte) 0);
            }
            return null;
        }

        if (raw == int.class || raw == Integer.class) return ((Number) json).intValue();
        if (raw == long.class || raw == Long.class) return ((Number) json).longValue();
        if (raw == double.class || raw == Double.class) return ((Number) json).doubleValue();
        if (raw == float.class || raw == Float.class) return ((Number) json).floatValue();
        if (raw == short.class || raw == Short.class) return ((Number) json).shortValue();
        if (raw == byte.class || raw == Byte.class) return ((Number) json).byteValue();

        if (raw == boolean.class || raw == Boolean.class) {
            if (json instanceof Boolean) return json;
            if (json instanceof Number) return ((Number) json).intValue() != 0;
            return Boolean.valueOf(json.toString());
        }

        if (raw == char.class || raw == Character.class) {
            String text = json.toString();
            return text.isEmpty() ? Character.valueOf('\0') : Character.valueOf(text.charAt(0));
        }

        if (raw == String.class) {
            return json instanceof String ? json : Json.write(json);
        }

        if (raw.isArray()) {
            Class<?> component = raw.getComponentType();
            List<Object> items = asList(json, component);
            Object out = Array.newInstance(component, items.size());
            for (int k = 0; k < items.size(); k++) {
                Array.set(out, k, convert(items.get(k), component, component));
            }
            return out;
        }

        if (List.class.isAssignableFrom(raw)) {
            Type elem = elementTypeOf(generic);
            Class<?> elemRaw = rawOf(elem);
            List<Object> out = new ArrayList<>();
            for (Object item : asList(json, elemRaw)) out.add(convert(item, elemRaw, elem));
            return out;
        }

        if (Set.class.isAssignableFrom(raw)) {
            Type elem = elementTypeOf(generic);
            Class<?> elemRaw = rawOf(elem);
            Set<Object> out = new LinkedHashSet<>();
            for (Object item : asList(json, elemRaw)) out.add(convert(item, elemRaw, elem));
            return out;
        }

        if (Map.class.isAssignableFrom(raw)) {
            Type keyT = Object.class, valT = Object.class;
            if (generic instanceof ParameterizedType) {
                Type[] args = ((ParameterizedType) generic).getActualTypeArguments();
                if (args.length == 2) { keyT = args[0]; valT = args[1]; }
            }
            Map<Object, Object> out = new LinkedHashMap<>();
            if (json instanceof Map) {
                for (Map.Entry<?, ?> e : ((Map<?, ?>) json).entrySet()) {
                    out.put(convert(String.valueOf(e.getKey()), rawOf(keyT), keyT),
                            convert(e.getValue(), rawOf(valT), valT));
                }
            }
            return out;
        }

        throw new IllegalArgumentException(
                "Unsupported parameter type '" + raw.getName()
                        + "'. The OA runner supports primitives, String, arrays, List, Set and Map.");
    }

    // --------------------------------------------------------------- driver --

    private static Method selectMethod(Class<?> klass, String name, int arity) {
        List<Method> matches = new ArrayList<>();
        for (Method m : klass.getDeclaredMethods()) if (m.getName().equals(name)) matches.add(m);
        for (Method m : klass.getMethods()) {
            if (m.getName().equals(name) && !matches.contains(m)) matches.add(m);
        }
        if (matches.isEmpty()) return null;
        if (matches.size() == 1) return matches.get(0);
        if (arity >= 0) {
            for (Method m : matches) if (m.getParameterCount() == arity) return m;
        }
        return matches.get(0);
    }

    private static String describe(Throwable t) {
        Throwable cause = t;
        if (cause instanceof InvocationTargetException && cause.getCause() != null) {
            cause = cause.getCause();
        }
        String msg = cause.getMessage();
        return cause.getClass().getSimpleName() + (msg == null ? "" : ": " + msg);
    }

    public static void main(String[] argv) {
        Map<String, Object> result = new LinkedHashMap<>();
        List<Object> invocations = new ArrayList<>();
        result.put("stdout", "");
        result.put("invocations", invocations);
        result.put("fatal", null);

        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;

        try {
            String specText = new String(
                    Files.readAllBytes(Paths.get(argv[0])), StandardCharsets.UTF_8);
            Map<String, Object> spec = (Map<String, Object>) Json.parse(specText);
            String funcName = String.valueOf(spec.get("functionName"));
            String className = String.valueOf(spec.get("className"));
            List<Object> cases = (List<Object>) spec.get("cases");
            if (cases == null) cases = new ArrayList<>();

            int arity = -1;
            if (!cases.isEmpty()) {
                Object a = ((Map<String, Object>) cases.get(0)).get("args");
                if (a instanceof List) arity = ((List<Object>) a).size();
            }

            Class<?> klass = Class.forName(className);
            Method method = selectMethod(klass, funcName, arity);
            if (method == null) {
                result.put("fatal", "Method '" + funcName + "' was not found in class '"
                        + className + "'.");
                write(argv[1], result, captured);
                return;
            }
            method.setAccessible(true);

            Object instance = null;
            if (!Modifier.isStatic(method.getModifiers())) {
                try {
                    java.lang.reflect.Constructor<?> ctor = klass.getDeclaredConstructor();
                    ctor.setAccessible(true);
                    instance = ctor.newInstance();
                } catch (Exception e) {
                    result.put("fatal", "Could not construct '" + className
                            + "' - it needs a no-argument constructor. (" + describe(e) + ")");
                    write(argv[1], result, captured);
                    return;
                }
            }

            Class<?>[] paramTypes = method.getParameterTypes();
            Type[] genericTypes = method.getGenericParameterTypes();

            for (Object caseObj : cases) {
                Map<String, Object> c = (Map<String, Object>) caseObj;
                List<Object> jsonArgs = (List<Object>) c.get("args");
                if (jsonArgs == null) jsonArgs = new ArrayList<>();

                Map<String, Object> inv = new LinkedHashMap<>();
                PrintStream cap = new PrintStream(captured, true, StandardCharsets.UTF_8);
                System.setOut(cap);
                System.setErr(cap);
                long started = System.nanoTime();
                try {
                    Object[] callArgs = new Object[paramTypes.length];
                    for (int k = 0; k < paramTypes.length; k++) {
                        Object supplied = k < jsonArgs.size() ? jsonArgs.get(k) : null;
                        callArgs[k] = convert(supplied, paramTypes[k], genericTypes[k]);
                    }
                    Object returned = method.invoke(instance, callArgs);
                    double ms = (System.nanoTime() - started) / 1_000_000.0;
                    inv.put("ok", Boolean.TRUE);
                    inv.put("actual", returned);
                    inv.put("error", null);
                    inv.put("ms", Double.valueOf(ms));
                } catch (Throwable t) {
                    double ms = (System.nanoTime() - started) / 1_000_000.0;
                    inv.put("ok", Boolean.FALSE);
                    inv.put("actual", null);
                    inv.put("error", describe(t));
                    inv.put("ms", Double.valueOf(ms));
                } finally {
                    cap.flush();
                    System.setOut(originalOut);
                    System.setErr(originalErr);
                }
                invocations.add(inv);
            }
        } catch (Throwable t) {
            result.put("fatal", describe(t));
        }

        write(argv.length > 1 ? argv[1] : "result.json", result, captured);
    }

    private static void write(String path, Map<String, Object> result, ByteArrayOutputStream captured) {
        result.put("stdout", new String(captured.toByteArray(), StandardCharsets.UTF_8));
        try {
            Files.write(Paths.get(path),
                    Json.write(result).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            System.err.println("driver: could not write results: " + e);
        }
    }
}
'''


def detect_class_name(code, preferred="Solution"):
    """The class the candidate actually declared, preferring `Solution`.

    Writing the source to a file that matches the declared public class name
    avoids javac's "class X is public, should be declared in a file named X.java"
    failure when a candidate renames the class.
    """
    names = _CLASS_RE.findall(code or "")
    if preferred in names:
        return preferred
    return names[0] if names else preferred


def run(code, test_cases, question_info, start_time):
    total_cases = len(test_cases or [])
    javac = resolve_tool("javac")
    java = resolve_tool("java")
    toolchain = {"compiler": javac, "runtime": java}

    if not javac or not java:
        return wire.failure(
            "Java toolchain not available on this server. Looked for javac/java in "
            "PATH, JAVA_HOME, JDK_HOME and common JDK install locations "
            "(javac=%s, java=%s). Install a JDK (e.g. Eclipse Temurin 21) and set "
            "JAVA_HOME or add its bin/ to PATH, then restart the AI service."
            % (javac or "not found", java or "not found"),
            total_cases, language="java",
            runtime_ms=(time.time() - start_time) * 1000.0, toolchain=toolchain,
        )

    class_name = detect_class_name(code)
    arity = wire.arity_of(question_info)
    cases = wire.build_cases(test_cases, arity)
    unordered = wire.is_unordered_question(question_info)

    spec = wire.build_spec(wire.function_name_of(question_info), cases, unordered)
    spec["className"] = class_name

    work_dir = tempfile.mkdtemp(prefix="vireza_java_")
    try:
        with open(os.path.join(work_dir, class_name + ".java"), "w", encoding="utf-8") as handle:
            handle.write(code)
        with open(os.path.join(work_dir, "VirezaDriver.java"), "w", encoding="utf-8") as handle:
            handle.write(DRIVER)

        spec_path = os.path.join(work_dir, "spec.json")
        result_path = os.path.join(work_dir, "result.json")
        wire.write_json(spec_path, spec)

        compile_started = time.perf_counter()
        try:
            compile_proc = subprocess.run(
                [javac, "-encoding", "UTF-8", "-d", work_dir,
                 class_name + ".java", "VirezaDriver.java"],
                cwd=work_dir, capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=30,
            )
        except subprocess.TimeoutExpired:
            return wire.failure(
                "Java compilation timed out after 30s.", total_cases,
                language="java", compile_ms=(time.perf_counter() - compile_started) * 1000.0,
                toolchain=toolchain,
            )
        compile_ms = (time.perf_counter() - compile_started) * 1000.0

        if compile_proc.returncode != 0:
            stderr = (compile_proc.stderr or "").strip()
            # Errors in the generated driver are our bug, not the candidate's;
            # name the offending file so the two are distinguishable.
            owner = "VirezaDriver.java" if "VirezaDriver.java" in stderr else class_name + ".java"
            return wire.failure(
                "Java compilation error in %s:\n%s" % (owner, stderr[:2000] or "no details"),
                total_cases, language="java", compile_ms=compile_ms, toolchain=toolchain,
            )

        try:
            subprocess.run(
                [java, "-Xmx256m", "-Dfile.encoding=UTF-8", "-cp", work_dir,
                 "VirezaDriver", spec_path, result_path],
                cwd=work_dir, capture_output=True, text=True,
                encoding="utf-8", errors="replace",
                timeout=wire.timeout_seconds(total_cases, base=10.0, per_case=2.0),
            )
        except subprocess.TimeoutExpired:
            return wire.failure(
                "Time Limit Exceeded - your Java code did not finish within the "
                "allotted time. Check for infinite loops.",
                total_cases, language="java", compile_ms=compile_ms, toolchain=toolchain,
            )

        if not os.path.isfile(result_path):
            return wire.failure(
                "The Java runner produced no results. This usually means the JVM "
                "crashed or ran out of memory (-Xmx256m).",
                total_cases, language="java", compile_ms=compile_ms, toolchain=toolchain,
            )

        payload = wire.read_json(result_path)
        console_output = payload.get("stdout") or ""
        fatal = payload.get("fatal")
        invocations = payload.get("invocations") or []
        runtime_ms = sum(float(inv.get("ms") or 0.0) for inv in invocations)

        if fatal:
            return wire.failure(
                fatal, total_cases, language="java", compile_ms=compile_ms,
                console_output=console_output, toolchain=toolchain,
            )

        results, _ = wire.grade(invocations, cases, unordered)
        return wire.make_response(
            success=True, error=None, test_results=results, total_cases=total_cases,
            runtime_ms=runtime_ms, compile_ms=compile_ms, console_output=console_output,
            language="java", toolchain=toolchain,
        )
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
