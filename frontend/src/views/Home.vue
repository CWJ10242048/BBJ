<template>
  <div class="home-page">
    <!-- 主要内容区 - 使用栅格布局 -->
    <el-row :gutter="20" class="content-row">
      <!-- 左侧区域 - 学情概要和通知公告 -->
      <el-col :span="16">
        <div class="left-column">
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
              <el-empty v-if="!notices.length" description="暂无通知公告"></el-empty>
              <div v-for="(item, index) in notices" :key="index" class="notice-item">
                <div class="notice-content">
                  <div class="notice-title">{{ item.title }}</div>
                  <div class="notice-time">{{ item.time }}</div>
                </div>
                <div class="notice-status" :class="{ 'unread': !item.read }"></div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧区域 - 常用功能和最近备课 -->
      <el-col :span="8">
        <div class="right-column">
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
    </el-row>

    <!-- 备课详情对话框 -->
    <el-dialog
      v-model="historyDetailDialogVisible"
      :title="selectedHistoryPlan?.title || '备课详情'"
      width="70%"
      top="5vh"
      append-to-body
      class="history-detail-dialog"
      :close-on-click-modal="false"
    >
      <div v-if="selectedHistoryPlan" class="plan-content">
        <div class="plan-header">
          <h2>{{ selectedHistoryPlan.title }}</h2>
          <p class="plan-meta">生成时间：{{ selectedHistoryPlan.time }}</p>
        </div>

        <el-scrollbar height="70vh">
          <div class="plan-section">
            <h3><el-icon><Aim /></el-icon> 教学目标</h3>
            <div class="section-content">
              <p v-for="(objective, index) in selectedHistoryPlan.objectives" :key="'obj-'+index">
                {{ index + 1 }}. {{ objective }}
              </p>
            </div>
          </div>

          <div class="plan-section">
            <h3><el-icon><DataAnalysis /></el-icon> 学情分析</h3>
            <div class="section-content" v-html="selectedHistoryPlan.analysis"></div>
          </div>

          <div class="plan-section">
            <h3><el-icon><Key /></el-icon> 教学重难点</h3>
            <div class="section-content">
              <h4>重点：</h4>
              <div class="tags-container">
                <el-tag
                  v-for="(point, index) in selectedHistoryPlan.keyPoints"
                  :key="'key-' + index"
                  type="primary"
                  effect="light"
                  size="large"
                  class="point-tag"
                >
                  {{ point }}
                </el-tag>
                <el-empty v-if="!selectedHistoryPlan.keyPoints || selectedHistoryPlan.keyPoints.length === 0" description="暂无重点内容" :image-size="50"></el-empty>
              </div>

              <h4 style="margin-top: 15px;">难点：</h4>
              <div class="tags-container">
                <el-tag
                  v-for="(point, index) in selectedHistoryPlan.difficultPoints"
                  :key="'diff-' + index"
                  type="danger"
                  effect="light"
                  size="large"
                  class="point-tag"
                >
                  {{ point }}
                </el-tag>
                <el-empty v-if="!selectedHistoryPlan.difficultPoints || selectedHistoryPlan.difficultPoints.length === 0" description="暂无难点内容" :image-size="50"></el-empty>
              </div>
            </div>
          </div>

          <div class="plan-section">
            <h3><el-icon><Promotion /></el-icon> 教学过程</h3>
            <div class="section-content">
              <el-timeline>
                <el-timeline-item
                  v-for="(stage, index) in selectedHistoryPlan.process"
                  :key="'proc-'+index"
                  :timestamp="stage.name"
                  placement="top"
                >
                  <div v-html="stage.content"></div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>

          <div class="plan-section">
            <h3><el-icon><Finished /></el-icon> 教学评价</h3>
            <div class="section-content" v-html="selectedHistoryPlan.evaluation"></div>
          </div>

          <div class="plan-section">
            <h3><el-icon><Reading /></el-icon> 课后作业</h3>
            <div class="section-content">
              <ul>
                <li v-for="(homework, index) in selectedHistoryPlan.homework" :key="'hw-'+index">
                  {{ homework }}
                </li>
              </ul>
            </div>
          </div>

          <div class="plan-section">
            <h3><el-icon><Edit /></el-icon> 教学反思</h3>
            <div class="section-content" v-html="selectedHistoryPlan.reflection"></div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="historyDetailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadPlan(selectedHistoryPlan)" :icon="Download">下载</el-button>
        </span>
      </template>
    </el-dialog>

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
  Close,
  Aim, 
  DataAnalysis, 
  Key, 
  Promotion, 
  Finished, 
  Reading, 
  Edit,
  Download 
} from '@element-plus/icons-vue'

