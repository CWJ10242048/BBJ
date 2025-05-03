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
      :max-height="null"
    >
      <el-table-column label="排名" width="80" fixed="left">
        <template #default="scope">
          <div class="rank-cell">
            <span v-if="getRealIndex(scope.$index) < 3" class="rank-badge" :class="`rank-${getRealIndex(scope.$index) + 1}`">
              {{ getRealIndex(scope.$index) + 1 }}
            </span>
            <span v-else>{{ getRealIndex(scope.$index) + 1 }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="用户" width="250" fixed="left">
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
import type { ElTag } from 'element-plus'; // 导入 ElTag 类型

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

// 定义 Element Plus Tag 的类型
type ElTagType = InstanceType<typeof ElTag>['type'];

// 搜索和筛选条件
const searchKeyword = ref('')
const timeRange = ref('all')

// 分页设置
const currentPage = ref(1);
const pageSize = ref(10);

// 模拟的学生姓名 (扩充版)
const studentNames = [
  // 常见姓氏
  '李', '王', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', 
  '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗', 
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹', 
  '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡', 
  '余', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈', 
  '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金', 
  '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟', 
  '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯', 
  '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵', 
  '万', '钱', '严', '覃', '武', '戴', '莫', '孔', '向', '汤', 
  // 常见名字
  '伟', '芳', '娜', '秀英', '敏', '静', '莉', '强', '磊', '军', 
  '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', 
  '平', '刚', '桂英', '华', '飞', '辉', '英', '鹏', '雪', '梅', 
  '斌', '珍', '丽', '红', '波', '云', '琳', '丹', '翔', '文', 
  '芝', '金龙', '玉梅', '海燕', '建华', '小明', '小红', '志强', '亚楠', '婷婷', 
  '晓峰', '佳怡', '子涵', '欣怡', '梓涵', '雨涵', '诗涵', '梦琪', '嘉怡', '子轩', 
  '浩宇', '浩然', '博文', '宇轩', '子墨', '雨萱', '思涵', '逸凡', '晨曦', '思远'
];

// 生成更真实感的姓名
const generateRealisticName = (index: number, totalNames: number): string => {
  // 简单的姓+名组合方式
  const surnameIndex = index % 100; // 取前100个作为姓氏
  // 从100之后的名字中随机选一个作为名字
  const givenNameIndex = 100 + Math.floor(Math.random() * (totalNames - 100)); 
  // 如果索引超出，则简单重复
  const surname = studentNames[surnameIndex % totalNames]; 
  const givenName = studentNames[givenNameIndex % totalNames]; 
  
  // 避免姓和名相同
  if (surname === givenName) {
    const fallbackGivenNameIndex = (givenNameIndex + 1) % totalNames;
     // 确保 fallback 不会再次指向姓氏区或者和姓氏相同
    const finalGivenNameIndex = fallbackGivenNameIndex < 100 ? 100 + (fallbackGivenNameIndex % (totalNames - 100)) : fallbackGivenNameIndex;
    return surname + studentNames[finalGivenNameIndex];
  }
  return surname + givenName;
};

// 生成模拟用户数据
const generateMockUser = (index: number): UserRanking => {
  const name = generateRealisticName(index, studentNames.length);
  const solvedCount = Math.floor(Math.random() * 180); // 增加题目范围
  const submissionCount = solvedCount + Math.floor(Math.random() * 60); // 增加提交范围
  const easy = Math.floor(Math.random() * (solvedCount * 0.6));
  const medium = Math.floor(Math.random() * (solvedCount * 0.3));
  const hard = Math.max(0, solvedCount - easy - medium); // 确保总数匹配
  const points = easy * 1 + medium * 3 + hard * 5;
  const activityGraph = Array.from({ length: 7 }, () => Math.floor(Math.random() * 16)); // 0-15 提交
  const totalActivity = activityGraph.reduce((sum, val) => sum + val, 0);
  let activityLevel = '不活跃';
  if (totalActivity > 50) activityLevel = '非常活跃';
  else if (totalActivity > 20) activityLevel = '活跃';
  else if (totalActivity > 5) activityLevel = '一般';

  return {
    id: String(index + 1),
    name,
    avatar: Math.random() > 0.3 ? defaultAvatar : undefined, // 部分用户无头像
    role: index % 10 === 0 ? '教师' : '学生',
    solvedCount,
    submissionCount,
    difficultyCounts: { easy, medium, hard },
    points,
    activityGraph,
    activityLevel
  };
};

// 生成大量模拟数据
const totalMockUsers = 200; // 增加模拟用户总数到200
const userRankings = ref<UserRanking[]>([]);
for (let i = 0; i < totalMockUsers; i++) {
  userRankings.value.push(generateMockUser(i));
}
// 根据积分排序
userRankings.value.sort((a, b) => b.points - a.points);

// 计算所有经过筛选（搜索、时间范围）但未分页的用户列表
const fullyFilteredRankings = computed(() => {
  let filteredData = [...userRankings.value]; // 创建副本以防修改原始数据

  // 1. 时间范围过滤 (模拟)
  const range = timeRange.value;
  if (range !== 'all') {
    let fraction = 1.0;
    if (range === 'monthly') fraction = 0.7;
    else if (range === 'weekly') fraction = 0.4;
    else if (range === 'daily') fraction = 0.15;

    // 基于 ID 哈希的模拟筛选
    filteredData = filteredData.filter(user => {
      const userIdNum = parseInt(user.id, 10);
      return (userIdNum % 10) < (10 * fraction);
    });
  }

  // 2. 按搜索关键词过滤 (在时间过滤之后)
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    filteredData = filteredData.filter(user => 
      user.name.toLowerCase().includes(keyword)
    );
  }

  return filteredData;
});

// 计算当前页应显示的数据
const filteredRanking = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return fullyFilteredRankings.value.slice(start, end);
});

// 计算筛选后的总用户数
const totalUsers = computed(() => fullyFilteredRankings.value.length);

// 根据当前页和索引计算真实排名
const getRealIndex = (index: number): number => {
  return (currentPage.value - 1) * pageSize.value + index;
};

// 计算通过率
const getAcceptRate = (solved: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((solved / total) * 100);
};

// 获取活跃度样式类
const getActivityClass = (value: number): string => {
  if (value === 0) return 'activity-none';
  if (value <= 3) return 'activity-low';
  if (value <= 8) return 'activity-medium';
  return 'activity-high';
};

// 获取活跃度标签类型
const getActivityTagType = (level: string): ElTagType => {
  switch (level) {
    case '非常活跃': return 'success';
    case '活跃': return 'warning';
    case '一般': return 'info';
    case '不活跃': return 'info';
    default: return 'info';
  }
};

// 表格行的类名 - 修复表格行样式
const tableRowClassName = ({ row, rowIndex }: { row: UserRanking, rowIndex: number}): string => {
  // 获取真实排名索引
  const realIndex = getRealIndex(rowIndex);
  if (realIndex === 0) return 'rank-first-row';
  if (realIndex === 1) return 'rank-second-row';
  if (realIndex === 2) return 'rank-third-row';
  return '';
};

// 分页处理函数
const handleSizeChange = (newSize: number): void => {
  pageSize.value = newSize;
  currentPage.value = 1; // 改变每页条数后重置为第一页
};

// 处理页码变化
const handleCurrentChange = (newPage: number): void => {
  currentPage.value = newPage;
};
</script>

<style scoped>
.leaderboard-container {
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
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