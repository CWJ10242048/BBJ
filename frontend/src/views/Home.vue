<template>
  <div class="home-page">
    <div class="page-header">
      <div class="title-section">
        <div class="line-decoration"></div>
        <div class="title-container">
          <div class="title-main">备倍佳</div>
          <div class="title-sub">AI备课系统</div>
        </div>
        <div class="line-decoration"></div>
      </div>
    </div>

    <!-- 主要内容区 - 使用栅格布局 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧区域 - 常用功能和最近备课 -->
      <el-col :span="16">
        <div class="left-column">
          <!-- 常用功能模块 -->
          <el-card class="module-card function-card">
            <template #header>
              <div class="card-header">
                <div class="header-icon">
                  <el-icon><StarFilled /></el-icon>
                </div>
                <div class="header-title">常用功能</div>
              </div>
            </template>
            <div class="function-buttons-container">
              <el-button 
                class="function-button syllabus"
                @click="navigateTo('/teaching-design/syllabus')"
                type="primary"
                plain>
                <el-icon class="function-button-icon"><Document /></el-icon>
                <span>教学大纲</span>
              </el-button>
              
              <el-button 
                class="function-button plan"
                @click="navigateTo('/teaching-design/plan')"
                type="success"
                plain>
                <el-icon class="function-button-icon"><EditPen /></el-icon>
                <span>教案生成</span>
              </el-button>
              
              <el-button 
                class="function-button ppt"
                @click="navigateTo('/resource-gen/ppt')"
                type="warning"
                plain>
                <el-icon class="function-button-icon"><PictureFilled /></el-icon>
                <span>PPT生成</span>
              </el-button>
              
              <el-button 
                class="function-button question"
                @click="navigateTo('/resource-gen/question')"
                type="danger"
                plain>
                <el-icon class="function-button-icon"><QuestionFilled /></el-icon>
                <span>智能出题</span>
              </el-button>
              
              <el-button 
                class="function-button analysis"
                @click="navigateTo('/analysis/student-board')"
                color="#9254DE"
                plain>
                <el-icon class="function-button-icon"><Histogram /></el-icon>
                <span>学情分析</span>
              </el-button>
              
              <el-button 
                class="function-button personalized"
                @click="navigateTo('/personalized')"
                color="#1FBCDF"
                plain>
                <el-icon class="function-button-icon"><MagicStick /></el-icon>
                <span>一键备课</span>
              </el-button>
            </div>
          </el-card>

          <!-- 输出历史（上次备课）模块 -->
          <el-card class="module-card history-card">
            <template #header>
              <div class="card-header">
                <div class="header-icon">
                  <el-icon><Notebook /></el-icon>
                </div>
                <div class="header-title">上次备课</div>
                <div class="header-actions">
                  <el-button size="small" type="primary" plain @click="navigateTo('/history')">查看更多</el-button>
                </div>
              </div>
            </template>
            <div class="history-list">
              <el-empty v-if="!historyRecords.length" description="暂无备课历史记录"></el-empty>
              <div v-for="(item, index) in historyRecords" :key="index" class="history-item">
                <div class="history-icon" :class="item.type">
                  <el-icon><component :is="getIconComponent(item.iconType)" /></el-icon>
                </div>
                <div class="history-content">
                  <div class="history-title">{{ item.title }}</div>
                  <div class="history-desc">{{ item.description }}</div>
                  <div class="history-time">{{ item.time }}</div>
                </div>
                <div class="history-actions">
                  <el-button type="primary" size="small" @click="viewHistoryDetail(item)">查看</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧区域 - 学情分析和通知公告 -->
      <el-col :span="8">
        <div class="right-column">
          <!-- 概要看板（学情分析内容）模块 -->
          <el-card class="module-card dashboard-card">
            <template #header>
              <div class="card-header">
                <div class="header-icon">
                  <el-icon><DataLine /></el-icon>
                </div>
                <div class="header-title">学情概要</div>
                <div class="header-actions">
                  <el-button size="small" type="primary" plain @click="navigateTo('/analysis/student-board')">详细分析</el-button>
                </div>
              </div>
            </template>
            <div class="dashboard-content">
              <div class="dashboard-inner">
                <!-- 学情进度 -->
                <div class="progress-section">
                  <div class="progress-title">
                    <span>课程进度</span>
                    <span class="progress-value">75%</span>
                  </div>
                  <el-progress :percentage="75" :stroke-width="10" :show-text="false" color="#4a8ccf"></el-progress>
                </div>

                <!-- 知识点掌握概况 -->
                <div class="knowledge-section">
                  <div class="section-title">知识点掌握概况</div>
                  <div class="knowledge-chart">
                    <div class="chart-legend">
                      <div class="legend-item">
                        <div class="legend-color" style="background-color: #67C23A;"></div>
                        <div class="legend-text">已掌握</div>
                        <div class="legend-value">68%</div>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color" style="background-color: #E6A23C;"></div>
                        <div class="legend-text">待巩固</div>
                        <div class="legend-value">22%</div>
                      </div>
                      <div class="legend-item">
                        <div class="legend-color" style="background-color: #F56C6C;"></div>
                        <div class="legend-text">未掌握</div>
                        <div class="legend-value">10%</div>
                      </div>
                    </div>
                    <div class="knowledge-bars">
                      <div class="knowledge-bar">
                        <div class="bar-segment mastered" style="width: 68%;"></div>
                        <div class="bar-segment reviewing" style="width: 22%;"></div>
                        <div class="bar-segment unmastered" style="width: 10%;"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 班级状态 -->
                <div class="class-status">
                  <div class="section-title">班级学习状态</div>
                  <div class="status-grid">
                    <div class="status-item">
                      <div class="status-value">36</div>
                      <div class="status-label">总人数</div>
                    </div>
                    <div class="status-item">
                      <div class="status-value">32</div>
                      <div class="status-label">活跃人数</div>
                    </div>
                    <div class="status-item">
                      <div class="status-value">87%</div>
                      <div class="status-label">出勤率</div>
                    </div>
                    <div class="status-item">
                      <div class="status-value">92%</div>
                      <div class="status-label">作业提交率</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 通知公告模块 -->
          <el-card class="module-card notice-card">
            <template #header>
              <div class="card-header">
                <div class="header-icon">
                  <el-icon><Bell /></el-icon>
                </div>
                <div class="header-title">通知公告</div>
              </div>
            </template>
            <div class="notice-list">
              <div v-for="(notice, index) in notices" :key="index" class="notice-item">
                <div class="notice-dot" :class="{ 'unread': !notice.read }"></div>
                <div class="notice-content">
                  <div class="notice-title">{{ notice.title }}</div>
                  <div class="notice-time">{{ notice.time }}</div>
                </div>
              </div>
              <div class="notice-more" v-if="notices.length">
                <el-button link type="primary">查看全部</el-button>
              </div>
              <el-empty v-else description="暂无通知公告"></el-empty>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- AI助手弹窗 -->
    <div class="ai-assistant-floating" :class="{ 'ai-assistant-expanded': aiExpanded }">
      <div class="ai-assistant-toggle" @click="toggleAiAssistant">
        <el-icon><ChatLineRound /></el-icon>
        <span v-if="!aiExpanded">AI助手</span>
        <span v-else class="close-icon"><el-icon><Close /></el-icon></span>
      </div>
      <div class="ai-assistant-panel" v-show="aiExpanded">
        <div class="ai-panel-header">
          <div class="ai-panel-title">教育AI助手</div>
          <el-button size="small" type="primary" plain>新建会话</el-button>
        </div>
        <div class="ai-panel-content">
          <div class="message ai-message">
            <p>你好！我是教学设计AI助手。你可以问我任何有关教学设计的问题，我将尽力提供帮助。例如：</p>
            <ul>
              <li>请帮我设计一节语文课的教学大纲</li>
              <li>如何制作互动性强的教学课件？</li>
              <li>二年级学生的认知特点是什么？</li>
            </ul>
          </div>
        </div>
        <div class="ai-panel-input">
          <el-input 
            v-model="prompt" 
            type="textarea" 
            rows="2" 
            placeholder="想问什么？在这里输入您的问题..."
            resize="none"
          ></el-input>
          <div class="ai-panel-actions">
            <el-button type="primary" :disabled="!prompt">发送</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ChatLineRound, 
  StarFilled, 
  Document, 
  EditPen, 
  PictureFilled, 
  QuestionFilled, 
  Histogram, 
  MagicStick,
  Notebook,
  DataLine,
  Bell,
  ChatDotRound,
  Close
} from '@element-plus/icons-vue'