const router = useRouter()
const prompt = ref('')
const aiExpanded = ref(false)
const historyDetailDialogVisible = ref(false)
const selectedHistoryPlan = ref(null)

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
  // 实际应用中可能需要根据 item.id 从后端获取完整数据
  // 这里我们模拟生成一个 TeachingPlan 结构的数据
  console.log('查看历史记录详情:', item)

  // 模拟生成详细数据
  const simulatedPlan = {
    id: item.id,
    title: item.title,
    time: item.time,
    objectives: [
      `理解 ${item.title} 的核心概念。`,
      `掌握 ${item.type === 'syllabus' ? '大纲设计' : (item.type === 'ppt' ? 'PPT制作' : '习题设计')} 的基本方法。`,
      '培养分析和解决相关问题的能力。'
    ],
    analysis: `<p>根据历史数据分析，学生在此部分内容上表现良好，但建议关注 ${item.title.substring(1, 5)} 部分的实践应用。</p>`,
    keyPoints: ['核心概念理解', '基本原理掌握', item.type === 'ppt' ? '图文排版' : '逻辑结构'],
    difficultPoints: ['深入应用', item.type === 'syllabus' ? '创新性设计' : '细节处理'],
    process: [
      { name: '阶段一：导入与目标设定', content: '<p>回顾相关知识，明确本节课或本次设计的学习目标。</p>' },
      { name: '阶段二：核心内容讲解/设计', content: `<p>详细讲解 ${item.title} 的核心内容，或进行 ${item.type} 的主要设计步骤。</p>` },
      { name: '阶段三：实践与反馈', content: '<p>安排相关的练习、讨论或实际操作，并提供反馈。</p>' },
      { name: '阶段四：总结与拓展', content: '<p>总结本次内容，布置相关作业或拓展思考。</p>' },
    ],
    evaluation: '<p>通过课堂表现、作业完成情况和最终成果来综合评估。</p>',
    homework: [
      `复习 ${item.title} 相关内容。`,
      '完成配套练习题。'
    ],
    reflection: `<p>本次 ${item.type} 生成效果良好，建议在后续使用中进一步优化 ${item.title.includes('基础') ? '基础概念' : '高级特性'} 部分的呈现方式。</p>`
  }

  selectedHistoryPlan.value = simulatedPlan
  historyDetailDialogVisible.value = true
}

// 添加一个假的下载函数以消除模板错误
const downloadPlan = (plan) => {
  if (plan) {
    alert(`正在下载：${plan.title}`)
    // 实际下载逻辑会更复杂，这里仅作演示
  } else {
    alert('没有可下载的计划')
  }
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
    time: '2025-04-15',
    read: false
  },
  {
    id: 2,
    title: '教育部关于加强中小学课堂教学改革的通知',
    time: '2025-04-10',
    read: false
  },
  {
    id: 3,
    title: '本周教研活动安排',
    time: '2025-04-08',
    read: true
  },
  {
    id: 4,
    title: '智能备课系统使用指南已发布',
    time: '2025-04-05',
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

/* 修改容器布局，确保四个模块完全对齐 */
.content-row {
  height: calc(100vh - 60px); /* 增加内容区域高度 */
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
  border-radius: 12px;
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
  border-radius: 12px;
}

.function-card :deep(.el-card__body) {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 56px);
  overflow: visible;
  background-color: #fff;
  border-radius: 0 0 12px 12px;
}

.function-buttons-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.function-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  transition: all 0.25s ease;
  padding: 12px 8px;
  margin: 0;
  white-space: nowrap;
}

.function-button-icon {
  font-size: 20px;
  margin-right: 8px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.function-button span {
  font-size: 13px;
  font-weight: 500;
  margin-top: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border-radius: 0 0 12px 12px;
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

/* 历史详情对话框样式 (部分参考 Personalized.vue) */
.history-detail-dialog :deep(.el-dialog__body) {
  padding: 0 20px 20px 20px; /* 调整内边距 */
}

.plan-content {
  /* padding: 20px; */ /* 内边距移到dialog body */
}
.plan-header {
  text-align: center;
  margin-bottom: 24px;
  padding-top: 10px; /* 给顶部一些空间 */
}
.plan-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}
.plan-meta {
  color: #909399;
  font-size: 14px;
}
.plan-section {
  margin-bottom: 24px;
}
.plan-section h3 {
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5; /* 添加分隔线 */
  display: flex; /* 让图标和文字对齐 */
  align-items: center;
  gap: 8px; /* 图标和文字间距 */
  font-size: 18px;
}
.section-content {
  color: #606266;
  line-height: 1.7; /* 调整行高 */
  font-size: 14px; /* 调整字号 */
}
.section-content ul {
  margin: 8px 0;
  padding-left: 25px; /* 调整列表缩进 */
}
.section-content li {
  margin: 6px 0; /* 调整列表项间距 */
}

.plan-section h4 { 
  margin: 12px 0 10px 0; 
  font-weight: 600;
  color: #409EFF; 
  font-size: 15px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; 
  margin-bottom: 10px; 
}

.point-tag {
  padding: 0 12px; 
  height: 32px; 
  line-height: 30px; 
}

.tags-container .el-empty {
  padding: 10px 0; 
}

/* 时间线样式微调 */
.section-content .el-timeline {
  padding-left: 10px;
}
.section-content .el-timeline-item__timestamp {
  font-weight: bold;
  color: #303133;
}

/* 移除滚动条默认内边距 */
.history-detail-dialog :deep(.el-scrollbar__view) {
  padding-right: 15px; /* 给滚动条留出空间 */
}
</style>