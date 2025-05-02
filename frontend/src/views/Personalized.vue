<template>
  <div class="personalized-bg">
    <h1 class="main-title">一键个性化备课</h1>

    <!-- 教材选择卡片 -->
    <el-card class="custom-card">
      <template #header>
        <div class="card-header">
          <span>教材选择</span>
        </div>
      </template>
      <el-radio-group v-model="bookSelectionMethod" size="small" class="source-selector">
        <el-radio-button label="isbn">ISBN码</el-radio-button>
        <el-radio-button label="pdf">PDF导入</el-radio-button>
      </el-radio-group>
      <div v-if="bookSelectionMethod === 'isbn'" class="isbn-input">
        <el-input
          v-model="isbnCode"
          placeholder="请输入教材ISBN码"
          class="isbn-input-field"
        >
          <template #append>
            <el-button @click="searchBookByISBN" :loading="isSearching">
              <el-icon><Search /></el-icon>
              {{ isSearching ? '检索中...' : '搜索' }}
            </el-button>
          </template>
        </el-input>
        <div v-if="isSearching" class="searching-animation">
          <div class="searching-content">
            <el-icon class="searching-icon"><Loading /></el-icon>
            <div class="searching-text">
              <span class="searching-title">正在检索书籍信息</span>
              <span class="searching-dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          </div>
        </div>
        <div v-if="bookInfo" class="book-info">
          <el-image
            v-if="bookInfo.cover"
            :src="bookInfo.cover"
            class="book-cover"
            fit="contain"
          />
          <div class="book-details">
            <h4>{{ bookInfo.title }}</h4>
            <p>作者：{{ bookInfo.author }}</p>
            <p>出版社：{{ bookInfo.publisher }}</p>
            <p>出版年份：{{ bookInfo.publishYear }}</p>
          </div>
        </div>
        <div v-if="selectedBook" class="selected-book">
          <el-tag type="success" effect="dark" class="selected-book-tag">
            <el-icon><Check /></el-icon>
            已选择教材：{{ selectedBook }}
          </el-tag>
        </div>
      </div>
      <div v-else class="pdf-upload">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          accept=".pdf"
          :on-change="handleBookFileChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽PDF文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持PDF格式，大小不超过20MB
            </div>
          </template>
        </el-upload>
        <div v-if="uploadedBook" class="uploaded-book-info">
          <el-icon><Document /></el-icon>
          <span class="book-name">{{ uploadedBook.name }}</span>
          <el-button type="danger" link @click="removeBookFile">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 备课配置卡片 -->
    <el-card class="custom-card">
      <template #header>
        <div class="card-header">
          <span>备课配置信息</span>
        </div>
      </template>
      <el-form :model="formData" label-width="120px" class="info-form">
        <el-form-item label="课程名称">
          <el-input v-model="formData.courseName" placeholder="请输入课程名称（可选）"></el-input>
        </el-form-item>
        <el-form-item label="教学班级">
          <el-select v-model="formData.targetClass" placeholder="请选择教学班级">
            <el-option label="计算机科学与技术2101" value="cs2101"></el-option>
            <el-option label="计算机科学与技术2102" value="cs2102"></el-option>
            <el-option label="软件工程2101" value="se2101"></el-option>
            <el-option label="软件工程2102" value="se2102"></el-option>
            <el-option label="人工智能2101" value="ai2101"></el-option>
            <el-option label="人工智能2102" value="ai2102"></el-option>
            <el-option label="数据科学与大数据技术2101" value="ds2101"></el-option>
            <el-option label="数据科学与大数据技术2102" value="ds2102"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教学章节">
          <el-input v-model="formData.chapter" placeholder="请输入教学章节"></el-input>
        </el-form-item>
        <el-form-item label="教学目标">
          <el-input v-model="formData.objectives" type="textarea" :rows="3" placeholder="请输入本节课的教学目标"></el-input>
        </el-form-item>
        <el-form-item label="学情分析">
          <el-radio-group v-model="formData.analysisType">
            <el-radio :label="1">使用系统分析</el-radio>
            <el-radio :label="2">自定义学情</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.analysisType === 2" label="自定义学情分析">
          <el-input v-model="formData.customAnalysis" type="textarea" :rows="5" placeholder="请输入学生学情分析，包括知识掌握情况、学习能力等"></el-input>
        </el-form-item>
        <el-form-item label="个性化策略">
          <el-checkbox-group v-model="formData.strategies">
            <el-checkbox label="分层教学">分层教学</el-checkbox>
            <el-checkbox label="小组合作">小组合作</el-checkbox>
            <el-checkbox label="项目教学">项目教学</el-checkbox>
            <el-checkbox label="探究式学习">探究式学习</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="课时数">
          <el-input-number v-model="formData.lessonCount" :min="1" :max="10"></el-input-number>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 历史方案卡片 -->
    <el-card class="custom-card">
      <template #header>
        <div class="card-header">
          <span>历史方案</span>
          <el-button type="primary" size="small" @click="loadHistoryPlans">刷新</el-button>
        </div>
      </template>
      <div v-if="historyPlans.length === 0" class="empty-history">
        <el-empty description="暂无历史方案"></el-empty>
      </div>
      <el-timeline v-else>
        <el-timeline-item
          v-for="(plan, index) in historyPlans"
          :key="index"
          :timestamp="plan.createTime"
          placement="top"
        >
          <el-card>
            <h4>{{ plan.courseName }}</h4>
            <p class="small-text">{{ plan.chapter }}</p>
            <div class="history-actions">
              <el-button type="primary" link @click="viewPlan(plan)">查看</el-button>
              <el-button type="danger" link @click="deletePlan(plan)">删除</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 生成结果卡片 -->
    <el-card class="custom-card">
      <template #header>
        <div class="card-header">
          <span>个性化教学方案</span>
        </div>
      </template>
      <div v-if="generating" class="generating-container">
        <el-skeleton :rows="10" animated />
        <div class="generating-tip">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在生成个性化教学方案，请稍候...</span>
        </div>
      </div>
      <div v-else-if="!currentPlan" class="empty-result">
        <el-empty description="请配置备课信息并点击一键生成">
          <el-button type="primary" @click="generatePlan">立即生成</el-button>
        </el-empty>
      </div>
      <div v-else class="plan-content">
        <div class="plan-header">
          <h2>{{ currentPlan.courseName }} - {{ currentPlan.chapter }}</h2>
          <p class="plan-meta">生成时间：{{ currentPlan.createTime }}</p>
        </div>
        <div class="plan-section">
          <h3>教学目标</h3>
          <div class="section-content">
            <p v-for="(objective, index) in currentPlan.objectives" :key="index">
              {{ index + 1 }}. {{ objective }}
            </p>
          </div>
        </div>
        <div class="plan-section">
          <h3>学情分析</h3>
          <div class="section-content" v-html="currentPlan.analysis"></div>
        </div>
        <div class="plan-section">
          <h3>教学重难点</h3>
          <div class="section-content">
            <h4>重点：</h4>
            <ul>
              <li v-for="(point, index) in currentPlan.keyPoints" :key="'key-'+index">
                {{ point }}
              </li>
            </ul>
            <h4>难点：</h4>
            <ul>
              <li v-for="(point, index) in currentPlan.difficultPoints" :key="'diff-'+index">
                {{ point }}
              </li>
            </ul>
          </div>
        </div>
        <div class="plan-section">
          <h3>教学过程</h3>
          <div class="section-content">
            <el-collapse v-model="activeProcessStages">
              <el-collapse-item 
                v-for="(stage, index) in currentPlan.process" 
                :key="index"
                :title="stage.name" 
                :name="index"
              >
                <div v-html="stage.content"></div>
                <template v-if="stage.groupActivities && stage.groupActivities.length > 0">
                  <h4>分组活动：</h4>
                  <div v-for="(activity, actIndex) in stage.groupActivities" :key="'act-'+actIndex">
                    <p><strong>{{ activity.name }}</strong></p>
                    <p>{{ activity.description }}</p>
                  </div>
                </template>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
        <div class="plan-section">
          <h3>教学评价</h3>
          <div class="section-content" v-html="currentPlan.evaluation"></div>
        </div>
        <div class="plan-section">
          <h3>课后作业</h3>
          <div class="section-content">
            <ul>
              <li v-for="(homework, index) in currentPlan.homework" :key="index">
                {{ homework }}
              </li>
            </ul>
          </div>
        </div>
        <div class="plan-section">
          <h3>教学反思</h3>
          <div class="section-content" v-html="currentPlan.reflection"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MagicStick, 
  Download, 
  Star, 
  RefreshRight, 
  Loading, 
  Search, 
  Check, 
  Document, 
  Delete, 
  UploadFilled,
  Share
} from '@element-plus/icons-vue'

