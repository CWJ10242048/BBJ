<template>
  <div class="history-container">
    <h2>输出历史</h2>
    <div class="top-bar">
      <el-select v-model="filterType" placeholder="全部类型" style="width:140px;margin-right:20px;">
        <el-option label="全部类型" value="" />
        <el-option label="教案" value="教案" />
        <el-option label="教学大纲" value="教学大纲" />
        <el-option label="PPT" value="PPT" />
        <el-option label="习题" value="习题" />
        <el-option label="图文" value="图文" />
      </el-select>
      <el-input v-model="filterKeyword" placeholder="搜索内容/工具" style="width:220px;" clearable />
    </div>
    <el-table :data="filteredList" border size="small" style="width:100%;margin-top:18px;">
      <el-table-column prop="content" label="内容摘要" min-width="260">
        <template #default="scope">
          <div class="content-cell">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="工具类型" width="110" />
      <el-table-column prop="time" label="生成时间" width="170" />
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleExport(scope.row)">导出</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const filterType = ref('')
const filterKeyword = ref('')
const historyList = ref([ 
  { id: 1, content: '《计算机组成原理教案》已生成，包含教学目标、重难点分析、教学过程等。', type: '教案', time: '2025-05-10 15:32:10' },
  { id: 2, content: '《Python编程基础PPT》自动生成，含代码示例和练习题。', type: 'PPT', time: '2025-05-10 14:58:22' },
  { id: 3, content: '《数据结构与算法习题集》已生成，包含常见题型及解析。', type: '习题', time: '2025-05-10 14:30:01' },
  { id: 4, content: '《计算机网络原理教案》已生成，包含详细步骤和代码。', type: '教案', time: '2025-05-10 13:50:45' },
  { id: 5, content: '《人工智能基础教学大纲》已生成，含课程目标、章节安排等。', type: '教学大纲', time: '2025-05-10 13:20:10' },
  { id: 6, content: '《操作系统课程PPT》自动生成，含核心概念与应用案例。', type: 'PPT', time: '2025-05-10 12:55:33' },
  { id: 7, content: '《网络安全基础习题》已生成，含详细解答。', type: '习题', time: '2025-05-10 12:30:12' },
  { id: 8, content: '《Java程序设计教案》生成，包含项目流程与代码。', type: '教案', time: '2025-05-10 12:10:01' },
  { id: 9, content: '《数据库原理PPT》生成，含基本概念与设计模式。', type: 'PPT', time: '2025-05-10 11:45:22' },
  { id: 10, content: '《软件工程教程》已生成，汇总常用方法与技巧。', type: '图文', time: '2025-05-10 11:20:10' },
  { id: 11, content: '《云计算课程习题集》自动生成，含典型问题及解答。', type: '习题', time: '2025-05-10 10:55:33' },
  { id: 12, content: '《前端开发框架PPT》生成，含常用框架与实践案例。', type: 'PPT', time: '2025-05-10 10:30:12' },
  { id: 13, content: '《计算机图形学教案》生成，讲解核心原理与算法。', type: '教案', time: '2025-05-10 10:10:01' },
  { id: 14, content: '《信息安全基础图文》生成，包含数据加密与攻击防护方法。', type: '图文', time: '2025-05-10 09:45:22' },
  { id: 15, content: '《计算机视觉习题集》已生成，含详细解析。', type: '习题', time: '2025-05-10 09:20:10' },
  { id: 16, content: '《嵌入式系统基础教案》已生成，包含硬件接口与编程技巧。', type: '教案', time: '2025-01-15 09:20:00' },
  { id: 17, content: '《C++数据结构PPT》自动生成，包含链表、树与图的应用。', type: 'PPT', time: '2025-01-15 09:35:00' },
  { id: 18, content: '《软件架构设计习题集》已生成，包含常见问题及案例。', type: '习题', time: '2025-01-15 09:40:00' },
  { id: 19, content: '《人工智能导论教案》已生成，介绍AI的核心算法与技术。', type: '教案', time: '2025-01-15 10:00:00' },
  { id: 20, content: '《数据挖掘课程PPT》自动生成，讲解分类与聚类算法。', type: 'PPT', time: '2025-01-15 10:10:00' },
  { id: 21, content: '《网络协议分析习题集》已生成，包含常见协议分析题目。', type: '习题', time: '2025-01-15 10:25:00' },
  { id: 22, content: '《云计算架构教案》生成，包含虚拟化、容器与云服务。', type: '教案', time: '2025-01-15 10:50:00' },
  { id: 23, content: '《数据库优化PPT》生成，讲解SQL查询优化与索引。', type: 'PPT', time: '2025-01-15 11:00:00' },
  { id: 24, content: '《计算机安全技术习题集》已生成，含常见安全漏洞解析。', type: '习题', time: '2025-01-15 11:10:00' },
  { id: 25, content: '《编译原理教案》已生成，讲解编译过程与优化技术。', type: '教案', time: '2025-01-15 11:20:00' },
  { id: 26, content: '《前端框架与技术PPT》生成，介绍Vue.js与React框架。', type: 'PPT', time: '2025-01-15 11:30:00' },
  { id: 27, content: '《操作系统习题集》已生成，包含内存管理与进程调度题目。', type: '习题', time: '2025-01-15 11:45:00' },
  { id: 28, content: '《大数据分析教程》教案生成，介绍MapReduce与Hadoop技术。', type: '教案', time: '2025-01-15 12:00:00' },
  { id: 29, content: '《区块链技术PPT》生成，讲解智能合约与加密技术。', type: 'PPT', time: '2025-01-15 12:10:00' },
  { id: 30, content: '《深度学习基础习题集》已生成，含常见算法与应用。', type: '习题', time: '2025-01-15 12:20:00' }
]);


const filteredList = computed(() => {
  let list = historyList.value
  if (filterType.value) {
    list = list.filter(r => r.type === filterType.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r => r.content.toLowerCase().includes(kw) || r.type.toLowerCase().includes(kw))
  }
  return list
})

const handleExport = (row: any) => {
  ElMessage.success('导出成功（模拟）')
}
const handleDelete = (row: any) => {
  historyList.value = historyList.value.filter(r => r.id !== row.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.history-container {
  padding: 20px;
}
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.content-cell {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 15px;
  color: #333;
}
</style>
