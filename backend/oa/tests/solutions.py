"""Reference implementations used by the OA runner verification matrix.

Each entry holds the same logic in all three languages, so the test suite can
assert that a given solution scores identically regardless of language. Three
variants per question:

  correct  - passes every public and hidden case
  wrong    - plausible but incorrect; must fail the same cases in every language
  stub     - the bank's own starter code, i.e. what RUN CODE hits on a fresh
             editor. The stubs are NOT the same logic across languages (Python's
             `pass` returns None while Java returns `false`), so the suite only
             asserts that they execute cleanly, not that they score alike.
"""

TWO_SUM = {
    "python": {
        "correct": """
def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []
""",
        "wrong": """
def twoSum(nums, target):
    return [0, 0]
""",
    },
    "java": {
        "correct": """
import java.util.*;
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[]{j, i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}
""",
        "wrong": """
class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{0, 0};
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            map<int, int>::iterator it = seen.find(target - nums[i]);
            if (it != seen.end()) {
                vector<int> out;
                out.push_back(it->second);
                out.push_back(i);
                return out;
            }
            seen[nums[i]] = i;
        }
        return vector<int>();
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> out;
        out.push_back(0);
        out.push_back(0);
        return out;
    }
};
""",
    },
}

CONTAINS_DUPLICATE = {
    "python": {
        "correct": """
def containsDuplicate(nums):
    return len(set(nums)) != len(nums)
""",
        "wrong": """
def containsDuplicate(nums):
    return False
""",
    },
    "java": {
        "correct": """
import java.util.*;
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int n : nums) if (!seen.add(n)) return true;
        return false;
    }
}
""",
        "wrong": """
class Solution {
    public boolean containsDuplicate(int[] nums) {
        return false;
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        set<int> seen;
        for (size_t i = 0; i < nums.size(); ++i)
            if (!seen.insert(nums[i]).second) return true;
        return false;
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        return false;
    }
};
""",
    },
}

LONGEST_SUBSTRING = {
    "python": {
        "correct": """
def lengthOfLongestSubstring(s):
    last = {}
    best = start = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1
        last[ch] = i
        best = max(best, i - start + 1)
    return best
""",
        "wrong": """
def lengthOfLongestSubstring(s):
    return len(s)
""",
    },
    "java": {
        "correct": """
import java.util.*;
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>();
        int best = 0, start = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c) && last.get(c) >= start) start = last.get(c) + 1;
            last.put(c, i);
            best = Math.max(best, i - start + 1);
        }
        return best;
    }
}
""",
        "wrong": """
class Solution {
    public int lengthOfLongestSubstring(String s) {
        return s.length();
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        map<char, int> last;
        int best = 0, start = 0;
        for (int i = 0; i < (int)s.size(); ++i) {
            if (last.count(s[i]) && last[s[i]] >= start) start = last[s[i]] + 1;
            last[s[i]] = i;
            if (i - start + 1 > best) best = i - start + 1;
        }
        return best;
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        return s.size();
    }
};
""",
    },
}

NUM_ISLANDS = {
    "python": {
        "correct": """
def numIslands(grid):
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    count = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] != '1':
                continue
            count += 1
            grid[i][j] = '0'
            stack = [(i, j)]
            while stack:
                x, y = stack.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == '1':
                        grid[nx][ny] = '0'
                        stack.append((nx, ny))
    return count
""",
        "wrong": """
def numIslands(grid):
    return len(grid)
""",
    },
    "java": {
        "correct": """
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int count = 0;
        for (int i = 0; i < grid.length; i++)
            for (int j = 0; j < grid[0].length; j++)
                if (grid[i][j] == '1') { count++; sink(grid, i, j); }
        return count;
    }

    private void sink(char[][] g, int i, int j) {
        if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j);
        sink(g, i - 1, j);
        sink(g, i, j + 1);
        sink(g, i, j - 1);
    }
}
""",
        "wrong": """
class Solution {
    public int numIslands(char[][] grid) {
        return grid.length;
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty()) return 0;
        int count = 0;
        for (int i = 0; i < (int)grid.size(); ++i)
            for (int j = 0; j < (int)grid[0].size(); ++j)
                if (grid[i][j] == '1') { ++count; sink(grid, i, j); }
        return count;
    }

    void sink(vector<vector<char>>& g, int i, int j) {
        if (i < 0 || i >= (int)g.size() || j < 0 || j >= (int)g[0].size() || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j);
        sink(g, i - 1, j);
        sink(g, i, j + 1);
        sink(g, i, j - 1);
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        return grid.size();
    }
};
""",
    },
}