// 定义类型
interface HistoryPlan {
  id: number
  courseName: string
  chapter: string
  createTime: string
}

interface GroupActivity {
  name: string
  description: string
}

interface ProcessStage {
  name: string
  content: string
  groupActivities?: GroupActivity[]
}

interface TeachingPlan {
  id: number
  courseName: string
  chapter: string
  createTime: string
  objectives: string[]
  analysis: string
  keyPoints: string[]
  difficultPoints: string[]
  process: ProcessStage[]
  evaluation: string
  homework: string[]
  reflection: string
}

interface BookInfo {
  title: string
  author: string
  publisher: string
  publishYear: string
  cover?: string
}

// 表单数据
const formData = reactive({
  courseName: '',
  targetClass: '',
  chapter: '',
  objectives: '',
  analysisType: 1, // 1-系统分析 2-自定义
  customAnalysis: '',
  strategies: [] as string[],
  lessonCount: 1
})

// 状态变量
const generating = ref(false)
const currentPlan = ref<TeachingPlan | null>(null)
const historyPlans = ref<HistoryPlan[]>([])
const activeProcessStages = ref([0]) // 默认展开第一个教学环节
const isBasicInfoAIGenerated = ref(false)

// 教材选择相关
const bookSelectionMethod = ref('isbn')
const isbnCode = ref('')
const isSearching = ref(false)
const bookInfo = ref<BookInfo | null>(null)
const selectedBook = ref('')
const uploadedBook = ref<{ name: string } | null>(null)