const router = useRouter()
const prompt = ref('')
const aiExpanded = ref(false)

// AI助手展开/折叠控制
const toggleAiAssistant = () => {
  aiExpanded.value = !aiExpanded.value
}

// 图标名称到组件的映射
const getIconComponent = (iconType) => {
  const iconMap = {
    'document': Document,
    'picture': PictureFilled,
    'chat': ChatDotRound
  }
  return iconMap[iconType] || Document
}

// 导航方法
const navigateTo = (path) => {
  router.push(path)
}

// 查看历史记录详情
const viewHistoryDetail = (item) => {
  // 实际应用中可能需要跳转到详情页或打开详情弹窗
  console.log('查看历史记录详情:', item)
}

// 模拟历史记录数据
const historyRecords = ref([
  {
    id: 1,
    title: '《计算机组成原理教案》',
    description: '已生成，包含教学目标、重难点分析、教学过程等',
    type: 'syllabus',
    iconType: 'document',
    time: '2025-05-10 15:32:10'
  },
  {
    id: 2,
    title: '《Python编程基础PPT》',
    description: '自动生成，含代码示例和练习题',
    type: 'ppt',
    iconType: 'picture',
    time: '2025-05-10 14:58:22'
  },
  {
    id: 3,
    title: '《数据结构与算法习题集》',
    description: '已生成，包含常见题型及解析',
    type: 'interaction',
    iconType: 'chat',
    time: '2025-05-10 14:30:01'
  }
])

