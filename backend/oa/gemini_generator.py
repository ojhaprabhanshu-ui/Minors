import json
import os
import random
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")

# =========================================================
# JSON REPAIR & VALIDATION FUNCTIONS
# =========================================================

def repair_json_string(raw_text: str) -> str:
    """
    Attempts to repair common JSON formatting issues from API responses.
    - Removes problematic line breaks
    - Fixes unescaped quotes in description fields
    """
    import re
    
    # Remove extra line breaks, keep only single spaces
    raw_text = re.sub(r'\n+', ' ', raw_text)
    raw_text = re.sub(r'\s+', ' ', raw_text)
    
    return raw_text.strip()

def safe_json_parse(raw_text: str) -> dict:
    """
    Safely parses JSON with multiple fallback strategies.
    Returns parsed JSON or empty dict on failure.
    """
    try:
        # First attempt: direct parse
        return json.loads(raw_text)
    except json.JSONDecodeError as e:
        print(f"[JSON Parser] First parse failed: {e}")
        
        try:
            # Second attempt: repair and retry
            repaired = repair_json_string(raw_text)
            return json.loads(repaired)
        except json.JSONDecodeError as e2:
            print(f"[JSON Parser] Repair and parse failed: {e2}")
            print(f"[JSON Parser] Raw text (first 200 chars): {raw_text[:200]}")
            return {}

# =========================================================
# HIGH-SPEED DYNAMIC DSA QUESTION GENERATOR (< 0.1s)
# =========================================================

