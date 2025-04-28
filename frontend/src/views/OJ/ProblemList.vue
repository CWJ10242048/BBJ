<template>
  <div class="problem-list-container">
    <div class="filter-section">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索题目..." 
        :prefix-icon="Search"
        clearable
        class="search-input"
      />
      <el-select v-model="difficulty" placeholder="难度" clearable>
        <el-option label="简单" value="easy" />
        <el-option label="中等" value="medium" />
        <el-option label="困难" value="hard" />
      </el-select>
      <el-select v-model="category" placeholder="分类" clearable>
        <el-option label="数组" value="array" />
        <el-option label="字符串" value="string" />
        <el-option label="链表" value="linked-list" />
        <el-option label="树" value="tree" />
        <el-option label="动态规划" value="dp" />
        <el-option label="图" value="graph" />
      </el-select>
    </div>

    <el-table 
      :data="filteredProblems" 
      style="width: 100%" 
      @row-click="handleRowClick"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="题目" />
      <el-table-column prop="difficulty" label="难度" width="100">
        <template #default="scope">
          <el-tag :type="getDifficultyType(scope.row.difficulty)">
            {{ scope.row.difficulty }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="submitCount" label="提交次数" width="100" />
      <el-table-column prop="acceptRate" label="通过率" width="100">
        <template #default="scope">
          {{ scope.row.acceptRate }}%
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 'solved'" type="success">已解决</el-tag>
          <el-tag v-else-if="scope.row.status === 'attempted'" type="warning">尝试过</el-tag>
          <el-tag v-else type="info">未尝试</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalProblems"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

// 定义问题类型接口
interface Problem {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  submitCount: number;
  acceptRate: number;
  status: string;
}

// 定义表格行类型接口
interface TableRow {
  row: Problem;
}

const router = useRouter()

// 搜索和筛选条件
const searchKeyword = ref('')
const difficulty = ref('')
const category = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalProblems = ref(100) // 示例总数

// 模拟的问题数据
const problems = ref<Problem[]>([
  { id: '1', title: '两数之和', difficulty: '简单', category: '数组', submitCount: 1000, acceptRate: 75, status: 'solved' },
  { id: '2', title: '两数相加', difficulty: '中等', category: '链表', submitCount: 800, acceptRate: 65, status: 'attempted' },
  { id: '3', title: '无重复字符的最长子串', difficulty: '中等', category: '字符串', submitCount: 750, acceptRate: 60, status: '' },
  { id: '4', title: '寻找两个正序数组的中位数', difficulty: '困难', category: '数组', submitCount: 500, acceptRate: 40, status: '' },
  { id: '5', title: '最长回文子串', difficulty: '中等', category: '字符串', submitCount: 700, acceptRate: 55, status: 'solved' },
  { id: '6', title: 'Z 字形变换', difficulty: '中等', category: '字符串', submitCount: 600, acceptRate: 50, status: '' },
  { id: '7', title: '整数反转', difficulty: '简单', category: '数学', submitCount: 900, acceptRate: 70, status: 'solved' },
  { id: '8', title: '字符串转换整数 (atoi)', difficulty: '中等', category: '字符串', submitCount: 650, acceptRate: 45, status: '' },
  { id: '9', title: '回文数', difficulty: '简单', category: '数学', submitCount: 950, acceptRate: 80, status: 'solved' },
  { id: '10', title: '正则表达式匹配', difficulty: '困难', category: '字符串', submitCount: 450, acceptRate: 35, status: 'attempted' },
])

// 过滤后的问题列表
const filteredProblems = computed(() => {
  // 只有当筛选条件变化时才重新计算
  if (!searchKeyword.value && !difficulty.value && !category.value) {
    return problems.value
  }
  
  return problems.value.filter(problem => {
    const matchKeyword = !searchKeyword.value || 
      problem.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      problem.id.includes(searchKeyword.value)
    
    const matchDifficulty = !difficulty.value || problem.difficulty === difficulty.value
    
    const matchCategory = !category.value || problem.category === category.value
    
    return matchKeyword && matchDifficulty && matchCategory
  })
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

// 点击行跳转到题目详情
const handleRowClick = (row: Problem): void => {
  router.push(`/oj/problem/${row.id}`)
}

// 表格行的类名
const tableRowClassName = ({ row }: TableRow): string => {
  if (row.status === 'solved') {
    return 'solved-row'
  } else if (row.status === 'attempted') {
    return 'attempted-row'
  }
  return ''
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
.problem-list-container {
  display: flex;
  flex-direction: column;
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

:deep(.solved-row) {
  background-color: rgba(103, 194, 58, 0.1);
}

:deep(.attempted-row) {
  background-color: rgba(230, 162, 60, 0.1);
}
</style> 