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
    # Slot 1 Questions (q1) - Easy / Foundation
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
    {
        "id": "q1",
        "title": "Contains Duplicate",
        "topic": "Arrays & Hashing",
        "difficulty": "Easy",
        "description": "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        "constraints": ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
        "examples": [{"input": "nums = [1,2,3,1]", "output": "true"}],
        "functionName": "containsDuplicate",
        "starterCode": {
            "python": "def containsDuplicate(nums: list[int]) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3,1]", "expected": "true"}],
            "hidden": [{"input": "[1,2,3,4]", "expected": "false"}, {"input": "[1,1,1,3,3,4,3,2,4,2]", "expected": "true"}]
        }
    },
    {
        "id": "q1",
        "title": "Valid Anagram",
        "topic": "Arrays & Hashing",
        "difficulty": "Easy",
        "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        "constraints": ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
        "examples": [{"input": "s = \"anagram\", t = \"nagaram\"", "output": "true"}],
        "functionName": "isAnagram",
        "starterCode": {
            "python": "def isAnagram(s: str, t: str) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"anagram\"\n\"nagaram\"", "expected": "true"}],
            "hidden": [{"input": "\"rat\"\n\"car\"", "expected": "false"}]
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
        "starterCode": {
            "python": "def isPalindrome(s: str) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"A man, a plan, a canal: Panama\"", "expected": "true"}],
            "hidden": [{"input": "\"race a car\"", "expected": "false"}, {"input": "\" \"", "expected": "true"}]
        }
    },
    {
        "id": "q1",
        "title": "Valid Parentheses",
        "topic": "Stack",
        "difficulty": "Easy",
        "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
        "constraints": ["1 <= s.length <= 10^4"],
        "examples": [{"input": "s = \"()[]{}\"", "output": "true"}],
        "functionName": "isValid",
        "starterCode": {
            "python": "def isValid(s: str) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}",
            "cpp": "#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "\"()[]{}\"", "expected": "true"}],
            "hidden": [{"input": "\"(]\"", "expected": "false"}, {"input": " \"([])\"", "expected": "true"}]
        }
    },
    {
        "id": "q1",
        "title": "Binary Search",
        "topic": "Binary Search",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.",
        "constraints": ["1 <= nums.length <= 10^4", "All elements in nums are unique."],
        "examples": [{"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"}],
        "functionName": "search",
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
    {
        "id": "q1",
        "title": "Reverse Linked List",
        "topic": "Linked List",
        "difficulty": "Easy",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "constraints": ["0 <= number of nodes <= 5000"],
        "examples": [{"input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]"}],
        "functionName": "reverseList",
        "starterCode": {
            "python": "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\ndef reverseList(head):\n    pass",
            "java": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3,4,5]", "expected": "[5,4,3,2,1]"}],
            "hidden": [{"input": "[1,2]", "expected": "[2,1]"}, {"input": "[]", "expected": "[]"}]
        }
    },
    {
        "id": "q1",
        "title": "Merge Two Sorted Lists",
        "topic": "Linked List",
        "difficulty": "Easy",
        "description": "You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into one sorted list.",
        "constraints": ["0 <= number of nodes in both lists <= 50"],
        "examples": [{"input": "list1 = [1,2,4], list2 = [1,3,4]", "output": "[1,1,2,3,4,4]"}],
        "functionName": "mergeTwoLists",
        "starterCode": {
            "python": "def mergeTwoLists(list1, list2):\n    pass",
            "java": "class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        return nullptr;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,4]\n[1,3,4]", "expected": "[1,1,2,3,4,4]"}],
            "hidden": [{"input": "[]\n[]", "expected": "[]"}]
        }
    },
    {
        "id": "q1",
        "title": "Linked List Cycle",
        "topic": "Linked List",
        "difficulty": "Easy",
        "description": "Given `head`, the head of a linked list, determine if the linked list has a cycle in it.",
        "constraints": ["0 <= number of nodes <= 10^4"],
        "examples": [{"input": "head = [3,2,0,-4], pos = 1", "output": "true"}],
        "functionName": "hasCycle",
        "starterCode": {
            "python": "def hasCycle(head) -> bool:\n    pass",
            "java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode* head) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[3,2,0,-4]\n1", "expected": "true"}],
            "hidden": [{"input": "[1]\n-1", "expected": "false"}]
        }
    },
    {
        "id": "q1",
        "title": "Invert Binary Tree",
        "topic": "Trees",
        "difficulty": "Easy",
        "description": "Given the root of a binary tree, invert the tree, and return its root.",
        "constraints": ["0 <= number of nodes <= 100"],
        "examples": [{"input": "root = [4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"}],
        "functionName": "invertTree",
        "starterCode": {
            "python": "def invertTree(root):\n    pass",
            "java": "class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        return nullptr;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[4,2,7,1,3,6,9]", "expected": "[4,7,2,9,6,3,1]"}],
            "hidden": [{"input": "[2,1,3]", "expected": "[2,3,1]"}, {"input": "[]", "expected": "[]"}]
        }
    },
    {
        "id": "q1",
        "title": "Maximum Depth of Binary Tree",
        "topic": "Trees",
        "difficulty": "Easy",
        "description": "Given the root of a binary tree, return its maximum depth.",
        "constraints": ["0 <= number of nodes <= 10^4"],
        "examples": [{"input": "root = [3,9,20,null,null,15,7]", "output": "3"}],
        "functionName": "maxDepth",
        "starterCode": {
            "python": "def maxDepth(root) -> int:\n    pass",
            "java": "class Solution {\n    public int maxDepth(TreeNode root) {\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[3,9,20,null,null,15,7]", "expected": "3"}],
            "hidden": [{"input": "[1,null,2]", "expected": "2"}]
        }
    },
    {
        "id": "q1",
        "title": "Climbing Stairs",
        "topic": "Dynamic Programming",
        "difficulty": "Easy",
        "description": "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "constraints": ["1 <= n <= 45"],
        "examples": [{"input": "n = 2", "output": "2"}],
        "functionName": "climbStairs",
        "starterCode": {
            "python": "def climbStairs(n: int) -> int:\n    pass",
            "java": "class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "2", "expected": "2"}],
            "hidden": [{"input": "3", "expected": "3"}, {"input": "5", "expected": "8"}]
        }
    },
    {
        "id": "q1",
        "title": "Single Number",
        "topic": "Bit Manipulation",
        "difficulty": "Easy",
        "description": "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.",
        "constraints": ["1 <= nums.length <= 3 * 10^4", "-3 * 10^4 <= nums[i] <= 3 * 10^4"],
        "examples": [{"input": "nums = [2,2,1]", "output": "1"}],
        "functionName": "singleNumber",
        "starterCode": {
            "python": "def singleNumber(nums: list[int]) -> int:\n    pass",
            "java": "class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[2,2,1]", "expected": "1"}],
            "hidden": [{"input": "[4,1,2,1,2]", "expected": "4"}, {"input": "[1]", "expected": "1"}]
        }
    },

    # Slot 2 Questions (q2) - Medium / Core Mechanics
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
    {
        "id": "q2",
        "title": "Group Anagrams",
        "topic": "Arrays & Hashing",
        "difficulty": "Medium",
        "description": "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        "constraints": ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
        "examples": [{"input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "output": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]"}],
        "functionName": "groupAnagrams",
        "starterCode": {
            "python": "def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", "expected": "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]}"}],
            "hidden": [{"input": "[\"\"]", "expected": "[[\"\"]]"}, {"input": "[\"a\"]", "expected": "[[\"a\"]]"}]
        }
    },
    {
        "id": "q2",
        "title": "Top K Frequent Elements",
        "topic": "Arrays & Hashing",
        "difficulty": "Medium",
        "description": "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.",
        "constraints": ["1 <= nums.length <= 10^5", "k is in the range [1, the number of unique elements in the array]."],
        "examples": [{"input": "nums = [1,1,1,2,2,3], k = 2", "output": "[1,2]"}],
        "functionName": "topKFrequent",
        "starterCode": {
            "python": "def topKFrequent(nums: list[int], k: int) -> list[int]:\n    pass",
            "java": "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        return new int[]{};\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,1,1,2,2,3]\n2", "expected": "[1, 2]"}],
            "hidden": [{"input": "[1]\n1", "expected": "[1]"}]
        }
    },
    {
        "id": "q2",
        "title": "Product of Array Except Self",
        "topic": "Arrays & Hashing",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. Write an algorithm that runs in O(n) time without division.",
        "constraints": ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
        "examples": [{"input": "nums = [1,2,3,4]", "output": "[24,12,8,6]"}],
        "functionName": "productExceptSelf",
        "starterCode": {
            "python": "def productExceptSelf(nums: list[int]) -> list[int]:\n    pass",
            "java": "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3,4]", "expected": "[24, 12, 8, 6]"}],
            "hidden": [{"input": "[-1,1,0,-3,3]", "expected": "[0, 0, 9, 0, 0]"}]
        }
    },
    {
        "id": "q2",
        "title": "3Sum",
        "topic": "Two Pointers",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.",
        "constraints": ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
        "examples": [{"input": "nums = [-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"}],
        "functionName": "threeSum",
        "starterCode": {
            "python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[-1,0,1,2,-1,-4]", "expected": "[[-1,-1,2],[-1,0,1]]"}],
            "hidden": [{"input": "[0,1,1]", "expected": "[]"}, {"input": "[0,0,0]", "expected": "[[0,0,0]]"}]
        }
    },
    {
        "id": "q2",
        "title": "Evaluate Reverse Polish Notation",
        "topic": "Stack",
        "difficulty": "Medium",
        "description": "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are `+`, `-`, `*`, and `/`.",
        "constraints": ["1 <= tokens.length <= 10^4"],
        "examples": [{"input": "tokens = [\"2\",\"1\",\"+\",\"3\",\"*\"]", "output": "9"}],
        "functionName": "evalRPN",
        "starterCode": {
            "python": "def evalRPN(tokens: list[str]) -> int:\n    pass",
            "java": "class Solution {\n    public int evalRPN(String[] tokens) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int evalRPN(vector<string>& tokens) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[\"2\",\"1\",\"+\",\"3\",\"*\"]", "expected": "9"}],
            "hidden": [{"input": "[\"4\",\"13\",\"5\",\"/\",\"+\"]", "expected": "6"}]
        }
    },
    {
        "id": "q2",
        "title": "Daily Temperatures",
        "topic": "Stack",
        "difficulty": "Medium",
        "description": "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `i-th` day to get a warmer temperature.",
        "constraints": ["1 <= temperatures.length <= 10^5"],
        "examples": [{"input": "temperatures = [73,74,75,71,69,72,76,73]", "output": "[1,1,4,2,1,1,0,0]"}],
        "functionName": "dailyTemperatures",
        "starterCode": {
            "python": "def dailyTemperatures(temperatures: list[int]) -> list[int]:\n    pass",
            "java": "class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        return new int[]{};\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[73,74,75,71,69,72,76,73]", "expected": "[1,1,4,2,1,1,0,0]"}],
            "hidden": [{"input": "[30,40,50,60]", "expected": "[1,1,1,0]"}]
        }
    },
    {
        "id": "q2",
        "title": "Find Minimum in Rotated Sorted Array",
        "topic": "Binary Search",
        "difficulty": "Medium",
        "description": "Given the sorted rotated array `nums` of unique elements, return the minimum element of this array.",
        "constraints": ["1 <= nums.length <= 5000", "-5000 <= nums[i] <= 5000"],
        "examples": [{"input": "nums = [3,4,5,1,2]", "output": "1"}],
        "functionName": "findMin",
        "starterCode": {
            "python": "def findMin(nums: list[int]) -> int:\n    pass",
            "java": "class Solution {\n    public int findMin(int[] nums) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[3,4,5,1,2]", "expected": "1"}],
            "hidden": [{"input": "[4,5,6,7,0,1,2]", "expected": "0"}]
        }
    },
    {
        "id": "q2",
        "title": "Validate Binary Search Tree",
        "topic": "Trees",
        "difficulty": "Medium",
        "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        "constraints": ["1 <= number of nodes <= 10^4"],
        "examples": [{"input": "root = [2,1,3]", "output": "true"}],
        "functionName": "isValidBST",
        "starterCode": {
            "python": "def isValidBST(root) -> bool:\n    pass",
            "java": "class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        return false;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[2,1,3]", "expected": "true"}],
            "hidden": [{"input": "[5,1,4,null,null,3,6]", "expected": "false"}]
        }
    },
    {
        "id": "q2",
        "title": "Subsets",
        "topic": "Backtracking",
        "difficulty": "Medium",
        "description": "Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
        "constraints": ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10"],
        "examples": [{"input": "nums = [1,2,3]", "output": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"}],
        "functionName": "subsets",
        "starterCode": {
            "python": "def subsets(nums: list[int]) -> list[list[int]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3]", "expected": "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"}],
            "hidden": [{"input": "[0]", "expected": "[[],[0]]"}]
        }
    },
    {
        "id": "q2",
        "title": "Permutations",
        "topic": "Backtracking",
        "difficulty": "Medium",
        "description": "Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.",
        "constraints": ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10"],
        "examples": [{"input": "nums = [1,2,3]", "output": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}],
        "functionName": "permute",
        "starterCode": {
            "python": "def permute(nums: list[int]) -> list[list[int]]:\n    pass",
            "java": "import java.util.*;\nclass Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        return new ArrayList<>();\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> permute(vector<int>& nums) {\n        return {};\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[1,2,3]", "expected": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}],
            "hidden": [{"input": "[0,1]", "expected": "[[0,1],[1,0]]"}]
        }
    },

    # Slot 3 Questions (q3) - Hard / Advanced Concepts
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
    },
    {
        "id": "q3",
        "title": "Trapping Rain Water",
        "topic": "Two Pointers",
        "difficulty": "Hard",
        "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "constraints": ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
        "examples": [{"input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "output": "6"}],
        "functionName": "trap",
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
    {
        "id": "q3",
        "title": "House Robber",
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police (cannot rob adjacent houses).",
        "constraints": ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
        "examples": [{"input": "nums = [1,2,3,1]", "output": "4"}],
        "functionName": "rob",
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
    {
        "id": "q3",
        "title": "Maximum Subarray",
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        "constraints": ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
        "examples": [{"input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}],
        "functionName": "maxSubArray",
        "starterCode": {
            "python": "def maxSubArray(nums: list[int]) -> int:\n    pass",
            "java": "class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}",
            "cpp": "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};"
        },
        "testCases": {
            "public": [{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "expected": "6"}],
            "hidden": [{"input": "[1]", "expected": "1"}, {"input": "[5,4,-1,7,8]", "expected": "23"}]
        }
    }
]

def validate_questions(questions: list) -> bool:
    """
    Validates that the generated questions conform to the required schema.
    """
    if len(questions) != 3:
        return False
    required_keys = ["id", "title", "topic", "difficulty", "description", "constraints", "examples", "functionName", "arguments", "argTypes", "returnType", "testCases"]
    for q in questions:
        if not all(k in q for k in required_keys):
            return False
        if not all(tc in q["testCases"] for tc in ["public", "hidden"]):
            return False
    return True

def build_starter_code(function_name: str, arguments: list, arg_types: list, return_type: str) -> dict:
    """
    Dynamically constructs valid starter code for Python, Java, and C++
    based on the AI-generated function signature.
    """
    # Type Mappings
    py_types = {"int": "int", "float": "float", "double": "float", "string": "str", "str": "str", "bool": "bool", "boolean": "bool", "list[int]": "list[int]", "list[str]": "list[str]"}
    
    java_types = {"int": "int", "float": "float", "double": "double", "string": "String", "str": "String", "bool": "boolean", "boolean": "boolean", "list[int]": "int[]", "list[str]": "String[]", "list[list[int]]": "List<List<Integer>>"}
    java_defaults = {"int": "0", "float": "0.0f", "double": "0.0", "String": '""', "boolean": "false", "int[]": "new int[]{}", "String[]": "new String[]{}", "List<List<Integer>>": "new ArrayList<>()"}

    cpp_types = {"int": "int", "float": "float", "double": "double", "string": "string", "str": "string", "bool": "bool", "boolean": "bool", "list[int]": "vector<int>", "list[str]": "vector<string>", "list[list[int]]": "vector<vector<int>>"}
    cpp_defaults = {"int": "0", "float": "0.0f", "double": "0.0", "string": '""', "bool": "false", "vector<int>": "{}", "vector<string>": "{}", "vector<vector<int>>": "{}"}

    # Python starter
    py_args = []
    for name, t in zip(arguments, arg_types):
        py_args.append(f"{name}: {py_types.get(t.lower(), 'any')}")
    py_ret = py_types.get(return_type.lower(), "any")
    py_code = f"def {function_name}({', '.join(py_args)}) -> {py_ret}:\n    # Write your solution here\n    pass"

    # Java starter
    java_args = []
    for name, t in zip(arguments, arg_types):
        java_args.append(f"{java_types.get(t.lower(), 'Object')} {name}")
    java_ret = java_types.get(return_type.lower(), "void")
    java_ret_default = java_defaults.get(java_ret, "null")
    
    java_imports = "import java.util.*;\n\n" if "List" in java_ret or any("List" in java_types.get(t.lower(), "") for t in arg_types) else ""
    java_code = f"{java_imports}class Solution {{\n    public {java_ret} {function_name}({', '.join(java_args)}) {{\n        // Write your solution here\n        return {java_ret_default};\n    }}\n}}"

    # C++ starter
    cpp_args = []
    for name, t in zip(arguments, arg_types):
        cpp_args.append(f"{cpp_types.get(t.lower(), 'auto')} {name}")
    cpp_ret = cpp_types.get(return_type.lower(), "void")
    cpp_ret_default = cpp_defaults.get(cpp_ret, "null")
    
    cpp_includes = "#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\n"
    cpp_code = f"{cpp_includes}class Solution {{\npublic:\n    {cpp_ret} {function_name}({', '.join(cpp_args)}) {{\n        // Write your solution here\n        return {cpp_ret_default};\n    }}\n}};"

    return {
        "python": py_code,
        "java": java_code,
        "cpp": cpp_code
    }

def generate_dsa_questions(candidate_profile: dict = None) -> list:
    """
    Generates 3 unique, dynamically-designed DSA questions matching candidate skills using OpenRouter API.
    Shuffles topics and scenarios to guarantee different questions on every single call.
    """
    if not API_KEY:
        print("[OA AI Generator] Warning: API_KEY not configured. Falling back to local QUESTION_BANK.")
        # Local random selection fallback
        slot_q1 = [q for q in QUESTION_BANK if q["id"] == "q1"]
        slot_q2 = [q for q in QUESTION_BANK if q["id"] == "q2"]
        slot_q3 = [q for q in QUESTION_BANK if q["id"] == "q3"]
        
        fallback_selection = [random.choice(slot_q1), random.choice(slot_q2), random.choice(slot_q3)]
        for idx, q in enumerate(fallback_selection, 1):
            q["id"] = f"q{idx}"
        return fallback_selection

    # Dynamic topic & scenario randomization to guarantee freshness
    categories_q1 = ["Arrays & Hashing", "Two Pointers", "Stack", "Binary Search", "Linked List"]
    categories_q2 = ["Sliding Window", "Trees", "Binary Search Tree", "Backtracking", "Graphs BFS/DFS", "Heap / Priority Queue"]
    categories_q3 = ["Dynamic Programming", "Graphs (BFS/DFS)", "Intervals", "Advanced Backtracking", "Advanced Trees"]

    scenarios = [
        "E-commerce order fulfillment system",
        "Cryptocurrency blockchain verification node",
        "Social network connection recommendation engine",
        "Autonomous delivery drone path optimizer",
        "Distributed log telemetry search engine",
        "Cloud computing server cluster load balancer",
        "Music streaming buffer optimizer",
        "Online gaming matchmaking system",
        "Stock market trading tick analysis pipeline",
        "IoT sensor data deduplication engine"
    ]

    selected_topics = [
        random.choice(categories_q1),
        random.choice(categories_q2),
        random.choice(categories_q3)
    ]
    selected_scenario = random.choice(scenarios)
    timestamp_seed = int(time.time() * 1000)

    prompt = (
        "Generate 3 BRAND NEW, highly unique DSA coding questions for an assessment.\n"
        f"Design the problem statements around this scenario: {selected_scenario}.\n"
        f"Unique Seed: {timestamp_seed}\n"
        "Requirements:\n"
        f"- Question 1 Topic: {selected_topics[0]} (Difficulty: Easy)\n"
        f"- Question 2 Topic: {selected_topics[1]} (Difficulty: Medium)\n"
        f"- Question 3 Topic: {selected_topics[2]} (Difficulty: Medium/Hard)\n"
        "- Generate completely new titles and descriptions. Do not repeat standard LeetCode problems verbatim, put a unique story/spin on them.\n"
        "- Do NOT write the programming code/starter code blocks in the JSON yourself. We will compile them on the backend.\n"
        "- Instead, provide argument list, argument types, and return type as strings.\n"
        "- Must include testCases (public and hidden) matching the argument count.\n"
        "Return JSON format:\n"
        "{\n"
        '  "questions": [\n'
        '    {\n'
        '      "id": "q1",\n'
        '      "title": "Title",\n'
        '      "topic": "Topic",\n'
        '      "difficulty": "Easy",\n'
        '      "description": "Description",\n'
        '      "constraints": ["Constraint"],\n'
        '      "examples": [{"input": "in", "output": "out"}],\n'
        '      "functionName": "solve",\n'
        '      "arguments": ["nums", "target"],\n'
        '      "argTypes": ["list[int]", "int"],\n'
        '      "returnType": "list[int]",\n'
        '      "testCases": {"public": [{"input": "1", "expected": "1"}], "hidden": [{"input": "2", "expected": "2"}]}\n'
        '    }\n'
        '  ]\n'
        '}\n'
        'Raw JSON only. No markdown formatting.'
    )

    models = [
        "google/gemini-2.5-flash",
        "qwen/qwen-2.5-coder-32b-instruct",
        "meta-llama/llama-3.3-70b-instruct"
    ]

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5001",
        "X-Title": "Vireza OA"
    }

    for model in models:
        # Support direct Gemini API key and OpenRouter key formats
        if not API_KEY.startswith("sk-or-"):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json"
                }
            }
            headers = {"Content-Type": "application/json"}
        else:
            url = "https://openrouter.ai/api/v1/chat/completions"
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.9,
                "max_tokens": 2500
            }

        try:
            print(f"[OA AI Generator] Attempting question generation using model: {model}...")
            res = requests.post(url, headers=headers, json=payload, timeout=25)
            if res.status_code == 200:
                data = res.json()
                raw_text = ""
                if "choices" in data and len(data["choices"]) > 0:
                    raw_text = data["choices"][0]["message"]["content"]
                elif "candidates" in data and len(data["candidates"]) > 0:
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

                raw_text = raw_text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]

                parsed = json.loads(raw_text.strip())
                questions = parsed.get("questions", [])

                if validate_questions(questions):
                    # Compile the Python, Java, and C++ starter codes dynamically on the backend
                    for idx, q in enumerate(questions, 1):
                        q["id"] = f"q{idx}"
                        q["starterCode"] = build_starter_code(
                            q["functionName"],
                            q["arguments"],
                            q["argTypes"],
                            q["returnType"]
                        )
                    print(f"[OA AI Generator] Successfully generated 3 unique questions using model: {model}.")
                    return questions
            else:
                print(f"[OA AI Generator] Model {model} returned status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[OA AI Generator] Error with model {model}: {e}")

    # Fallback to local QUESTION_BANK if all API calls fail
    print("[OA AI Generator] All AI model calls failed. Falling back to local QUESTION_BANK.")
    slot_q1 = [q for q in QUESTION_BANK if q["id"] == "q1"]
    slot_q2 = [q for q in QUESTION_BANK if q["id"] == "q2"]
    slot_q3 = [q for q in QUESTION_BANK if q["id"] == "q3"]
    
    fallback_selection = [random.choice(slot_q1), random.choice(slot_q2), random.choice(slot_q3)]
    for idx, q in enumerate(fallback_selection, 1):
        q["id"] = f"q{idx}"
    return fallback_selection


if __name__ == "__main__":
    # Test generator execution
    questions = generate_dsa_questions()
    print(f"Generated {len(questions)} questions:")
    for idx, q in enumerate(questions, 1):
        print(f"{idx}. {q['title']} [{q['topic']}] ({q['difficulty']})")