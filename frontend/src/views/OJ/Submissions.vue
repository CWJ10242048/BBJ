<template>
  <div class="submissions-container">
    <div class="filter-section">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索题目..." 
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
      <el-table-column prop="submitTime" label="提交时间" width="180" />
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
        </div>

        <div class="code-section">
          <h3>提交的代码</h3>
          <div class="code-display">
            <pre>{{ selectedSubmission.code }}</pre>
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
const totalSubmissions = ref(150) // 示例总数

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
  code: ''
})

// 模拟的提交数据
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
    code: 'def longestPalindrome(s):\n    if not s:\n        return ""\n    \n    n = len(s)\n    # 创建一个二维数组来存储子问题的解\n    dp = [[False for _ in range(n)] for _ in range(n)]\n    \n    start = 0  # 回文子串的起始位置\n    max_length = 1  # 回文子串的最大长度\n    \n    # 所有长度为1的子串都是回文\n    for i in range(n):\n        dp[i][i] = True\n    \n    # 检查长度为2的子串\n    for i in range(n-1):\n        if s[i] == s[i+1]:\n            dp[i][i+1] = True\n            start = i\n            max_length = 2\n    \n    # 检查长度大于2的子串\n    for length in range(3, n+1):\n        for i in range(n-length+1):\n            j = i + length - 1  # 子串的结束位置\n            \n            # 检查子串s[i..j]是否是回文\n            if s[i] == s[j] and dp[i+1][j-1]:\n                dp[i][j] = True\n                start = i\n                max_length = length\n    \n    return s[start:start+max_length]',
    errorMessage: 'IndexError: list index out of range\n  File "<string>", line 25, in longestPalindrome\n    if s[i] == s[j] and dp[i+1][j-1]:'
  }
])

// 过滤后的提交列表
const filteredSubmissions = computed(() => {
  // 只有当筛选条件变化时才重新计算
  if (!searchKeyword.value && !status.value && !language.value) {
    return submissions.value
  }
  
  return submissions.value.filter(submission => {
    const matchKeyword = !searchKeyword.value || 
      submission.problemTitle.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      submission.problemId.includes(searchKeyword.value) ||
      submission.id.includes(searchKeyword.value)
    
    const matchStatus = !status.value || submission.status === status.value
    
    const matchLanguage = !language.value || submission.language.toLowerCase() === language.value.toLowerCase()
    
    return matchKeyword && matchStatus && matchLanguage
  })
})

// 获取状态标签的类型
const getStatusType = (status: string): string => {
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

// 点击行显示详情
const handleRowClick = (row: Submission): void => {
  selectedSubmission.value = row
  dialogVisible.value = true
}

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
  pageSize.value = size
  // 这里应该重新加载数据
}

// 处理页码变化
const handleCurrentChange = (page: number): void => {
  currentPage.value = page
  // 这里应该重新加载数据
}
</script>

<style scoped>
.submissions-container {
  padding: 20px;
  height: 100%;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.submission-detail {
  padding: 20px;
}

.detail-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
.test-cases {
  margin-top: 20px;
}

.code-section h3,
.error-section h3,
.test-cases h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.code-display,
.error-display {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
}

.code-display pre,
.error-display pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
}

.error-display pre {
  color: #f56c6c;
}
</style> 