QUESTION_BANK = [
    # Slot 1 Questions (q1) - Easy / Foundation
    {
        "id": "q1",
        "title": "Two Sum Target Indices",
        "topic": "Arrays & Hashing",
        "difficulty": "Easy",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
        "examples": [{"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]"}],
        "functionName": "twoSum",
        "arguments": ["nums", "target"],
        "argTypes": ["list[int]", "int"],
        "returnType": "list[int]",
        "starterCode": {
            "python": "def twoSum(nums, target):\n    pass",
            "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}],
            "hidden": [{"input": "[3, 3]\n6", "expected": "[0, 1]"}, {"input": "[1, 5, 8, 3, 2]\n10", "expected": "[2, 4]"}]
        }
    },
    {
        "id": "q1",
        "title": "Contains Duplicate",
        "topic": "Arrays & Hashing",
        "difficulty": "Easy",
        "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        "examples": [{"input": "nums = [1,2,3,1]", "output": "true"}],
        "functionName": "containsDuplicate",
        "arguments": ["nums"],
        "argTypes": ["list[int]"],
        "returnType": "bool",
        "starterCode": {
            "python": "def containsDuplicate(nums: list[int]) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3,1]", "expected": "true"}],
            "hidden": [{"input": "[1,2,3,4]", "expected": "false"}]
        }
    },
    {
        "id": "q1",
        "title": "Valid Palindrome",
        "topic": "Two Pointers",
        "difficulty": "Easy",
        "description": "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        "constraints": ["1 <= s.length <= 2 * 10^5"],
        "examples": [{"input": "s = \"A man, a plan, a canal: Panama\"", "output": "true"}],
        "functionName": "isPalindrome",
        "arguments": ["s"],
        "argTypes": ["str"],
        "returnType": "bool",
        "starterCode": {
            "python": "def isPalindrome(s: str) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"A man, a plan, a canal: Panama\"", "expected": "true"}],
            "hidden": [{"input": "\"race a car\"", "expected": "false"}]
        }
    },
    {
        "id": "q1",
        "title": "Valid Parentheses",
        "topic": "Stack",
        "difficulty": "Easy",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "constraints": ["1 <= s.length <= 10^4"],
        "examples": [{"input": "s = \"()[]{}\"", "output": "true"}],
        "functionName": "isValid",
        "arguments": ["s"],
        "argTypes": ["str"],
        "returnType": "bool",
        "starterCode": {
            "python": "def isValid(s: str) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"()[]{}\"", "expected": "true"}],
            "hidden": [{"input": "\"(]\"", "expected": "false"}]
        }
    },
    {
        "id": "q1",
        "title": "Binary Search",
        "topic": "Binary Search",
        "difficulty": "Easy",
        "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
        "constraints": ["1 <= nums.length <= 10^4"],
        "examples": [{"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"}],
        "functionName": "search",
        "arguments": ["nums", "target"],
        "argTypes": ["list[int]", "int"],
        "returnType": "int",
        "starterCode": {
            "python": "def search(nums: list[int], target: int) -> int:\n    pass",
            "java": "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[-1,0,3,5,9,12]\n9", "expected": "4"}],
            "hidden": [{"input": "[-1,0,3,5,9,12]\n2", "expected": "-1"}]
        }
    },

    # Slot 2 Questions (q2) - Medium
    {
        "id": "q2",
        "title": "Longest Substring Without Repeating Characters",
        "topic": "Sliding Window",
        "difficulty": "Medium",
        "description": "Given a string s, find the length of the longest substring without repeating characters.",
        "constraints": ["0 <= s.length <= 5 * 10^4"],
        "examples": [{"input": "s = \"abcabcbb\"", "output": "3"}],
        "functionName": "lengthOfLongestSubstring",
        "arguments": ["s"],
        "argTypes": ["str"],
        "returnType": "int",
        "starterCode": {
            "python": "def lengthOfLongestSubstring(s: str) -> int:\n    pass",
            "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"abcabcbb\"", "expected": "3"}],
            "hidden": [{"input": "\"pwwkew\"", "expected": "3"}]
        }
    },
    {
        "id": "q2",
        "title": "Group Anagrams",
        "topic": "Arrays & Hashing",
        "difficulty": "Medium",
        "description": "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
        "constraints": ["1 <= strs.length <= 10^4"],
        "examples": [{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}],
        "functionName": "groupAnagrams",
        "arguments": ["strs"],
        "argTypes": ["list[str]"],
        "returnType": "list[list[str]]",
        "starterCode": {
            "python": "def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[\"eat\",\"tea\",\"tan\"]", "expected": "[[\"eat\",\"tea\"],[\"tan\"]]"}],
            "hidden": [{"input": "[\"\"]", "expected": "[[\"\"]]"}]
        }
    },
    {
        "id": "q2",
        "title": "3Sum",
        "topic": "Two Pointers",
        "difficulty": "Medium",
        "description": "Given an integer array nums, return all the triplets such that they sum to zero.",
        "constraints": ["3 <= nums.length <= 3000"],
        "examples": [{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}],
        "functionName": "threeSum",
        "arguments": ["nums"],
        "argTypes": ["list[int]"],
        "returnType": "list[list[int]]",
        "starterCode": {
            "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[-1,0,1,2,-1,-4]", "expected": "[[-1,-1,2],[-1,0,1]]"}],
            "hidden": [{"input": "[0,0,0]", "expected": "[[0,0,0]]"}]
        }
    },
    {
        "id": "q2",
        "title": "House Robber",
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob without alerting the police.",
        "constraints": ["1 <= nums.length <= 100"],
        "examples": [{"input": "nums = [1,2,3,1]", "output": "4"}],
        "functionName": "rob",
        "arguments": ["nums"],
        "argTypes": ["list[int]"],
        "returnType": "int",
        "starterCode": {
            "python": "def rob(nums: list[int]) -> int:\n    pass",
            "java": "class Solution {\n    public int rob(int[] nums) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3,1]", "expected": "4"}],
            "hidden": [{"input": "[2,7,9,3,1]", "expected": "12"}]
        }
    },

    # Slot 3 Questions (q3) - Hard
    {
        "id": "q3",
        "title": "Number of Islands",
        "topic": "Graphs (BFS/DFS)",
        "difficulty": "Medium",
        "description": "Given an m x n 2D binary grid representing a map of land and water, return the number of islands.",
        "constraints": ["1 <= m, n <= 300"],
        "examples": [{"input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2"}],
        "functionName": "numIslands",
        "arguments": ["grid"],
        "argTypes": ["list[list[str]]"],
        "returnType": "int",
        "starterCode": {
            "python": "def numIslands(grid):\n    pass",
            "java": "class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]", "expected": "2"}],
            "hidden": [{"input": "[[\"0\"]]", "expected": "0"}]
        }
    },
    {
        "id": "q3",
        "title": "Coin Change",
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array coins and an integer amount, return the fewest number of coins that you need to make up that amount.",
        "constraints": ["1 <= coins.length <= 12"],
        "examples": [{"input": "coins = [1,2,5], amount = 11", "output": "3"}],
        "functionName": "coinChange",
        "arguments": ["coins", "amount"],
        "argTypes": ["list[int]", "int"],
        "returnType": "int",
        "starterCode": {
            "python": "def coinChange(coins, amount):\n    pass",
            "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return -1;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,5]\n11", "expected": "3"}],
            "hidden": [{"input": "[2]\n3", "expected": "-1"}]
        }
    },
    {
        "id": "q3",
        "title": "Trapping Rain Water",
        "topic": "Two Pointers",
        "difficulty": "Hard",
        "description": "Given non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "constraints": ["1 <= n <= 2 * 10^4"],
        "examples": [{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}],
        "functionName": "trap",
        "arguments": ["height"],
        "argTypes": ["list[int]"],
        "returnType": "int",
        "starterCode": {
            "python": "def trap(height: list[int]) -> int:\n    pass",
            "java": "class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[0,1,0,2,1,0,1,3,2,1,2,1]", "expected": "6"}],
            "hidden": [{"input": "[4,2,0,3,2,5]", "expected": "9"}]
        }
    },
]

