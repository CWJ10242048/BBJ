<template>
  <div class="problem-detail-container" v-loading="loading">
    <div v-if="!loading" class="content-wrapper">
      <div class="problem-info">
        <div class="problem-header">
          <h2 class="problem-title">{{ problem.id }}. {{ problem.title }}</h2>
          <div class="problem-tags">
            <el-tag :type="getDifficultyType(problem.difficulty)" size="small">{{ problem.difficulty }}</el-tag>
            <el-tag type="info" size="small" class="category-tag">{{ problem.category }}</el-tag>
          </div>
        </div>
        
        <div class="problem-stats">
          <div class="stat-item">
            <span class="stat-label">提交次数:</span>
            <span class="stat-value">{{ problem.submitCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">通过率:</span>
            <span class="stat-value">{{ problem.acceptRate }}%</span>
          </div>
        </div>
        
        <el-divider />
        
        <div class="problem-description">
          <h3>题目描述</h3>
          <div v-html="problem.description"></div>
        </div>
        
        <div class="problem-examples">
          <h3>示例</h3>
          <div v-for="(example, index) in problem.examples" :key="index" class="example-item">
            <div class="example-header">示例 {{ index + 1 }}</div>
            <div class="example-content">
              <div class="example-input">
                <div class="example-label">输入:</div>
                <pre>{{ example.input }}</pre>
              </div>
              <div class="example-output">
                <div class="example-label">输出:</div>
                <pre>{{ example.output }}</pre>
              </div>
              <div v-if="example.explanation" class="example-explanation">
                <div class="example-label">解释:</div>
                <div>{{ example.explanation }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="problem.constraints" class="problem-constraints">
          <h3>限制条件</h3>
          <div v-html="problem.constraints"></div>
        </div>
      </div>
      
      <div class="code-editor">
        <div class="editor-header">
          <div class="language-selector">
            <span class="language-label">编程语言:</span>
            <el-select 
              v-model="selectedLanguage" 
              placeholder="选择语言" 
              class="language-select"
              size="large"
              @change="resetCode"
            >
              <el-option
                v-for="language in languages"
                :key="language.value"
                :label="language.label"
                :value="language.value"
              >
                <div class="language-option">
                  <span class="language-icon" :class="language.value">{{ language.icon }}</span>
                  <span>{{ language.label }}</span>
                </div>
              </el-option>
            </el-select>
          </div>
          <div class="editor-actions">
            <el-tooltip content="重置为初始代码" placement="top" effect="light">
              <el-button size="default" @click="resetCode" :icon="RefreshRight">重置代码</el-button>
            </el-tooltip>
            <el-tooltip content="运行并测试你的代码" placement="top" effect="light">
              <el-button size="default" type="primary" @click="runCode" :icon="VideoPlay">运行代码</el-button>
            </el-tooltip>
            <el-tooltip content="提交你的解答" placement="top" effect="light">
              <el-button size="default" type="success" @click="submitSolution" :icon="Check">提交</el-button>
            </el-tooltip>
          </div>
        </div>
        
        <div class="code-area">
          <div class="code-header">
            <div class="current-language">
              <span class="language-icon" :class="selectedLanguage">{{ getLangIcon() }}</span>
              <span>{{ getLangLabel() }}</span>
            </div>
            <div class="code-tips">
              <el-tooltip content="编写解决方案，然后点击运行代码测试" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <el-input
            v-model="code"
            type="textarea"
            :rows="20"
            placeholder="输入你的代码..."
            class="code-textarea"
            :spellcheck="false"
            resize="none"
          ></el-input>
        </div>
        
        <div v-if="runResult.show" class="run-result" :class="{'success': runResult.status === 'success', 'error': runResult.status === 'error'}">
          <div class="result-header">
            <span>运行结果</span>
            <el-button type="text" @click="runResult.show = false">关闭</el-button>
          </div>
          <div class="result-content">
            <div v-if="runResult.status === 'success'" class="success-message">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>所有测试用例通过!</span>
            </div>
            <div v-else-if="runResult.status === 'error'" class="error-message">
              <el-icon><CircleCloseFilled /></el-icon>
              <span>{{ runResult.message }}</span>
            </div>
            <div v-if="runResult.output" class="output-panel">
              <div class="panel-header">输出:</div>
              <pre>{{ runResult.output }}</pre>
            </div>
            <div v-if="runResult.expected" class="expected-panel">
              <div class="panel-header">预期输出:</div>
              <pre>{{ runResult.expected }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  CircleCheckFilled, 
  CircleCloseFilled, 
  RefreshRight, 
  VideoPlay, 
  Check,
  InfoFilled
} from '@element-plus/icons-vue'

// 定义题目接口
interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  submitCount: number;
  acceptRate: number;
  description: string;
  examples: Example[];
  constraints?: string;
  code?: Record<string, string>;
}

// 定义运行结果接口
interface RunResult {
  show: boolean;
  status: 'success' | 'error' | '';
  message: string;
  output?: string;
  expected?: string;
}

const route = useRoute()
const loading = ref(true)
const problemId = route.params.id as string

// 支持的编程语言
const languages = [
  { label: 'Python', value: 'python', icon: '🐍' },
  { label: 'Java', value: 'java', icon: '☕' },
  { label: 'C++', value: 'cpp', icon: '🔍' },
  { label: 'JavaScript', value: 'javascript', icon: '🟨' }
]

const selectedLanguage = ref('python')
const code = ref('')
const defaultCode = ref<Record<string, string>>({
  python: '# 在这里编写你的Python代码\n\ndef solution():\n    # 实现你的解决方案\n    pass\n',
  java: '// 在这里编写你的Java代码\n\npublic class Solution {\n    public static void main(String[] args) {\n        // 调用你的解决方案\n    }\n    \n    public static void solution() {\n        // 实现你的解决方案\n    }\n}',
  cpp: '// 在这里编写你的C++代码\n\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // 实现你的解决方案\n    }\n};\n\nint main() {\n    Solution s;\n    s.solution();\n    return 0;\n}',
  javascript: '// 在这里编写你的JavaScript代码\n\nfunction solution() {\n    // 实现你的解决方案\n}\n'
})

// 运行结果状态
const runResult = ref<RunResult>({
  show: false,
  status: '',
  message: ''
})

// 模拟题目数据
const problem = ref<Problem>({
  id: '1',
  title: '两数之和',
  difficulty: '简单',
  category: '数组',
  submitCount: 1000,
  acceptRate: 75,
  description: `<p>给定一个整数数组 <code>nums</code> 和一个整数目标值 <code>target</code>，请你在该数组中找出 <strong>和为目标值</strong> 的那 <strong>两个</strong> 整数，并返回它们的数组下标。</p>
<p>你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。</p>
<p>你可以按任意顺序返回答案。</p>`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]'
    },
    {
      input: 'nums = [3,3], target = 6',
      output: '[0,1]'
    }
  ],
  constraints: `<ul>
<li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
<li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
<li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
<li><strong>只会存在一个有效答案</strong></li>
</ul>`,
  code: {
    python: `def twoSum(nums, target):\n    # 在这里编写你的代码\n    pass`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // 在这里编写你的代码\n        return null;\n    }\n}`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // 在这里编写你的代码\n        return {};\n    }\n};`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // 在这里编写你的代码\n};`
  }
})

