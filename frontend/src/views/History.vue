<template>
  <div class="history-container">
    <h2>输出历史</h2>
    <div class="top-bar">
      <el-input v-model="filterKeyword" placeholder="搜索内容/工具" style="width:220px;" clearable />
    </div>
    <el-table :data="filteredList" border style="width:100%;margin-top:18px;">
      <el-table-column prop="content" label="内容摘要" min-width="260">
        <template #default="scope">
          <div class="content-cell">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="工具类型" width="110" />
      <el-table-column prop="time" label="生成时间" width="170">
        <template #default="scope">
          {{ formatTime(scope.row.time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleExport(scope.row)">导出</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

interface HistoryRecord {
  id: number
  content: string
  type: string
  time: string
}

const filterKeyword = ref('')
const historyList = ref<HistoryRecord[]>([])

const filteredList = computed(() => {
  let list = historyList.value
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r => r.content.toLowerCase().includes(kw) || r.type.toLowerCase().includes(kw))
  }
  return list
})

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchRecords = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/history/records')
    historyList.value = response.data
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  }
}

const handleExport = (row: HistoryRecord) => {
  ElMessage.success('导出成功（模拟）')
}

const handleDelete = async (row: HistoryRecord) => {
  try {
    await axios.delete(`http://localhost:8081/api/history/records/${row.id}`)
    historyList.value = historyList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.history-container {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.content-cell {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f5f7fa;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #333;
}

:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}
</style>