// 模拟通知公告数据
const notices = ref([
  {
    id: 1,
    title: '系统更新：新增学情分析功能',
    time: '2023-11-15',
    read: false
  },
  {
    id: 2,
    title: '教育部关于加强中小学课堂教学改革的通知',
    time: '2023-11-10',
    read: false
  },
  {
    id: 3,
    title: '本周教研活动安排',
    time: '2023-11-08',
    read: true
  },
  {
    id: 4,
    title: '智能备课系统使用指南已发布',
    time: '2023-11-05',
    read: true
  }
])
</script>

<style scoped>
.home-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  position: relative;
  overflow: hidden; /* 防止内容溢出导致滚动条 */
}

.page-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden; /* 防止header部分产生滚动条 */
}

.title-section {
  display: flex;
  align-items: center;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-main {
  font-size: 28px;
  font-weight: bold;
  color: #4a8ccf;
  line-height: 1.2;
}

.title-sub {
  font-size: 18px;
  font-weight: bold;
  color: #4a8ccf;
  line-height: 1.2;
}

.line-decoration {
  height: 2px;
  width: 50px;
  background: #4a8ccf;
  margin: 0 15px;
}

/* 修改容器布局，确保四个模块完全对齐 */
.content-row {
  height: calc(100vh - 140px);
  display: flex;
  overflow: hidden;
}

.content-row > .el-col {
  height: 100%;
  overflow: hidden;
}

.left-column, .right-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
  overflow: hidden;
}

/* 确保左右两列顶部和底部的卡片高度相等 */
.function-card, .dashboard-card {
  flex: 1;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.history-card, .notice-card {
  flex: 1;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

/* 将所有滚动条完全隐藏 */
.dashboard-content,
.history-list,
.notice-list,
.ai-panel-content {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  overflow-y: auto;
}

/* 完全隐藏Webkit浏览器的滚动条 */
.dashboard-content::-webkit-scrollbar,
.history-list::-webkit-scrollbar,
.notice-list::-webkit-scrollbar,
.ai-panel-content::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
  width: 0;
  background: transparent;
}

/* 模块卡片样式 */
.module-card {
  margin-bottom: 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.module-card :deep(.el-card__header) {
  padding: 0 20px;
  border-bottom: 1px solid #eef2f7;
}

.function-card {
  overflow: visible;
  background-color: #fff;
  border: none;
}

.function-card :deep(.el-card__body) {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
  overflow: visible;
  background-color: #fff;
}

.function-buttons-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
  width: 100%;
}

.function-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  transition: all 0.25s ease;
  padding: 20px 0;
  margin: 0;
}

.function-button-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.function-button span {
  font-size: 14px;
  font-weight: 500;
  margin-top: 6px;
}

.function-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