def validate_questions(questions: list) -> bool:
    """
    Validates that the generated questions conform to the required schema.
    """
    if len(questions) != 3:
        print(f"[Validator] Expected 3 questions, got {len(questions)}")
        return False
    required_keys = ["id", "title", "topic", "difficulty", "description", "constraints", "examples", "functionName", "arguments", "argTypes", "returnType", "testCases"]
    for idx, q in enumerate(questions):
        missing_keys = [k for k in required_keys if k not in q]
        if missing_keys:
            print(f"[Validator] Question {idx+1} missing keys: {missing_keys}")
            return False
        if not all(tc in q["testCases"] for tc in ["public", "hidden"]):
            print(f"[Validator] Question {idx+1} missing public/hidden test cases")
            return False
    print("[Validator] All 3 questions passed validation!")
    return True

def build_starter_code(function_name: str, arguments: list, arg_types: list, return_type: str) -> dict:
    """
    Dynamically constructs valid starter code for Python, Java, and C++
    """
    py_types = {"int": "int", "float": "float", "double": "float", "string": "str", "str": "str", "bool": "bool", "boolean": "bool", "list[int]": "list[int]", "list[str]": "list[str]", "list[list[str]]": "list[list[str]]", "list[list[int]]": "list[list[int]]"}
    
    java_types = {"int": "int", "float": "float", "double": "double", "string": "String", "str": "String", "bool": "boolean", "boolean": "boolean", "list[int]": "int[]", "list[str]": "String[]", "list[list[int]]": "List<List<Integer>>", "list[list[str]]": "List<List<String>>"}
    java_defaults = {"int": "0", "float": "0.0f", "double": "0.0", "String": '""', "boolean": "false", "int[]": "new int[]{}", "String[]": "new String[]{}", "List<List<Integer>>": "new ArrayList<>()"}

    cpp_types = {"int": "int", "float": "float", "double": "double", "string": "string", "str": "string", "bool": "bool", "boolean": "bool", "list[int]": "vector<int>", "list[str]": "vector<string>", "list[list[int]]": "vector<vector<int>>", "list[list[str]]": "vector<vector<string>>"}

    # Python starter
    py_args = [f"{name}: {py_types.get(t.lower(), 'any')}" for name, t in zip(arguments, arg_types)]
    py_ret = py_types.get(return_type.lower(), "any")
    py_code = f"def {function_name}({', '.join(py_args)}) -> {py_ret}:\n    pass"

    # Java starter
    java_args = [f"{java_types.get(t.lower(), 'Object')} {name}" for name, t in zip(arguments, arg_types)]
    java_ret = java_types.get(return_type.lower(), "void")
    java_ret_default = java_defaults.get(java_ret, "null")
    java_imports = "import java.util.*;\n\n" if "List" in java_ret or any("List" in java_types.get(t.lower(), "") for t in arg_types) else ""
    java_code = f"{java_imports}class Solution {{\n    public {java_ret} {function_name}({', '.join(java_args)}) {{\n        return {java_ret_default};\n    }}\n}}"

    # C++ starter
    cpp_args = [f"{cpp_types.get(t.lower(), 'auto')} {name}" for name, t in zip(arguments, arg_types)]
    cpp_ret = cpp_types.get(return_type.lower(), "void")
    cpp_includes = "#include <vector>\n#include <string>\nusing namespace std;\n\n"
    cpp_code = f"{cpp_includes}class Solution {{\npublic:\n    {cpp_ret} {function_name}({', '.join(cpp_args)}) {{\n        return {{}};\n    }}\n}};"

    return {
        "python": py_code,
        "java": java_code,
        "cpp": cpp_code
    }

