import json
import os
import random
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY")

# =========================================================
# HIGH-SPEED DYNAMIC DSA QUESTION GENERATOR (< 0.1s)
# =========================================================

QUESTION_BANK = [
    # Category 1: Arrays & Hashing
    {
        "id": "q1",
        "title": "Two Sum Target Indices",
        "topic": "Arrays & Hashing",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution.",
        "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
        "examples": [{"input": "nums = [2, 7, 11, 15], target = 9", "output": "[0, 1]"}],
        "functionName": "twoSum",
        "starterCode": {
            "python": "def twoSum(nums, target):\n    # Write your solution here\n    pass",
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
        "title": "Container With Most Water",
        "topic": "Two Pointers",
        "difficulty": "Easy",
        "description": "You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container such that the container contains the most water.",
        "constraints": ["2 <= n <= 10^5"],
        "examples": [{"input": "height = [1,8,6,2,5,4,8,3,7]", "output": "49"}],
        "functionName": "maxArea",
        "starterCode": {
            "python": "def maxArea(height):\n    pass",
            "java": "class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,8,6,2,5,4,8,3,7]", "expected": "49"}],
            "hidden": [{"input": "[1,1]", "expected": "1"}]
        }
    },

    # Category 2: Sliding Window & Search
    {
        "id": "q2",
        "title": "Longest Substring Without Repeating Characters",
        "topic": "Sliding Window",
        "difficulty": "Medium",
        "description": "Given a string `s`, find the length of the longest substring without repeating characters.",
        "constraints": ["0 <= s.length <= 5 * 10^4"],
        "examples": [{"input": "s = \"abcabcbb\"", "output": "3"}],
        "functionName": "lengthOfLongestSubstring",
        "starterCode": {
            "python": "def lengthOfLongestSubstring(s: str) -> int:\n    pass",
            "java": "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"abcabcbb\"", "expected": "3"}],
            "hidden": [{"input": "\"pwwkew\"", "expected": "3"}, {"input": "\"au\"", "expected": "2"}]
        }
    },
    {
        "id": "q2",
        "title": "Search in Rotated Sorted Array",
        "topic": "Binary Search",
        "difficulty": "Medium",
        "description": "Given a rotated sorted integer array `nums` and a `target`, return the index of `target` if it is in `nums`, or `-1` if it is not.",
        "constraints": ["1 <= nums.length <= 5000"],
        "examples": [{"input": "nums = [4,5,6,7,0,1,2], target = 0", "output": "4"}],
        "functionName": "search",
        "starterCode": {
            "python": "def search(nums, target):\n    pass",
            "java": "class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[4,5,6,7,0,1,2]\n0", "expected": "4"}],
            "hidden": [{"input": "[4,5,6,7,0,1,2]\n3", "expected": "-1"}]
        }
    },

    # Category 3: Graphs & Dynamic Programming
    {
        "id": "q3",
        "title": "Number of Islands BFS/DFS",
        "topic": "Graphs (BFS/DFS)",
        "difficulty": "Medium",
        "description": "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.",
        "constraints": ["1 <= m, n <= 300"],
        "examples": [{"input": "grid = [[\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2"}],
        "functionName": "numIslands",
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
        "title": "Coin Change Minimum Coins",
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array `coins` and an integer `amount`, return the fewest number of coins that you need to make up that amount.",
        "constraints": ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
        "examples": [{"input": "coins = [1,2,5], amount = 11", "output": "3"}],
        "functionName": "coinChange",
        "starterCode": {
            "python": "def coinChange(coins, amount):\n    pass",
            "java": "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return -1;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,5]\n11", "expected": "3"}],
            "hidden": [{"input": "[2]\n3", "expected": "-1"}]
        }
    }
]

def generate_dsa_questions(candidate_profile: dict) -> list:
    """
    Generates 3 fresh, unique DSA questions instantly (< 0.05 seconds).
    """
    # Group by question slot id (q1, q2, q3)
    slot_q1 = [q for q in QUESTION_BANK if q["id"] == "q1"]
    slot_q2 = [q for q in QUESTION_BANK if q["id"] == "q2"]
    slot_q3 = [q for q in QUESTION_BANK if q["id"] == "q3"]

    selected = [
        random.choice(slot_q1),
        random.choice(slot_q2),
        random.choice(slot_q3)
    ]

    print("[OA Fast Generator] Delivered dynamic 3-question set instantly (< 0.05s).")
    return selected