GROUP_ANAGRAMS = {
    "python": {
        "correct": """
def groupAnagrams(strs):
    buckets = {}
    for s in strs:
        key = ''.join(sorted(s))
        buckets.setdefault(key, []).append(s)
    return list(buckets.values())
""",
        "wrong": """
def groupAnagrams(strs):
    return [[s] for s in strs]
""",
    },
    "java": {
        "correct": """
import java.util.*;
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> buckets = new HashMap<>();
        for (String s : strs) {
            char[] cs = s.toCharArray();
            Arrays.sort(cs);
            buckets.computeIfAbsent(new String(cs), k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(buckets.values());
    }
}
""",
        "wrong": """
import java.util.*;
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        List<List<String>> out = new ArrayList<>();
        for (String s : strs) out.add(Arrays.asList(s));
        return out;
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        map<string, vector<string>> buckets;
        for (size_t i = 0; i < strs.size(); ++i) {
            string key = strs[i];
            sort(key.begin(), key.end());
            buckets[key].push_back(strs[i]);
        }
        vector<vector<string>> out;
        for (map<string, vector<string>>::iterator it = buckets.begin(); it != buckets.end(); ++it)
            out.push_back(it->second);
        return out;
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        vector<vector<string>> out;
        for (size_t i = 0; i < strs.size(); ++i) {
            vector<string> solo;
            solo.push_back(strs[i]);
            out.push_back(solo);
        }
        return out;
    }
};
""",
    },
}

THREE_SUM = {
    "python": {
        "correct": """
def threeSum(nums):
    nums = sorted(nums)
    n = len(nums)
    out = []
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        lo, hi = i + 1, n - 1
        while lo < hi:
            total = nums[i] + nums[lo] + nums[hi]
            if total == 0:
                out.append([nums[i], nums[lo], nums[hi]])
                while lo < hi and nums[lo] == nums[lo + 1]:
                    lo += 1
                while lo < hi and nums[hi] == nums[hi - 1]:
                    hi -= 1
                lo += 1
                hi -= 1
            elif total < 0:
                lo += 1
            else:
                hi -= 1
    return out
""",
        "wrong": """
def threeSum(nums):
    return []
""",
    },
    "java": {
        "correct": """
import java.util.*;
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int lo = i + 1, hi = nums.length - 1;
            while (lo < hi) {
                int total = nums[i] + nums[lo] + nums[hi];
                if (total == 0) {
                    out.add(Arrays.asList(nums[i], nums[lo], nums[hi]));
                    while (lo < hi && nums[lo] == nums[lo + 1]) lo++;
                    while (lo < hi && nums[hi] == nums[hi - 1]) hi--;
                    lo++; hi--;
                } else if (total < 0) lo++;
                else hi--;
            }
        }
        return out;
    }
}
""",
        "wrong": """
import java.util.*;
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        return new ArrayList<>();
    }
}
""",
    },
    "cpp": {
        "correct": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> out;
        int n = nums.size();
        for (int i = 0; i < n - 2; ++i) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int lo = i + 1, hi = n - 1;
            while (lo < hi) {
                int total = nums[i] + nums[lo] + nums[hi];
                if (total == 0) {
                    vector<int> trip;
                    trip.push_back(nums[i]);
                    trip.push_back(nums[lo]);
                    trip.push_back(nums[hi]);
                    out.push_back(trip);
                    while (lo < hi && nums[lo] == nums[lo + 1]) ++lo;
                    while (lo < hi && nums[hi] == nums[hi - 1]) --hi;
                    ++lo; --hi;
                } else if (total < 0) ++lo;
                else --hi;
            }
        }
        return out;
    }
};
""",
        "wrong": """
#include <vector>
#include <string>
using namespace std;
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        return vector<vector<int>>();
    }
};
""",
    },
}

SOLUTIONS = {
    "twoSum": TWO_SUM,
    "containsDuplicate": CONTAINS_DUPLICATE,
    "lengthOfLongestSubstring": LONGEST_SUBSTRING,
    "numIslands": NUM_ISLANDS,
    "groupAnagrams": GROUP_ANAGRAMS,
    "threeSum": THREE_SUM,
}

LANGUAGES = ("python", "java", "cpp")