// 模拟数据 - 历史备课记录
const mockHistoryPlans: HistoryPlan[] = [
  {
    id: 1,
    courseName: '数据结构与算法',
    chapter: '树与二叉树',
    createTime: '2023-05-20 14:30:00'
  },
  {
    id: 2,
    courseName: '计算机网络',
    chapter: 'TCP/IP协议',
    createTime: '2023-05-18 09:15:00'
  }
]

// 模拟数据 - 个性化教学方案示例
const mockPlan: TeachingPlan = {
  id: 100,
  courseName: '数据结构与算法',
  chapter: '树与二叉树',
  createTime: '2023-05-25 10:30:45',
  objectives: [
    '理解树的基本概念和性质',
    '掌握二叉树的定义和存储结构',
    '能够实现二叉树的遍历算法',
    '理解二叉树的应用场景'
  ],
  analysis: `<p>根据前测分析，学生对线性结构（如数组、链表）掌握较好，但对非线性结构理解不足。学生可以分为三类：</p>
    <ul>
      <li><strong>A组（约20%）</strong>：编程基础扎实，算法思维能力强，能独立完成复杂问题</li>
      <li><strong>B组（约65%）</strong>：基础编程能力良好，需要适当引导和练习</li>
      <li><strong>C组（约15%）</strong>：编程基础较弱，需要更多辅导和练习</li>
    </ul>`,
  keyPoints: [
    '树的基本概念和术语',
    '二叉树的性质和存储结构',
    '二叉树的遍历算法',
    '二叉树的应用'
  ],
  difficultPoints: [
    '理解树形结构的递归特性',
    '掌握非递归遍历算法',
    '应用二叉树解决实际问题'
  ],
  process: [
    {
      name: '导入新课（10分钟）',
      content: `<p>通过生活中的树形结构（如家谱、文件系统、组织结构图等）引入树的概念，对比线性结构，说明树形结构的优势和应用场景。</p>`
    },
    {
      name: '新课讲解（25分钟）',
      content: `<p>1. 讲解树的基本概念和术语</p>
        <p>2. 介绍二叉树的性质和存储结构</p>
        <p>3. 讲解二叉树的遍历算法</p>`,
      groupActivities: [
        {
          name: '算法实现讨论',
          description: '学生分组讨论不同遍历算法的实现方式，比较递归和非递归实现的优缺点'
        }
      ]
    },
    {
      name: '实践环节（20分钟）',
      content: `<p>根据学生能力分层设计实践任务：</p>
        <p>- A组：实现二叉树的各种操作，并解决实际问题</p>
        <p>- B组：实现基本的遍历算法，并分析其时间复杂度</p>
        <p>- C组：理解遍历算法的原理，完成简单的代码填空</p>`
    },
    {
      name: '总结反馈（5分钟）',
      content: `<p>1. 学生代表分享学习心得</p>
        <p>2. 教师总结重点和难点</p>
        <p>3. 布置分层作业</p>`
    }
  ],
  evaluation: `<p>采用多元评价方式：</p>
    <ol>
      <li>课堂表现评价（30%）：包括回答问题、参与讨论等</li>
      <li>实践任务完成情况（40%）：根据代码质量和完成度评价</li>
      <li>小组合作评价（30%）：小组活动中的贡献和合作情况</li>
    </ol>`,
  homework: [
    'A组：实现二叉树的线索化，并解决一道算法竞赛题',
    'B组：实现二叉树的基本操作，并分析其时间复杂度',
    'C组：完成二叉树遍历的代码实现，并理解其原理'
  ],
  reflection: `<p>本教学设计基于学情分析，采用分层教学策略，照顾不同层次学生的学习需求。教学中注重以下几点：</p>
    <ol>
      <li>从实际问题引入，增强学习兴趣</li>
      <li>通过实践环节加深理解</li>
      <li>分层任务满足不同学生的发展需要</li>
      <li>注重算法思维和编程能力的培养</li>
    </ol>
    <p>后续教学中可以增加更多实际应用案例，并引入可视化工具帮助学生理解树形结构。</p>`
}

