<template>
  <div class="teacher-dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(card, index) in dashboardCards" :key="index">
        <el-card class="dashboard-card">
          <template #header>
            <div class="card-header">
              <el-icon :size="24" :color="card.color">
                <component :is="card.icon" />
              </el-icon>
              <span>{{ card.title }}</span>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ card.number }}</div>
            <div class="description">{{ card.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.type as 'primary' | 'success' | 'warning' | 'info' | 'danger'"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
            </div>
          </template>
          <el-table :data="todos" style="width: 100%">
            <el-table-column prop="content" label="内容" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, Document, Collection, DataLine } from '@element-plus/icons-vue'

const dashboardCards = ref([
  {
    title: '学生总数',
    number: '128',
    description: '当前班级学生数量',
    icon: 'User',
    color: '#409EFF'
  },
  {
    title: '课程数量',
    number: '12',
    description: '本学期开设课程',
    icon: 'Document',
    color: '#67C23A'
  },
  {
    title: '作业数量',
    number: '24',
    description: '本周布置作业',
    icon: 'Collection',
    color: '#E6A23C'
  },
  {
    title: '平均成绩',
    number: '85',
    description: '班级平均分',
    icon: 'DataLine',
    color: '#F56C6C'
  }
])

const activities = ref([
  {
    content: '发布了新的作业',
    time: '2024-03-20 14:30',
    type: 'primary'
  },
  {
    content: '批改了学生作业',
    time: '2024-03-20 10:15',
    type: 'success'
  },
  {
    content: '更新了课程资料',
    time: '2024-03-19 16:45',
    type: 'warning'
  }
])

const todos = ref([
  {
    content: '准备下周课程资料',
    status: '进行中'
  },
  {
    content: '批改学生作业',
    status: '进行中'
  },
  {
    content: '参加教研会议',
    status: '已完成'
  }
])
</script>

<style scoped>
.teacher-dashboard {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.dashboard-card {
  height: 200px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  color: #909399;
  font-size: 14px;
}
</style> 