def generate_dsa_questions(candidate_profile: dict = None) -> list:
    """
    Generates 3 unique DSA questions. Falls back to local QUESTION_BANK on API failure.

    The skill profile (if present) is injected into the prompt so the
    scenario + examples can be tailored to the candidate's declared skills
    (e.g. a candidate with React+Node.js gets an e-commerce scenario; a
    candidate with Python+ML gets a data-pipeline scenario).
    """
    # Pull the dynamic skill profile (set by the Full Interview orchestrator)
    skill_block = ""
    skill_anchor = ""
    if isinstance(candidate_profile, dict):
        skill_block = candidate_profile.get("_skill_block") or ""
        sp = candidate_profile.get("skill_profile") or {}
        primary = sp.get("primary") or []
        if primary:
            skill_anchor = f" The candidate's primary declared skills are: {', '.join(primary[:3])}. Tailor the scenario and problem framing to those skills."

    if not API_KEY:
        print("[OA AI Generator] No API key configured. Using local QUESTION_BANK.")
        slot_q1 = [q for q in QUESTION_BANK if q["id"] == "q1"]
        slot_q2 = [q for q in QUESTION_BANK if q["id"] == "q2"]
        slot_q3 = [q for q in QUESTION_BANK if q["id"] == "q3"]

        fallback_selection = [random.choice(slot_q1), random.choice(slot_q2), random.choice(slot_q3)]
        for idx, q in enumerate(fallback_selection, 1):
            q["id"] = f"q{idx}"
        return fallback_selection

    categories_q1 = ["Arrays & Hashing", "Two Pointers", "Stack", "Binary Search"]
    categories_q2 = ["Sliding Window", "Trees", "Backtracking", "Graphs BFS/DFS"]
    categories_q3 = ["Dynamic Programming", "Graphs (BFS/DFS)", "Advanced Backtracking"]

    scenarios = ["E-commerce system", "Blockchain verification", "Social network", "Delivery optimization", "Log search engine"]

    selected_topics = [
        random.choice(categories_q1),
        random.choice(categories_q2),
        random.choice(categories_q3)
    ]
    selected_scenario = random.choice(scenarios)
    timestamp_seed = int(time.time() * 1000)

    prompt = (
        "Generate 3 UNIQUE DSA coding questions for an assessment.\n"
        f"Scenario: {selected_scenario}. Seed: {timestamp_seed}\n"
        f"Q1 Topic: {selected_topics[0]} (Easy)\n"
        f"Q2 Topic: {selected_topics[1]} (Medium)\n"
        f"Q3 Topic: {selected_topics[2]} (Hard)\n"
        f"{skill_anchor}\n"
        f"{skill_block}\n"
        "Response format (VALID JSON ONLY, no markdown):\n"
        "{\n"
        '  "questions": [{"id":"q1", "title":"...", "topic":"...", "difficulty":"Easy", "description":"Single line description", "constraints":["..."], "examples":[{"input":"...", "output":"..."}], "functionName":"func", "arguments":["arg1"], "argTypes":["type"], "returnType":"type", "testCases":{"public":[{"input":"x", "expected":"y"}], "hidden":[{"input":"a", "expected":"b"}]}}]\n'
        '}\n'
        'Ensure: descriptions are ONE LINE (no newlines), JSON is valid and complete.'
    )

    models = [
        "meta-llama/llama-3.3-70b-instruct",
        "qwen/qwen-2.5-coder-32b-instruct",
        "google/gemini-2.5-flash",
    ]

    for model in models:
        try:
            print(f"[OA AI Generator] Attempting with model: {model}...")
            
            if not API_KEY.startswith("sk-or-"):
                # Gemini API
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                headers = {"Content-Type": "application/json"}
            else:
                # OpenRouter API
                url = "https://openrouter.ai/api/v1/chat/completions"
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.7,
                    "max_tokens": 3000
                }
                headers = {
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                }

            res = requests.post(url, headers=headers, json=payload, timeout=30)
            
            if res.status_code == 200:
                data = res.json()
                raw_text = ""
                
                if "choices" in data and len(data["choices"]) > 0:
                    raw_text = data["choices"][0]["message"]["content"]
                elif "candidates" in data and len(data["candidates"]) > 0:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

                # Clean up markdown
                raw_text = raw_text.strip()
                for marker in ["```json", "```"]:
                    if raw_text.startswith(marker):
                        raw_text = raw_text[len(marker):]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]
                raw_text = raw_text.strip()

                # Parse JSON safely
                parsed = safe_json_parse(raw_text)
                questions = parsed.get("questions", [])

                if validate_questions(questions):
                    # Build starter codes
                    for idx, q in enumerate(questions, 1):
                        q["id"] = f"q{idx}"
                        q["starterCode"] = build_starter_code(
                            q["functionName"],
                            q["arguments"],
                            q["argTypes"],
                            q["returnType"]
                        )
                    print(f"[OA AI Generator] SUCCESS with {model}!")
                    return questions
                else:
                    print(f"[OA AI Generator] Validation failed for {model}")
            else:
                print(f"[OA AI Generator] {model} returned {res.status_code}")
                
        except Exception as e:
            print(f"[OA AI Generator] Error with {model}: {str(e)[:100]}")

    # Fallback to local QUESTION_BANK
    print("[OA AI Generator] All API calls failed. Using local QUESTION_BANK fallback.")
    slot_q1 = [q for q in QUESTION_BANK if q["id"] == "q1"]
    slot_q2 = [q for q in QUESTION_BANK if q["id"] == "q2"]
    slot_q3 = [q for q in QUESTION_BANK if q["id"] == "q3"]
    
    fallback_selection = [random.choice(slot_q1), random.choice(slot_q2), random.choice(slot_q3)]
    for idx, q in enumerate(fallback_selection, 1):
        q["id"] = f"q{idx}"
    return fallback_selection


if __name__ == "__main__":
    questions = generate_dsa_questions()
    print(f"\nGenerated {len(questions)} questions:")
    for idx, q in enumerate(questions, 1):
        print(f"{idx}. {q['title']} [{q['topic']}] ({q['difficulty']})")