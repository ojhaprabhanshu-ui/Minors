"""Scratch probe for the C++ runner. Deleted once the real test suite lands."""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from oa.runner import cpp_runner  # noqa: E402

TWO_SUM = {
    "id": "q1", "title": "Two Sum", "topic": "Arrays", "difficulty": "Easy",
    "description": "Return indices of the two numbers that add up to target.",
    "functionName": "twoSum", "arguments": ["nums", "target"],
    "argTypes": ["list[int]", "int"], "returnType": "list[int]",
}

CONTAINS_DUP = dict(TWO_SUM, title="Contains Duplicate", functionName="containsDuplicate",
                    arguments=["nums"], argTypes=["list[int]"], returnType="bool",
                    description="Return true if any value appears twice.")

LONGEST_SUB = dict(TWO_SUM, title="Longest Substring", functionName="lengthOfLongestSubstring",
                   arguments=["s"], argTypes=["str"], returnType="int",
                   description="Find the length of the longest substring without repeats.")

NUM_ISLANDS = dict(TWO_SUM, title="Number of Islands", functionName="numIslands",
                   arguments=["grid"], argTypes=["list[list[str]]"], returnType="int",
                   description="Return the number of islands in the grid.")

GROUP_ANAGRAMS = dict(TWO_SUM, title="Group Anagrams", functionName="groupAnagrams",
                      arguments=["strs"], argTypes=["list[str]"],
                      returnType="list[list[str]]",
                      description="Group the anagrams together. You can return the answer in any order.")


def show(label, res):
    print("=" * 78)
    print(label)
    print("  success=%s passed=%s/%s runtimeMs=%.1f compileMs=%.1f" % (
        res["success"], res["totalPassed"], res["totalCases"],
        res["runtimeMs"], res.get("compileMs", 0)))
    if res.get("error"):
        print("  ERROR: %s" % str(res["error"])[:1200])
    for tr in res.get("testResults", []):
        print("    case %s passed=%s actual=%r expected=%r err=%s" % (
            tr["caseIndex"], tr["passed"], tr["actual"], tr["expected"],
            (str(tr["error"])[:200] if tr["error"] else None)))
    if res.get("consoleOutput"):
        print("  CONSOLE: %r" % res["consoleOutput"][:300])
    print("  toolchain: %s" % res.get("toolchain"))


def go(label, code, question, cases):
    show(label, cpp_runner.run(code, cases, question, time.time()))


