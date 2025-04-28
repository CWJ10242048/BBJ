<template>
  <div class="leaderboard-container">
    <div class="filter-bar">
      <div class="time-filter">
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="monthly">本月</el-radio-button>
          <el-radio-button label="weekly">本周</el-radio-button>
          <el-radio-button label="daily">今日</el-radio-button>
        </el-radio-group>
      </div>
      <div class="search-bar">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索用户..." 
          :prefix-icon="Search"
          clearable
          size="small"
        />
      </div>
    </div>

    <el-table 
      :data="filteredRanking" 
      style="width: 100%" 
      :row-class-name="tableRowClassName"
    >
      <el-table-column label="排名" width="80">
        <template #default="scope">
          <div class="rank-cell">
            <span v-if="scope.$index < 3" class="rank-badge" :class="`rank-${scope.$index + 1}`">
              {{ scope.$index + 1 }}
            </span>
            <span v-else>{{ scope.$index + 1 }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="250">
        <template #default="scope">
          <div class="user-cell">
            <el-avatar :size="40" :src="scope.row.avatar || defaultAvatar" />
            <div class="user-info">
              <div class="user-name">{{ scope.row.name }}</div>
              <div class="user-role">{{ scope.row.role }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="solvedCount" label="解题数" sortable />
      <el-table-column prop="submissionCount" label="提交数" sortable />
      <el-table-column label="通过率" sortable>
        <template #default="scope">
          {{ getAcceptRate(scope.row.solvedCount, scope.row.submissionCount) }}%
        </template>
      </el-table-column>
      <el-table-column label="难度分布">
        <template #default="scope">
          <div class="difficulty-distribution">
            <el-tooltip content="简单题" placement="top">
              <div class="difficulty-item">
                <span class="difficulty-tag easy">{{ scope.row.difficultyCounts.easy }}</span>
              </div>
            </el-tooltip>
            <el-tooltip content="中等题" placement="top">
              <div class="difficulty-item">
                <span class="difficulty-tag medium">{{ scope.row.difficultyCounts.medium }}</span>
              </div>
            </el-tooltip>
            <el-tooltip content="困难题" placement="top">
              <div class="difficulty-item">
                <span class="difficulty-tag hard">{{ scope.row.difficultyCounts.hard }}</span>
              </div>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="points" label="积分" sortable />
      <el-table-column label="活跃度" width="120">
        <template #default="scope">
          <div class="activity-cell">
            <div class="activity-graph">
              <div 
                v-for="(day, index) in scope.row.activityGraph" 
                :key="index" 
                class="activity-day"
                :class="getActivityClass(day)"
                :title="`${day} 次提交`"
              ></div>
            </div>
            <el-tag size="small" class="activity-tag" :type="getActivityTagType(scope.row.activityLevel)">
              {{ scope.row.activityLevel }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div class="leaderboard-info">
      <h3>排行榜说明</h3>
      <ul>
        <li>积分计算规则：简单题(1分) + 中等题(3分) + 困难题(5分)</li>
        <li>排名更新频率：每小时更新一次</li>
        <li>活跃度：根据最近7天的提交次数计算</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 定义用户排名接口
interface DifficultyCount {
  easy: number;
  medium: number;
  hard: number;
}

interface UserRanking {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  solvedCount: number;
  submissionCount: number;
  difficultyCounts: DifficultyCount;
  points: number;
  activityGraph: number[];
  activityLevel: string;
}

// 搜索和筛选条件
const searchKeyword = ref('')
const timeRange = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(135) // 示例总数

// 模拟的排名数据
const userRankings = ref<UserRanking[]>([
  {
    id: '1',
    name: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    role: '教师',
    solvedCount: 125,
    submissionCount: 150,
    difficultyCounts: { easy: 50, medium: 60, hard: 15 },
    points: 320,
    activityGraph: [5, 10, 8, 15, 7, 3, 0],
    activityLevel: '非常活跃'
  },
  {
    id: '2',
    name: '李四',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    role: '学生',
    solvedCount: 118,
    submissionCount: 145,
    difficultyCounts: { easy: 45, medium: 58, hard: 15 },
    points: 315,
    activityGraph: [12, 8, 6, 4, 10, 5, 7],
    activityLevel: '非常活跃'
  },
  {
    id: '3',
    name: '王五',
    role: '学生',
    solvedCount: 105,
    submissionCount: 130,
    difficultyCounts: { easy: 48, medium: 52, hard: 5 },
    points: 272,
    activityGraph: [3, 5, 7, 4, 2, 8, 6],
    activityLevel: '活跃'
  },
  {
    id: '4',
    name: '赵六',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    role: '教师',
    solvedCount: 98,
    submissionCount: 120,
    difficultyCounts: { easy: 40, medium: 48, hard: 10 },
    points: 266,
    activityGraph: [2, 0, 4, 5, 6, 3, 1],
    activityLevel: '活跃'
  },
  {
    id: '5',
    name: '钱七',
    role: '学生',
    solvedCount: 90,
    submissionCount: 115,
    difficultyCounts: { easy: 42, medium: 43, hard: 5 },
    points: 233,
    activityGraph: [1, 0, 3, 2, 0, 1, 4],
    activityLevel: '一般'
  },
  {
    id: '6',
    name: '孙八',
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    role: '学生',
    solvedCount: 85,
    submissionCount: 112,
    difficultyCounts: { easy: 50, medium: 30, hard: 5 },
    points: 215,
    activityGraph: [0, 1, 0, 2, 3, 0, 1],
    activityLevel: '一般'
  },
  {
    id: '7',
    name: '周九',
    role: '教师',
    solvedCount: 82,
    submissionCount: 100,
    difficultyCounts: { easy: 45, medium: 32, hard: 5 },
    points: 211,
    activityGraph: [0, 0, 1, 0, 2, 0, 0],
    activityLevel: '不活跃'
  },
  {
    id: '8',
    name: '吴十',
    role: '学生',
    solvedCount: 75,
    submissionCount: 95,
    difficultyCounts: { easy: 40, medium: 30, hard: 5 },
    points: 195,
    activityGraph: [0, 0, 0, 1, 0, 0, 0],
    activityLevel: '不活跃'
  }
])

// 过滤后的排名列表
const filteredRanking = computed(() => {
  // 只有当有搜索关键词时才进行过滤
  if (!searchKeyword.value) {
    return userRankings.value
  }
  
  return userRankings.value.filter(user => {
    const matchKeyword = user.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    return matchKeyword
  })
})

// 计算通过率
const getAcceptRate = (solved: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((solved / total) * 100)
}

// 获取活跃度样式类
const getActivityClass = (value: number): string => {
  if (value === 0) return 'activity-none'
  if (value <= 3) return 'activity-low'
  if (value <= 8) return 'activity-medium'
  return 'activity-high'
}

// 获取活跃度标签类型
const getActivityTagType = (level: string): string => {
  switch (level) {
    case '非常活跃': return 'success'
    case '活跃': return 'warning'
    case '一般': return 'info'
    case '不活跃': return 'info'
    default: return 'info'
  }
}

// 表格行的类名
const tableRowClassName = ({ row, rowIndex }: { row: UserRanking, rowIndex: number}): string => {
  if (rowIndex === 0) return 'rank-first-row'
  if (rowIndex === 1) return 'rank-second-row'
  if (rowIndex === 2) return 'rank-third-row'
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
.leaderboard-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  width: 240px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.rank-cell {
  font-weight: bold;
  display: flex;
  justify-content: center;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.rank-1 {
  background-color: #f5c638;
}

.rank-2 {
  background-color: #c0c0c0;
}

.rank-3 {
  background-color: #cd7f32;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
}

.user-role {
  font-size: 12px;
  color: #909399;
}

.difficulty-distribution {
  display: flex;
  gap: 12px;
}

.difficulty-item {
  display: flex;
  align-items: center;
}

.difficulty-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  text-align: center;
}

.difficulty-tag.easy {
  background-color: #67c23a;
}

.difficulty-tag.medium {
  background-color: #e6a23c;
}

.difficulty-tag.hard {
  background-color: #f56c6c;
}

.activity-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.activity-graph {
  display: flex;
  gap: 2px;
}

.activity-day {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.activity-none {
  background-color: #ebeef5;
}

.activity-low {
  background-color: #c6e2ff;
}

.activity-medium {
  background-color: #79bbff;
}

.activity-high {
  background-color: #409eff;
}

.activity-tag {
  margin-top: 3px;
}

.leaderboard-info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
}

.leaderboard-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
  color: #303133;
}

.leaderboard-info ul {
  margin: 0;
  padding-left: 20px;
}

.leaderboard-info li {
  margin-bottom: 5px;
}

:deep(.rank-first-row) td {
  background-color: rgba(245, 198, 56, 0.1);
}

:deep(.rank-second-row) td {
  background-color: rgba(192, 192, 192, 0.1);
}

:deep(.rank-third-row) td {
  background-color: rgba(205, 127, 50, 0.1);
}
</style> 