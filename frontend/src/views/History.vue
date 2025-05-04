<template>
  <div class="history-container">
    <h2>输出历史</h2>
    <div class="top-bar">
      <el-input v-model="filterKeyword" placeholder="搜索内容/工具" style="width:220px;" clearable />
      <el-button type="primary" @click="fetchRecords" :loading="loading">刷新</el-button>
      <div v-if="apiBaseUrl" class="api-info">
        <el-tag size="small">API: {{ apiBaseUrl }}</el-tag>
      </div>
    </div>
    <el-table
      :data="filteredList"
      border
      style="width:100%;margin-top:18px;"
      v-loading="loading"
      element-loading-text="加载中..."
    >
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
    
    <div v-if="filteredList.length === 0 && !loading" class="empty-state">
      <el-empty description="暂无历史记录"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { historyApi, getMockHistoryData, apiBaseUrl, type HistoryRecord } from '@/api/history'

const filterKeyword = ref('')
const historyList = ref<HistoryRecord[]>([])
const loading = ref(false)

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
  loading.value = true
  try {
    const response = await historyApi.getRecords()
    if (response && response.data) {
      historyList.value = response.data
      console.log('成功获取历史记录:', response.data)
    } else {
      throw new Error('返回数据格式不正确')
    }
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败，使用模拟数据')
    // 使用模拟数据作为后备
    historyList.value = getMockHistoryData()
  } finally {
    loading.value = false
  }
}

const handleExport = async (row: HistoryRecord) => {
  try {
    await historyApi.exportRecord(row.id)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

const handleDelete = async (row: HistoryRecord) => {
  try {
    await historyApi.deleteRecord(row.id)
    historyList.value = historyList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  console.log('使用API基础路径:', apiBaseUrl) // 调试用
  
  // 检查API连接状态
  checkApiConnection()
  
  // 获取历史记录
  fetchRecords()
})

// 检测API连接状态
const checkApiConnection = async () => {
  try {
    // 发送一个简单的请求检查连接
    await fetch(apiBaseUrl.replace(/\/api$/, '') + '/api/health', { 
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    console.log('API连接正常')
  } catch (error) {
    console.error('API连接测试失败:', error)
    ElMessage.warning({
      message: '后端连接异常，可能导致数据加载失败',
      duration: 5000
    })
  }
}
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
  gap: 10px;
}

.api-info {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.content-cell {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.empty-state {
  margin-top: 30px;
  padding: 20px;
  text-align: center;
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

:deep(.el-empty) {
  padding: 40px 0;
}
</style>