# ---------------------------------------------------------------- correct
go("twoSum CORRECT (non-const ref params)", r'''
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); ++i)
            for (int j = i + 1; j < (int)nums.size(); ++j)
                if (nums[i] + nums[j] == target) { out.push_back(i); out.push_back(j); return out; }
        return out;
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"},
               {"input": "[3, 3]\n6", "expected": "[0, 1]"}])

go("containsDuplicate CORRECT (bool return)", r'''
#include <vector>
#include <set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        set<int> seen;
        for (int n : nums) { if (!seen.insert(n).second) return true; }
        return false;
    }
};
''', CONTAINS_DUP, [{"input": "[1,2,3,1]", "expected": "true"},
                    {"input": "[1,2,3,4]", "expected": "false"}])

go("lengthOfLongestSubstring CORRECT (string arg)", r'''
#include <string>
#include <map>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        map<char,int> last; int best = 0, start = 0;
        for (int i = 0; i < (int)s.size(); ++i) {
            if (last.count(s[i]) && last[s[i]] >= start) start = last[s[i]] + 1;
            last[s[i]] = i;
            if (i - start + 1 > best) best = i - start + 1;
        }
        return best;
    }
};
''', LONGEST_SUB, [{"input": '"abcabcbb"', "expected": "3"},
                   {"input": '"pwwkew"', "expected": "3"}])

go("numIslands CORRECT (vector<vector<char>> - argTypes LIE)", r'''
#include <vector>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int m = grid.size(), n = grid[0].size(), count = 0;
        for (int i = 0; i < m; ++i) for (int j = 0; j < n; ++j) {
            if (grid[i][j] != '1') continue;
            ++count;
            vector<pair<int,int>> stack; stack.push_back(make_pair(i,j)); grid[i][j] = '0';
            while (!stack.empty()) {
                pair<int,int> cur = stack.back(); stack.pop_back();
                int dx[4] = {1,-1,0,0}; int dy[4] = {0,0,1,-1};
                for (int d = 0; d < 4; ++d) {
                    int x = cur.first + dx[d], y = cur.second + dy[d];
                    if (x>=0 && x<m && y>=0 && y<n && grid[x][y]=='1') { grid[x][y]='0'; stack.push_back(make_pair(x,y)); }
                }
            }
        }
        return count;
    }
};
''', NUM_ISLANDS, [{"input": '[["1","1","0"],["1","1","0"],["0","0","1"]]', "expected": "2"},
                   {"input": '[["0"]]', "expected": "0"}])

go("groupAnagrams CORRECT (unordered compare)", r'''
#include <vector>
#include <string>
#include <map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        map<string, vector<string>> buckets;
        for (size_t i = 0; i < strs.size(); ++i) {
            string key = strs[i]; sort(key.begin(), key.end());
            buckets[key].push_back(strs[i]);
        }
        vector<vector<string>> out;
        for (map<string, vector<string> >::iterator it = buckets.begin(); it != buckets.end(); ++it)
            out.push_back(it->second);
        return out;
    }
};
''', GROUP_ANAGRAMS, [{"input": '["eat","tea","tan","ate","nat","bat"]',
                       "expected": '[["bat"],["nat","tan"],["ate","eat","tea"]]'},
                      {"input": '[""]', "expected": '[[""]]'}])

# ---------------------------------------------------------------- wrong / stub
go("twoSum SUBTLY WRONG", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out; out.push_back(0); out.push_back(0); return out;
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("twoSum EMPTY STUB", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {};
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

# ---------------------------------------------------------------- edge cases
go("candidate-added main()", r'''
#include <vector>
#include <cstdio>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); ++i)
            for (int j = i + 1; j < (int)nums.size(); ++j)
                if (nums[i] + nums[j] == target) { out.push_back(i); out.push_back(j); return out; }
        return out;
    }
};
int main() { printf("candidate main ran\n"); return 0; }
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("candidate stdout (cout) + renamed class", r'''
#include <vector>
#include <iostream>
using namespace std;
class MySolver {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        std::cout << "debugging from candidate" << std::endl;
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); ++i)
            for (int j = i + 1; j < (int)nums.size(); ++j)
                if (nums[i] + nums[j] == target) { out.push_back(i); out.push_back(j); return out; }
        return out;
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("COMPILE ERROR", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        this is not c++
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("RUNTIME EXCEPTION (out_of_range)", r'''
#include <vector>
#include <stdexcept>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        throw std::out_of_range("candidate blew up");
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("SEGFAULT on case 2 of 3 (earlier results must survive)", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        if (nums.size() > 2) {
            vector<int> out; out.push_back(0); out.push_back(1); return out;
        }
        int* p = 0; return vector<int>(1, *p);
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"},
               {"input": "[2, 7, 11, 15, 99]\n9", "expected": "[0, 1]"},
               {"input": "[1, 2]\n3", "expected": "[0, 1]"}])

go("INFINITE LOOP (timeout)", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        while (true) {}
        return vector<int>();
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("static method", r'''
#include <vector>
using namespace std;
class Solution {
public:
    static vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out; out.push_back(0); out.push_back(1); return out;
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("const-ref + std:: qualified signature", r'''
#include <vector>
class Solution {
public:
    std::vector<int> twoSum(const std::vector<int>& nums, int target) {
        std::vector<int> out; out.push_back(0); out.push_back(1); return out;
    }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("free function, no class", r'''
#include <vector>
using namespace std;
vector<int> twoSum(vector<int>& nums, int target) {
    vector<int> out; out.push_back(0); out.push_back(1); return out;
}
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("single-line multi-arg input '[2,7], 9'", r'''
#include <vector>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out;
        for (int i = 0; i < (int)nums.size(); ++i)
            for (int j = i + 1; j < (int)nums.size(); ++j)
                if (nums[i] + nums[j] == target) { out.push_back(i); out.push_back(j); return out; }
        return out;
    }
};
''', TWO_SUM, [{"input": "[2,7], 9", "expected": "[0, 1]"},
               {"input": "nums = [2,7]\ntarget = 9", "expected": "[0, 1]"}])

go("unsupported signature type (clear error, no template cascade)", r'''
#include <vector>
#include <set>
using namespace std;
class Solution {
public:
    set<int> twoSum(vector<int>& nums, int target) { return set<int>(); }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("no definition of the function at all", r'''
#include <vector>
using namespace std;
class Solution {
public:
    int somethingElse(vector<int>& nums) { return 0; }
};
''', TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])

go("empty code", "", TWO_SUM, [{"input": "[2, 7, 11, 15]\n9", "expected": "[0, 1]"}])