// 加载历史方案
const loadHistoryPlans = () => {
  // 模拟API请求
  setTimeout(() => {
    historyPlans.value = mockHistoryPlans
    ElMessage.success('历史方案加载成功')
  }, 500)
}

// 生成教学方案
const generatePlan = () => {
  if (!formData.targetClass || !formData.chapter) {
    ElMessage.warning('请选择教学班级和输入教学章节')
    return
  }
  
  generating.value = true
  
  // 模拟API请求
  setTimeout(() => {
    generating.value = false
    currentPlan.value = mockPlan
    ElMessage.success('个性化教学方案生成成功')
  }, 2000)
}

// 查看历史方案
const viewPlan = (plan: HistoryPlan) => {
  // 模拟API请求获取方案详情
  setTimeout(() => {
    currentPlan.value = mockPlan
    ElMessage.success('方案加载成功')
  }, 500)
}

// 删除方案
const deletePlan = (plan: HistoryPlan) => {
  ElMessageBox.confirm(
    `确定要删除"${plan.courseName}-${plan.chapter}"的方案吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
  .then(() => {
    // 模拟删除操作
    historyPlans.value = historyPlans.value.filter(item => item.id !== plan.id)
    ElMessage.success('删除成功')
  })
  .catch(() => {
    // 取消操作
  })
}

// 下载方案
const downloadPlan = () => {
  ElMessage.success('教学方案下载成功')
}

// 保存方案
const savePlan = () => {
  ElMessage.success('教学方案保存成功')
}

// 导出方案
const exportPlan = () => {
  ElMessage.success('教学方案导出成功')
}

// 搜索教材
const searchBookByISBN = () => {
  if (!isbnCode.value) {
    ElMessage.warning('请输入ISBN码')
    return
  }
  
  isSearching.value = true
  
  // 模拟API请求
  setTimeout(() => {
    isSearching.value = false
    bookInfo.value = {
      title: '高中数学必修一',
      author: '人民教育出版社',
      publisher: '人民教育出版社',
      publishYear: '2020',
      cover: 'https://example.com/book-cover.jpg'
    }
    selectedBook.value = bookInfo.value.title
    ElMessage.success('教材信息获取成功')
  }, 1500)
}

// 处理教材文件上传
const handleBookFileChange = (file: any) => {
  if (file) {
    uploadedBook.value = { name: file.name }
    ElMessage.success('教材文件上传成功')
  }
}

// 移除教材文件
const removeBookFile = () => {
  uploadedBook.value = null
  ElMessage.success('教材文件已移除')
}

// 初始化
onMounted(() => {
  loadHistoryPlans()
})
</script>

<style scoped>
.personalized-bg {
  background: #f6f8fa;
  min-height: 100vh;
  padding: 32px 0;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  margin-left: 40px;
  margin-bottom: 32px;
  color: #222;
  letter-spacing: 2px;
  text-align: left;
}
.custom-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  margin: 0 auto 32px auto;
  max-width: 1200px;
  background: #fff;
  border: none;
}
.card-header {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.source-selector {
  margin: 24px 0 16px 0;
}
.info-form {
  padding: 24px 0 0 0;
}
.el-form-item {
  margin-bottom: 28px;
}
.el-input, .el-select, .el-input-number {
  width: 100%;
}
.isbn-input {
  margin-bottom: 16px;
}
.isbn-input-field {
  width: 100%;
}
.searching-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.searching-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.searching-icon {
  font-size: 24px;
  color: #409EFF;
  animation: rotating 2s linear infinite;
}
.searching-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.searching-title {
  font-size: 16px;
  color: #606266;
}
.searching-dots {
  display: flex;
  gap: 4px;
}
.dot {
  animation: dot-flashing 1.4s infinite linear;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}
.book-info {
  display: flex;
  gap: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin: 16px 0;
}
.book-cover {
  width: 120px;
  height: 160px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.book-details {
  flex: 1;
}
.book-details h4 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
}
.book-details p {
  margin: 8px 0;
  color: #606266;
}
.selected-book {
  margin-top: 16px;
}
.selected-book-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
}
.pdf-upload {
  padding: 20px;
}
.uploaded-book-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
.book-name {
  flex: 1;
  color: #606266;
}
.empty-history {
  padding: 40px 0;
}
.history-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.small-text {
  color: #909399;
  font-size: 14px;
  margin: 8px 0;
}
.generating-container {
  padding: 20px;
}
.generating-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  color: #606266;
}
.plan-content {
  padding: 20px;
}
.plan-header {
  text-align: center;
  margin-bottom: 24px;
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
  border-bottom: 1px solid #ebeef5;
}
.section-content {
  color: #606266;
  line-height: 1.6;
}
.section-content ul {
  margin: 8px 0;
  padding-left: 20px;
}
.section-content li {
  margin: 4px 0;
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes dot-flashing {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
