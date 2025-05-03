<template>
  <div class="submissions-container">
    <div class="filter-section">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索题目、提交ID、提交人..." 
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
      <el-select v-model="status" placeholder="状态" clearable>
        <el-option label="通过" value="accepted" />
        <el-option label="错误答案" value="wrong-answer" />
        <el-option label="超时" value="time-limit-exceeded" />
        <el-option label="内存溢出" value="memory-limit-exceeded" />
        <el-option label="编译错误" value="compile-error" />
        <el-option label="运行时错误" value="runtime-error" />
      </el-select>
      <el-select v-model="language" placeholder="语言" clearable>
        <el-option label="Python" value="python" />
        <el-option label="Java" value="java" />
        <el-option label="C++" value="cpp" />
        <el-option label="JavaScript" value="javascript" />
      </el-select>
    </div>

    <el-table 
      :data="filteredSubmissions" 
      style="width: 100%" 
      @row-click="handleRowClick"
    >
      <el-table-column prop="id" label="提交ID" width="100" />
      <el-table-column prop="problemId" label="题目ID" width="100" />
      <el-table-column prop="problemTitle" label="题目" />
      <el-table-column prop="status" label="状态" width="150">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitter" label="提交人" width="120" />
      <el-table-column prop="runtime" label="执行时间" width="120">
        <template #default="scope">
          {{ scope.row.runtime }} ms
        </template>
      </el-table-column>
      <el-table-column prop="memory" label="内存消耗" width="120">
        <template #default="scope">
          {{ scope.row.memory }} MB
        </template>
      </el-table-column>
      <el-table-column prop="language" label="语言" width="120" />
      <el-table-column prop="aiScore" label="AI评分" width="100">
        <template #default="scope">
          <el-progress 
            :percentage="scope.row.aiScore" 
            :stroke-width="8" 
            :color="getScoreColor(scope.row.aiScore)" 
            :show-text="false" 
            style="width: 70px; display: inline-block; margin-right: 5px;"
          />
          {{ scope.row.aiScore }}
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button size="small" @click.stop="handleRowClick(scope.row)">详情</el-button>
          <el-button size="small" type="warning" @click.stop="handleReject(scope.row)">退回</el-button>
          <el-button size="small" type="danger" @click.stop="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalSubmissions"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="提交详情"
      width="80%"
      :before-close="handleClose"
    >
      <div class="submission-detail">
        <div class="detail-header">
          <div class="detail-item">
            <span class="detail-label">提交ID:</span>
            <span class="detail-value">{{ selectedSubmission.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">题目:</span>
            <span class="detail-value">
              <el-link type="primary" @click="goToProblem(selectedSubmission.problemId)">
                {{ selectedSubmission.problemId }}. {{ selectedSubmission.problemTitle }}
              </el-link>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态:</span>
            <span class="detail-value">
              <el-tag :type="getStatusType(selectedSubmission.status)">
                {{ getStatusText(selectedSubmission.status) }}
              </el-tag>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">语言:</span>
            <span class="detail-value">{{ selectedSubmission.language }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">执行时间:</span>
            <span class="detail-value">{{ selectedSubmission.runtime }} ms</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">内存消耗:</span>
            <span class="detail-value">{{ selectedSubmission.memory }} MB</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">提交时间:</span>
            <span class="detail-value">{{ selectedSubmission.submitTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">提交人:</span>
            <span class="detail-value">{{ selectedSubmission.submitter }}</span>
          </div>
        </div>

        <div class="code-section">
          <h3>提交的代码</h3>
          <div class="code-display">
            <pre>{{ selectedSubmission.code }}</pre>
          </div>
        </div>

        <div v-if="selectedSubmission.aiAssessment" class="ai-assessment-section">
          <h3>AI 代码评估</h3>
          <div class="assessment-display">
            <p>{{ selectedSubmission.aiAssessment }}</p>
          </div>
        </div>

        <div v-if="selectedSubmission.errorMessage" class="error-section">
          <h3>错误信息</h3>
          <div class="error-display">
            <pre>{{ selectedSubmission.errorMessage }}</pre>
          </div>
        </div>

        <div v-if="selectedSubmission.testCases && selectedSubmission.testCases.length > 0" class="test-cases">
          <h3>测试用例结果</h3>
          <el-table :data="selectedSubmission.testCases" border>
            <el-table-column prop="index" label="用例编号" width="100" />
            <el-table-column prop="input" label="输入" />
            <el-table-column prop="expected" label="预期输出" />
            <el-table-column prop="actual" label="实际输出" />
            <el-table-column prop="result" label="结果" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.result === 'pass' ? 'success' : 'danger'">
                  {{ scope.row.result === 'pass' ? '通过' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import type { ElTag } from 'element-plus' // 导入 ElTag 类型
import { ElMessage, ElMessageBox } from 'element-plus' // 导入消息和确认框组件

// 定义提交记录接口
interface TestCase {
  index: number;
  input: string;
  expected: string;
  actual: string;
  result: 'pass' | 'fail';
}

interface Submission {
  id: string;
  problemId: string;
  problemTitle: string;
  status: string;
  runtime: number;
  memory: number;
  language: string;
  submitTime: string;
  code: string;
  submitter: string; // 添加提交人字段
  aiScore: number; // AI 整体评分
  aiAssessment: string; // AI 详细评估
  errorMessage?: string;
  testCases?: TestCase[];
}

const router = useRouter()

// 搜索和筛选条件
const searchKeyword = ref('')
const status = ref('')
const language = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框相关
const dialogVisible = ref(false)
const selectedSubmission = ref<Submission>({
  id: '',
  problemId: '',
  problemTitle: '',
  status: '',
  runtime: 0,
  memory: 0,
  language: '',
  submitTime: '',
  code: '',
  submitter: '', // 初始化提交人
  aiScore: 0, // 初始化 AI 评分
  aiAssessment: '' // 初始化 AI 评估
})

// 定义 Element Plus Tag 的类型
type ElTagType = InstanceType<typeof ElTag>['type'];

// 从 StudentBoard.vue 借鉴的学生姓名列表
const studentNames = [
  '张宇轩', '李佳悦', '王诗涵', '赵梓萱', '刘逸凡',
  '陈静怡', '杨子墨', '黄雨桐', '吴梦琪', '郑晨曦',
  '孙浩然', '周子涵', '徐梓涵', '马思远', '高子涵',
  '彭思源', '宋子墨', '杜思远', '谢梓萱', '邓子墨',
  '冯思远', '蒋梓萱', '韩子墨', '贾思远', '廖梓萱',
  '秦子墨', '石思远', '陶梓萱', '魏子墨', '尤思远'
];

// 获取随机学生姓名
const getRandomName = () => studentNames[Math.floor(Math.random() * studentNames.length)];

// 模拟的提交数据 (丰富版)
const submissions = ref<Submission[]>([
  { 
    id: 'SUB123456', 
    problemId: '1', 
    problemTitle: '两数之和', 
    status: 'accepted', 
    runtime: 5, 
    memory: 8.2, 
    language: 'Python', 
    submitTime: '2023-05-15 14:30:22',
    submitter: getRandomName(),
    aiScore: 92,
    aiAssessment: '代码结构清晰，逻辑正确，使用了哈希表优化查找效率，时间复杂度 O(n)，空间复杂度 O(n)。符合题目要求，对哈希表应用掌握熟练。',
    code: 'def twoSum(nums, target):\n    map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in map:\n            return [map[complement], i]\n        map[num] = i\n    return []' 
  },
  { 
    id: 'SUB123457', 
    problemId: '2', 
    problemTitle: '两数相加', 
    status: 'wrong-answer', 
    runtime: 10, 
    memory: 9.5, 
    language: 'Java', 
    submitTime: '2023-05-15 15:12:45',
    submitter: getRandomName(),
    aiScore: 65,
    aiAssessment: '代码基本逻辑正确，但未能处理输入数组中包含重复元素且目标值是其两倍的情况（例如 [3,3], 6），导致测试用例失败。对边界条件和特殊情况考虑不足。',
    code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return null;\n    }\n}',
    errorMessage: '测试用例 3 失败\n输入: [3,3], 6\n预期输出: [0,1]\n实际输出: [1,0]',
    testCases: [
      { index: 1, input: '[2,7,11,15], 9', expected: '[0,1]', actual: '[0,1]', result: 'pass' },
      { index: 2, input: '[3,2,4], 6', expected: '[1,2]', actual: '[1,2]', result: 'pass' },
      { index: 3, input: '[3,3], 6', expected: '[0,1]', actual: '[1,0]', result: 'fail' }
    ]
  },
  { 
    id: 'SUB123458', 
    problemId: '3', 
    problemTitle: '无重复字符的最长子串', 
    status: 'time-limit-exceeded', 
    runtime: 2000, 
    memory: 15.1, 
    language: 'C++', 
    submitTime: '2023-05-16 09:45:31',
    submitter: getRandomName(),
    aiScore: 40,
    aiAssessment: '使用了暴力解法，双重循环检查所有子串，时间复杂度 O(n^3) 或 O(n^2)（取决于 checkRepetition 实现），效率较低，导致超时。需要学习更优化的算法，如滑动窗口。',
    code: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        int n = s.length();\n        int ans = 0;\n        for (int i = 0; i < n; i++)\n            for (int j = i; j < n; j++) {\n                if (checkRepetition(s, i, j)) {\n                    ans = max(ans, j - i + 1);\n                }\n            }\n        return ans;\n    }\n    \n    bool checkRepetition(string& s, int start, int end) {\n        vector<int> chars(128);\n        for (int i = start; i <= end; i++) {\n            char c = s[i];\n            chars[c]++;\n            if (chars[c] > 1) {\n                return false;\n            }\n        }\n        return true;\n    }\n};',
    errorMessage: '执行时间超过限制: 2000ms'
  },
  { 
    id: 'SUB123459', 
    problemId: '4', 
    problemTitle: '寻找两个正序数组的中位数', 
    status: 'compile-error', 
    runtime: 0, 
    memory: 0, 
    language: 'JavaScript', 
    submitTime: '2023-05-16 11:22:18',
    submitter: getRandomName(),
    aiScore: 20, // 编译错误评分较低
    aiAssessment: '代码存在语法错误（SyntaxError: Unexpected token }），无法编译通过。需要检查括号匹配和代码结构。基础语法掌握有待加强。',
    code: 'var findMedianSortedArrays = function(nums1, nums2) {\n    const merged = [];\n    let i = 0, j = 0;\n    \n    // 合并两个有序数组\n    while (i < nums1.length && j < nums2.length) {\n        if (nums1[i] < nums2[j]) {\n            merged.push(nums1[i++]);\n        } else {\n            merged.push(nums2[j++]);\n        }\n    }\n    \n    // 处理剩余元素\n    while (i < nums1.length) {\n        merged.push(nums1[i++]);\n    }\n    \n    while (j < nums2.length) {\n        merged.push(nums2[j++]);\n    }\n    \n    // 计算中位数\n    const mid = Math.floor(merged.length / 2);\n    return merged.length % 2 === 0\n        ? (merged[mid - 1] + merged[mid]) / 2\n        : merged[mid];\n};',
    errorMessage: 'SyntaxError: Unexpected token }'
  },
  { 
    id: 'SUB123460', 
    problemId: '5', 
    problemTitle: '最长回文子串', 
    status: 'runtime-error', 
    runtime: 15, 
    memory: 10.2, 
    language: 'Python', 
    submitTime: '2023-05-17 16:08:45',
    submitter: getRandomName(),
    aiScore: 55,
    aiAssessment: '使用了动态规划求解，思路正确，但实现中存在数组越界问题 (IndexError)。对边界条件处理和 dp 数组索引理解不够深入。',
    code: 'def longestPalindrome(s):\n    if not s:\n        return ""\n    \n    n = len(s)\n    # 创建一个二维数组来存储子问题的解\n    dp = [[False for _ in range(n)] for _ in range(n)]\n    \n    start = 0  # 回文子串的起始位置\n    max_length = 1  # 回文子串的最大长度\n    \n    # 所有长度为1的子串都是回文\n    for i in range(n):\n        dp[i][i] = True\n    \n    # 检查长度为2的子串\n    for i in range(n-1):\n        if s[i] == s[i+1]:\n            dp[i][i+1] = True\n            start = i\n            max_length = 2\n    \n    # 检查长度大于2的子串\n    for length in range(3, n+1):\n        for i in range(n-length+1):\n            j = i + length - 1  # 子串的结束位置\n            \n            # 检查子串s[i..j]是否是回文\n            if s[i] == s[j] and dp[i+1][j-1]:\n                dp[i][j] = True\n                start = i\n                max_length = length\n    \n    return s[start:start+max_length]',
    errorMessage: 'IndexError: list index out of range\n  File "<string>", line 25, in longestPalindrome\n    if s[i] == s[j] and dp[i+1][j-1]:'
  },
  // --- 新增的模拟数据 ---
  {
    id: 'SUB123461',
    problemId: '1',
    problemTitle: '两数之和',
    status: 'accepted',
    runtime: 8,
    memory: 7.5,
    language: 'C++',
    submitTime: '2023-05-18 10:05:11',
    submitter: getRandomName(),
    aiScore: 95,
    aiAssessment: '代码实现正确，使用了 C++ STL 中的 unordered_map，效率高。代码风格良好，变量命名清晰。对 C++ 和哈希表掌握很好。',
    code: '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for(int i=0; i<nums.size(); ++i) {\n            int complement = target - nums[i];\n            if(map.count(complement)) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};'
  },
  {
    id: 'SUB123462',
    problemId: '3',
    problemTitle: '无重复字符的最长子串',
    status: 'accepted',
    runtime: 12,
    memory: 10.8,
    language: 'JavaScript',
    submitTime: '2023-05-18 11:30:55',
    submitter: getRandomName(),
    aiScore: 88,
    aiAssessment: '使用了滑动窗口和 Map 数据结构，是解决此题的优选方法之一。时间复杂度 O(n)，空间复杂度 O(k)（k 为字符集大小）。代码逻辑清晰，效率较高。',
    code: 'var lengthOfLongestSubstring = function(s) {\n    let maxLen = 0;\n    let start = 0;\n    const map = new Map();\n\n    for (let end = 0; end < s.length; end++) {\n        if (map.has(s[end]) && map.get(s[end]) >= start) {\n            start = map.get(s[end]) + 1;\n        }\n        map.set(s[end], end);\n        maxLen = Math.max(maxLen, end - start + 1);\n    }\n\n    return maxLen;\n};'
  },
  {
    id: 'SUB123463',
    problemId: '2',
    problemTitle: '两数相加',
    status: 'memory-limit-exceeded',
    runtime: 50,
    memory: 512.5, // 故意设大内存
    language: 'Python',
    submitTime: '2023-05-18 14:20:03',
    submitter: getRandomName(),
    aiScore: 30, // 内存溢出评分低
    aiAssessment: '代码尝试创建了过大的数据结构，导致内存溢出。需要优化空间复杂度，避免不必要的内存消耗。对算法的空间复杂度理解不足。',
    code: '# 这段代码故意设计为可能导致内存溢出（非实际有效代码）\ndef addTwoNumbers(l1, l2):\n    dummy = ListNode()\n    curr = dummy\n    carry = 0\n    # 尝试创建非常大的列表来模拟内存问题\n    large_list = [0] * (10**8) \n    while l1 or l2 or carry:\n        v1 = l1.val if l1 else 0\n        v2 = l2.val if l2 else 0\n        val = v1 + v2 + carry\n        carry = val // 10\n        val = val % 10\n        curr.next = ListNode(val)\n        curr = curr.next\n        l1 = l1.next if l1 else None\n        l2 = l2.next if l2 else None\n    return dummy.next',
    errorMessage: 'Memory Limit Exceeded: 512.5 MB'
  },
  {
    id: 'SUB123464',
    problemId: '1',
    problemTitle: '两数之和',
    status: 'runtime-error',
    runtime: 3,
    memory: 6.1,
    language: 'Java',
    submitTime: '2023-05-19 09:01:40',
    submitter: getRandomName(),
    aiScore: 45,
    aiAssessment: '代码存在明显的运行时错误（数组越界）。直接访问 `nums[nums.length]` 是不合法的。需要仔细检查数组索引和边界条件。',
    code: 'class Solution {\\n    public int[] twoSum(int[] nums, int target) {\\n        // 故意制造一个数组越界错误\\n        return new int[] { nums[nums.length], 0 }; \\n    }\\n}',
    errorMessage: 'ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4'
  },
  {
    id: 'SUB123465',
    problemId: '5',
    problemTitle: '最长回文子串',
    status: 'accepted',
    runtime: 150,
    memory: 25.6,
    language: 'C++',
    submitTime: '2023-05-19 15:55:29',
    submitter: getRandomName(),
    aiScore: 98,
    aiAssessment: '采用了动态规划方法，实现清晰，逻辑严谨。正确处理了边界条件和状态转移。时间复杂度 O(n^2)，空间复杂度 O(n^2)。代码质量高，对动态规划掌握熟练。',
    code: '#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    string longestPalindrome(string s) {\n        int n = s.length();\n        if (n < 2) return s;\n        int start = 0, maxLen = 1;\n        vector<vector<bool>> dp(n, vector<bool>(n, false));\n\n        for (int i = 0; i < n; ++i) dp[i][i] = true;\n\n        for (int len = 2; len <= n; ++len) {\n            for (int i = 0; i <= n - len; ++i) {\n                int j = i + len - 1;\n                if (s[i] == s[j]) {\n                    if (len == 2 || dp[i + 1][j - 1]) {\n                        dp[i][j] = true;\n                        if (len > maxLen) {\n                            maxLen = len;\n                            start = i;\n                        }\n                    }\n                }\n            }\n        }\n        return s.substr(start, maxLen);\n    }\n};'
  }
])

// 计算所有经过筛选但未分页的提交列表
const fullyFilteredSubmissions = computed(() => {
  // 只有当筛选条件变化时才重新计算
  if (!searchKeyword.value && !status.value && !language.value) {
    return submissions.value;
  }
  
  return submissions.value.filter(submission => {
    const matchKeyword = !searchKeyword.value || 
      submission.problemTitle.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      submission.problemId.includes(searchKeyword.value) ||
      submission.id.toLowerCase().includes(searchKeyword.value.toLowerCase()) || // id 搜索也忽略大小写
      submission.submitter.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    const matchStatus = !status.value || submission.status === status.value
    
    const matchLanguage = !language.value || submission.language.toLowerCase() === language.value.toLowerCase()
    
    return matchKeyword && matchStatus && matchLanguage
  });
});

// 过滤后的提交列表 (应用分页)
const filteredSubmissions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return fullyFilteredSubmissions.value.slice(start, end);
});

// 总提交数应反映筛选后的数量
const totalSubmissions = computed(() => fullyFilteredSubmissions.value.length);

// 获取状态标签的类型
const getStatusType = (status: string): ElTagType => { // 使用 ElTagType
  switch (status) {
    case 'accepted': return 'success'
    case 'wrong-answer': return 'danger'
    case 'time-limit-exceeded': return 'warning'
    case 'memory-limit-exceeded': return 'warning'
    case 'compile-error': return 'info'
    case 'runtime-error': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'accepted': return '通过'
    case 'wrong-answer': return '错误答案'
    case 'time-limit-exceeded': return '超时'
    case 'memory-limit-exceeded': return '内存溢出'
    case 'compile-error': return '编译错误'
    case 'runtime-error': return '运行时错误'
    default: return '未知'
  }
}

// 点击行显示详情 (现在由按钮触发)
// const handleRowClick = (row: Submission): void => {
//   selectedSubmission.value = row
//   dialogVisible.value = true
// }

// 点击行或详情按钮显示详情
const handleRowClick = (row: Submission): void => {
  selectedSubmission.value = row
  dialogVisible.value = true
}

// 处理退回操作
const handleReject = (row: Submission): void => {
  ElMessageBox.confirm(
    `确定要退回提交 ${row.id} (提交人: ${row.submitter}) 吗？此操作会将其从列表中移除。`,
    '确认退回',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = submissions.value.findIndex(sub => sub.id === row.id);
      if (index !== -1) {
        submissions.value.splice(index, 1);
        ElMessage({ type: 'success', message: '提交已退回' });
      } else {
        ElMessage({ type: 'error', message: '未找到要退回的提交' });
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消退回' });
    });
};

// 处理删除操作
const handleDelete = (row: Submission): void => {
  ElMessageBox.confirm(
    `确定要永久删除提交 ${row.id} (提交人: ${row.submitter}) 吗？此操作无法撤销。`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error', // 使用 error 类型以示警告
      confirmButtonClass: 'el-button--danger' // 强调删除按钮
    }
  )
    .then(() => {
      const index = submissions.value.findIndex(sub => sub.id === row.id);
      if (index !== -1) {
        submissions.value.splice(index, 1);
        ElMessage({ type: 'success', message: '提交已删除' });
      } else {
        ElMessage({ type: 'error', message: '未找到要删除的提交' });
      }
    })
    .catch(() => {
      ElMessage({ type: 'info', message: '已取消删除' });
    });
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 前往题目详情
const goToProblem = (problemId: string): void => {
  router.push(`/oj/problem/${problemId}`)
  dialogVisible.value = false
}

// 处理每页显示数量变化
const handleSizeChange = (size: number): void => {
  pageSize.value = size;
  currentPage.value = 1; // 页大小变化时，通常回到第一页
  // 数据会自动根据计算属性重新渲染
}

// 处理页码变化
const handleCurrentChange = (page: number): void => {
  currentPage.value = page;
  // 数据会自动根据计算属性重新渲染
}

// 根据分数获取进度条颜色
const getScoreColor = (score: number): string => {
  if (score >= 90) return '#67c23a'; // 优秀
  if (score >= 60) return '#e6a23c'; // 及格
  return '#f56c6c'; // 不及格
};
</script>

<style scoped>
.submissions-container {
  padding: 20px;
  display: flex; /* 使用 Flexbox 布局 */
  flex-direction: column; /* 垂直排列子元素 */
  height: calc(100vh - 100px); /* 尝试计算高度，减去可能的 header/nav 高度 */
  /* 或者使用 height: 100%; 如果父容器有确定高度 */
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 让表格占据剩余空间 */
.el-table {
  flex-grow: 1; /* 表格伸展以填充可用空间 */
  margin-bottom: 20px; /* 在表格和分页之间添加一些间距 */
  overflow-y: auto; /* 如果内容过多，表格内部滚动 */
}

.submission-detail {
  padding: 20px;
}

.detail-header {
  display: grid;
  /* grid-template-columns: repeat(3, 1fr); 改为4列以容纳提交人 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 响应式布局 */
  gap: 15px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  font-weight: bold;
  color: #666;
}

.code-section, 
.error-section,
.test-cases,
.ai-assessment-section {
  margin-top: 20px;
}

.code-section h3,
.error-section h3,
.test-cases h3,
.ai-assessment-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.code-display,
.error-display,
.assessment-display {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
}

.code-display pre,
.error-display pre,
.assessment-display p {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
}

.error-display {
  background-color: #fef0f0; /* 淡红色背景 */
}

.assessment-display {
  background-color: #f0f9eb; /* 淡绿色背景 */
  line-height: 1.6;
}

.assessment-display p {
  margin: 0;
  color: #67c23a; /* 绿色文字 */
}
</style> 