// 获取难度标签的类型
const getDifficultyType = (difficulty: string): string => {
  switch (difficulty) {
    case '简单': return 'success'
    case '中等': return 'warning'
    case '困难': return 'danger'
    default: return 'info'
  }
}

// 重置代码
const resetCode = () => {
  code.value = problem.value.code?.[selectedLanguage.value] || defaultCode.value[selectedLanguage.value]
}

// 运行代码
const runCode = () => {
  // 模拟运行代码
  runResult.value = {
    show: true,
    status: Math.random() > 0.3 ? 'success' : 'error',
    message: '测试用例 2 失败',
    output: '[1,3]',
    expected: '[1,2]'
  }
}

// 提交解决方案
const submitSolution = () => {
  // 模拟提交
  runResult.value = {
    show: true,
    status: Math.random() > 0.3 ? 'success' : 'error',
    message: '解答错误',
    output: '[1,3]',
    expected: '[1,2]'
  }
}

// 获取当前选择的语言图标
const getLangIcon = () => {
  const lang = languages.find(l => l.value === selectedLanguage.value)
  return lang ? lang.icon : ''
}

// 获取当前选择的语言名称
const getLangLabel = () => {
  const lang = languages.find(l => l.value === selectedLanguage.value)
  return lang ? lang.label : ''
}

// 根据语言选择设置代码
onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false
    // 设置初始代码
    resetCode()
  }, 500)
})
</script>

<style scoped>
.problem-detail-container {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.problem-info {
  width: 45%;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
}

.problem-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.problem-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.problem-tags {
  display: flex;
  gap: 8px;
}

.category-tag {
  margin-left: 5px;
}

.problem-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.problem-description h3,
.problem-examples h3,
.problem-constraints h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 1.2rem;
  color: #333;
}

.example-item {
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 15px;
  overflow: hidden;
}

.example-header {
  background-color: #eee;
  padding: 8px 12px;
  font-weight: bold;
}

.example-content {
  padding: 12px;
}

.example-input,
.example-output,
.example-explanation {
  margin-bottom: 10px;
}

.example-label {
  font-weight: bold;
  margin-bottom: 5px;
}

pre {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  font-family: monospace;
}

.code-editor {
  width: 55%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.code-area {
  flex: 1;
  overflow: hidden;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
}

.code-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  margin-bottom: 4px;
  border-bottom: 1px dashed #dcdfe6;
}

.current-language {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #409eff;
}

.code-tips {
  color: #909399;
  font-size: 16px;
}

.code-textarea {
  height: 100%;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-top: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.code-textarea :deep(textarea) {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  line-height: 1.6;
  padding: 12px;
  font-size: 14px;
  tab-size: 4;
  background-color: #fafafa;
}

.run-result {
  margin: 0 20px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.run-result.success {
  border-color: #67c23a;
}

.run-result.error {
  border-color: #f56c6c;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f5f5;
  font-weight: bold;
}

.result-content {
  padding: 15px;
}

.success-message,
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.success-message {
  color: #67c23a;
}

.error-message {
  color: #f56c6c;
}

.output-panel,
.expected-panel {
  margin-top: 15px;
}

.panel-header {
  font-weight: bold;
  margin-bottom: 8px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f5f7fa;
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.language-label {
  font-weight: bold;
  color: #606266;
  min-width: 80px;
}

.language-select {
  width: 200px;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-icon {
  font-size: 1.2rem;
  display: inline-block;
  width: 24px;
  text-align: center;
}

.python { color: #3776ab; }
.java { color: #007396; }
.cpp { color: #00599c; }
.javascript { color: #f7df1e; background-color: #333; padding: 0 2px; border-radius: 2px; }
</style> 