/* 上次备课历史模块样式 */
.history-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 15px;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.history-icon.syllabus { background-color: #409EFF; }
.history-icon.ppt { background-color: #E6A23C; }
.history-icon.interaction { background-color: #67C23A; }

.history-content {
  flex-grow: 1;
}

.history-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 3px;
}

.history-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 3px;
}

.history-time {
  font-size: 12px;
  color: #c0c4cc;
}

.history-actions {
  margin-left: 10px;
}

/* 学情概要模块样式 */
.progress-section {
  margin-bottom: 15px;
}

.progress-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-value {
  color: #4a8ccf;
}

.section-title {
  font-weight: 500;
  margin-bottom: 15px;
}

.knowledge-chart {
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
}

.legend-text {
  font-size: 12px;
  color: #606266;
  margin-right: 6px;
}

.legend-value {
  font-size: 12px;
  font-weight: 500;
}

.knowledge-bars {
  margin-top: 10px;
}

.knowledge-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
}

.bar-segment {
  height: 100%;
}

.bar-segment.mastered { background-color: #67C23A; }
.bar-segment.reviewing { background-color: #E6A23C; }
.bar-segment.unmastered { background-color: #F56C6C; }

.class-status {
  margin-top: 20px;
  flex-grow: 1;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.status-item {
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #4a8ccf;
  margin-bottom: 5px;
}

.status-label {
  font-size: 12px;
  color: #909399;
}

/* 通知公告模块样式 */
.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 12px;
  margin-top: 6px;
  flex-shrink: 0;
}

.notice-dot.unread {
  background-color: #f56c6c;
}

.notice-content {
  flex-grow: 1;
  overflow: hidden;
}

.notice-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

.notice-more {
  text-align: center;
  margin-top: auto; /* 将"查看更多"按钮推到底部 */
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
}

/* AI助手弹窗样式 */
.ai-assistant-floating {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-assistant-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  background-color: #4a8ccf;
  color: white;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.ai-assistant-toggle:hover {
  background-color: #3a78b5;
}

.ai-assistant-toggle .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

.ai-assistant-toggle .close-icon {
  margin-left: 8px;
}

.ai-assistant-panel {
  width: 350px;
  height: 450px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-panel-header {
  padding: 15px;
  background-color: #f5f9ff;
  border-bottom: 1px solid #e6f0ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-panel-title {
  font-weight: bold;
  color: #4a8ccf;
}

.ai-panel-content {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
}

.ai-panel-input {
  padding: 12px 15px;
  background-color: #f9fbfd;
  border-top: 1px solid #eee;
}

.ai-panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.message {
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 8px;
}

.ai-message {
  background-color: #f5f9ff;
  color: #333;
}

.ai-message p {
  margin-top: 0;
  margin-bottom: 10px;
}

.ai-message ul {
  padding-left: 20px;
  margin: 0;
}

.ai-message li {
  margin-bottom: 5px;
}

.ai-panel-actions .el-button--primary {
  background-color: #4a8ccf;
  border-color: #4a8ccf;
}

.ai-panel-actions .el-button--primary:hover,
.ai-panel-actions .el-button--primary:focus {
  background-color: #6ba4e2;
  border-color: #6ba4e2;
}

/* 卡片内容区域样式 */
.dashboard-content {
  flex: 1;
  height: 100%;
  overflow-y: auto;
}

.dashboard-inner {
  padding-right: 0;
  height: 100%;
}

/* 调整历史列表和通知列表的样式 */
.history-list, .notice-list {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
}

/* 为空列表添加垂直居中样式 */
.history-list .el-empty,
.notice-list .el-empty {
  margin: auto 0;
}

/* 确保所有卡片头部高度一致 */
.card-header {
  display: flex;
  align-items: center;
  height: 56px;
  min-height: 56px;
}

/* 确保卡片内部内容区域高度一致 */
.module-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px;
}

.dashboard-card :deep(.el-card__body), 
.history-card :deep(.el-card__body), 
.notice-card :deep(.el-card__body) {
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px); /* 减去卡片头部高度 */
  overflow: hidden;
}

.header-icon {
  color: #4a8ccf;
  font-size: 18px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-weight: 600;
  flex-grow: 1;
  font-size: 16px;
  color: #2c3e50;
}

.header-actions {
  margin-left: auto;
}
</style>