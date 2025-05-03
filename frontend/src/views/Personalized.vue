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
          <el-button 
            class="auto-fill-btn"
            @click="handleAiFillOptions"
            :loading="isAiFilling"
            title="根据当前章节自动填充下方选项"
            size="small"
          >
            <el-icon><MagicStick /></el-icon>
            AI填充
          </el-button>
        </div>
      </template>
      <el-form :model="formData" label-width="120px" class="info-form">
        <el-form-item label="课程名称">
          <el-input v-model="formData.courseName" placeholder="请输入课程名称（可选）"></el-input>
        </el-form-item>
        <el-form-item label="所属学科">
          <el-input v-model="formData.subject" placeholder="例如：计算机科学、数学、物理学"></el-input>
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
          <!-- Chapter Progress Steps -->
          <div class="chapter-selection">
            <el-steps :active="currentChapterIndex" finish-status="success" simple style="margin-bottom: 10px;">
              <el-step
                v-for="(chapterName, index) in chapters"
                :key="index"
                :title="getShortChapterTitle(chapterName)" 
                @click="setCurrentChapter(index)"
                class="clickable-step"
              ></el-step>
            </el-steps>
            <el-input v-model="formData.chapter" placeholder="请输入或选择教学章节"></el-input>
          </div>
        </el-form-item>
        <el-form-item label="教学目标">
          <el-input v-model="formData.objectives" type="textarea" :rows="3" placeholder="请输入本节课的教学目标"></el-input>
        </el-form-item>
        <el-form-item label="核心知识点">
          <el-select 
            v-model="formData.knowledgePoints" 
            multiple 
            filterable 
            allow-create 
            default-first-option
            clearable
            placeholder="选择或输入本节课的核心知识点"
            style="width: 100%"
          >
            <el-option 
              v-for="item in knowledgePointOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学情分析">
          <el-radio-group v-model="formData.analysisType">
            <el-radio :label="1">使用系统分析</el-radio>
            <el-radio :label="2">自定义学情</el-radio>
            <el-radio :label="3">上传学情文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.analysisType === 2" label="自定义学情分析">
          <el-input v-model="formData.customAnalysis" type="textarea" :rows="5" placeholder="请输入学生学情分析，包括知识掌握情况、学习能力等"></el-input>
        </el-form-item>
        <el-form-item v-if="formData.analysisType === 3" label="上传学情文件">
          <el-upload
            class="upload-demo"
            drag
            action="#" 
            :auto-upload="false"
            :show-file-list="false"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
            :on-change="handleAnalysisFileChange"
            style="width: 100%;"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF, Word, TXT, Excel, CSV 格式，大小不超过 5MB
              </div>
            </template>
          </el-upload>
          <div v-if="formData.analysisFile" class="uploaded-file-info">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ formData.analysisFile.name }}</span>
            <el-button type="danger" link @click="removeAnalysisFile">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="个性化策略">
          <el-checkbox-group v-model="formData.strategies">
            <el-checkbox label="分层教学">分层教学</el-checkbox>
            <el-checkbox label="小组合作">小组合作</el-checkbox>
            <el-checkbox label="项目教学">项目教学</el-checkbox>
            <el-checkbox label="探究式学习">探究式学习</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="课次与时长">
          <el-input-number v-model="formData.lessonSessions" :min="1" :max="20" controls-position="right" placeholder="课次数" style="width: 100px;"></el-input-number>
          <span style="margin: 0 8px;">次,</span>
          <el-input-number v-model="formData.sessionDuration" :min="30" :max="180" :step="5" controls-position="right" placeholder="时长" style="width: 100px;"></el-input-number>
          <span style="margin-left: 8px;">分钟/次</span>
        </el-form-item>
        <el-form-item label="特殊教学要求">
           <el-input 
             v-model="formData.customRequirements" 
             type="textarea" 
             :rows="3" 
             placeholder="例如：强调算法实现、结合项目案例、侧重理论推导"
           />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Replaced History Plans with Analysis Card -->
    <el-card class="custom-card analysis-card">
      <template #header>
        <div class="card-header">
          <span>分析历史备课数据</span>
          <!-- Removed Refresh Button -->
        </div>
      </template>
      <div class="analysis-content">
        <el-button 
          type="primary" 
          @click="analyzeHistoryData"
          :loading="isAnalyzing"
          icon="DataLine"
        >
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </el-button>
        <p class="analysis-tip">点击按钮，系统将分析您过往的备课记录，生成常用策略、风格等建议。</p>

        <!-- Analysis Results Section -->
        <div v-if="showAnalysisResults" class="analysis-results-container">
          <h4>分析结果与建议：</h4>
          
          <div class="result-category" v-if="analysisResults.suggestedStrategies?.length">
            <span class="category-title">常用策略:</span>
            <el-tag 
              v-for="strategy in analysisResults.suggestedStrategies" 
              :key="'strategy-' + strategy"
              :type="isSelected('strategies', strategy) ? 'primary' : 'success'"
              :effect="isSelected('strategies', strategy) ? 'dark' : 'light'"
              class="suggestion-tag"
              @click="applySuggestion('strategies', strategy)"
            >
              {{ strategy }}
            </el-tag>
          </div>

          <div class="result-category" v-if="analysisResults.suggestedStyles?.length">
            <span class="category-title">教学风格:</span>
            <el-tag 
              v-for="style in analysisResults.suggestedStyles" 
              :key="'style-' + style"
              :type="isSelected('styles', style) ? 'primary' : 'warning'"
              :effect="isSelected('styles', style) ? 'dark' : 'light'"
              class="suggestion-tag"
              @click="applySuggestion('styles', style)" >
              {{ style }}
            </el-tag>
          </div>

          <div class="result-category" v-if="analysisResults.suggestedTools?.length">
            <span class="category-title">常用工具:</span>
            <el-tag 
              v-for="tool in analysisResults.suggestedTools" 
              :key="'tool-' + tool"
              :type="isSelected('tools', tool) ? 'primary' : 'info'" 
              :effect="isSelected('tools', tool) ? 'dark' : 'light'"    
              class="suggestion-tag"
              @click="applySuggestion('tools', tool)" >
              {{ tool }}
            </el-tag>
          </div>

          <div class="result-category" v-if="analysisResults.suggestedAssessments?.length">
            <span class="category-title">评价侧重:</span>
            <el-tag 
              v-for="assessment in analysisResults.suggestedAssessments" 
              :key="'assessment-' + assessment"
              :type="isSelected('assessments', assessment) ? 'primary' : 'danger'" 
              :effect="isSelected('assessments', assessment) ? 'dark' : 'light'"    
              class="suggestion-tag"
              @click="applySuggestion('assessments', assessment)" >
              {{ assessment }}
            </el-tag>
          </div>

          <div class="result-category" v-if="analysisResults.suggestedInteractions?.length">
            <span class="category-title">互动方式:</span>
            <el-tag 
              v-for="interaction in analysisResults.suggestedInteractions" 
              :key="'interaction-' + interaction"
              :type="isSelected('interactions', interaction) ? 'primary' : 'success'" 
              :effect="isSelected('interactions', interaction) ? 'dark' : 'plain'"    
              class="suggestion-tag"
              @click="applySuggestion('interactions', interaction)" >
              {{ interaction }}
            </el-tag>
          </div>
           <el-empty v-if="!analysisResults.suggestedStrategies?.length && !analysisResults.suggestedStyles?.length && !analysisResults.suggestedTools?.length && !analysisResults.suggestedAssessments?.length && !analysisResults.suggestedInteractions?.length" description="未能从历史数据中提取有效建议"></el-empty>
        </div>
      </div>
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
            <div class="tags-container">
              <el-tag
                v-for="(point, index) in currentPlan.keyPoints"
                :key="'key-' + index"
                type="primary" 
                effect="light"
                size="large"
                class="point-tag"
              >
                {{ point }}
              </el-tag>
              <el-empty v-if="!currentPlan.keyPoints || currentPlan.keyPoints.length === 0" description="暂无重点内容" :image-size="50"></el-empty>
            </div>

            <h4 style="margin-top: 15px;">难点：</h4>
            <div class="tags-container">
              <el-tag
                v-for="(point, index) in currentPlan.difficultPoints"
                :key="'diff-' + index"
                type="danger" 
                effect="light"
                size="large"
                class="point-tag"
              >
                {{ point }}
              </el-tag>
              <el-empty v-if="!currentPlan.difficultPoints || currentPlan.difficultPoints.length === 0" description="暂无难点内容" :image-size="50"></el-empty>
            </div>
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
        
        <!-- Action Buttons -->
        <div class="plan-actions">
          <el-button type="primary" @click="downloadPlan" :icon="Download">下载方案</el-button>
          <el-button type="success" @click="savePlan" :icon="Star">保存方案</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MagicStick, 
  DataLine,
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
import { 
  Packer, 
  Document as DocxDocument, // Rename import 
  Paragraph, 
  HeadingLevel, 
  TextRun, 
  AlignmentType, 
  Numbering, 
  Indent, 
  LevelFormat, 
  TabStopType, 
  TabStopPosition, 
  IParagraphOptions, // Import interface for options
} from 'docx';
import { saveAs } from 'file-saver';

// Define type for Paragraph properties used in helpers
// type ParagraphProperties = Pick<IParagraphOptions, 'style' | 'numbering' | 'children' | 'text' | 'indent'>;

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

// Mapping for class abbreviations to full names
const classMap: { [key: string]: string } = {
  'cs2101': '计算机科学与技术2101',
  'cs2102': '计算机科学与技术2102',
  'se2101': '软件工程2101',
  'se2102': '软件工程2102',
  'ai2101': '人工智能2101',
  'ai2102': '人工智能2102',
  'ds2101': '数据科学与大数据技术2101',
  'ds2102': '数据科学与大数据技术2102'
};

// Chapter data (Updated with Machine Learning chapters from Syllabus.vue)
const chapters = ref([
  '第一章 绪论',
  '第二章 模型评估与选择',
  '第三章 线性模型',
  '第四章 决策树',
  '第五章 神经网络',
  '第六章 支持向量机',
  '第七章 贝叶斯分类',
  '第八章 集成学习',
  '第九章 聚类',
  '第十章 降维与度量学习' // Example, add more if needed
])
const currentChapterIndex = ref(2) // Default to Chapter 3 (Linear Models)

// Function to get shorter title for steps
const getShortChapterTitle = (fullTitle: string) => {
  const parts = fullTitle.split(' ')
  return parts.length > 1 ? parts[1] : parts[0]
}

// Function to set current chapter
const setCurrentChapter = (index: number) => {
  currentChapterIndex.value = index
}

// Predefined knowledge points (Updated with Machine Learning points from Syllabus.vue)
const knowledgePointOptions = ref([
  { value: '线性回归', label: '线性回归' },
  { value: '逻辑回归', label: '逻辑回归' },
  { value: '支持向量机 (SVM)', label: '支持向量机 (SVM)' },
  { value: '决策树', label: '决策树' },
  { value: '随机森林', label: '随机森林' },
  { value: '神经网络', label: '神经网络' },
  { value: '深度学习', label: '深度学习' },
  { value: '聚类 (K-Means)', label: '聚类 (K-Means)' },
  { value: '降维 (PCA)', label: '降维 (PCA)' },
  { value: '梯度下降', label: '梯度下降' },
  { value: '损失函数', label: '损失函数' },
  { value: '过拟合与欠拟合', label: '过拟合与欠拟合' },
  { value: '正则化 (L1/L2)', label: '正则化 (L1/L2)' },
  { value: '交叉验证', label: '交叉验证' },
  { value: '模型评估指标', label: '模型评估指标' },
  { value: '特征工程', label: '特征工程' },
  { value: '监督学习', label: '监督学习' },
  { value: '无监督学习', label: '无监督学习' },
  { value: '强化学习', label: '强化学习' },
]);

// AI Filling state
const isAiFilling = ref(false)

// Helper function for delay
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Form data
const formData = reactive({
  courseName: '', // Keep empty, AI fill will suggest
  targetClass: '',
  subject: '机器学习', // Default subject updated
  chapter: '', 
  objectives: '',
  knowledgePoints: [] as string[], 
  analysisType: 1, 
  customAnalysis: '',
  analysisFile: null as { name: string, file?: File } | null,
  strategies: [] as string[], 
  lessonSessions: 1, 
  sessionDuration: 45, 
  customRequirements: '' 
})

// State variables
const generating = ref(false)
const currentPlan = ref<TeachingPlan | null>(null)
const activeProcessStages = ref([0]) 
const isBasicInfoAIGenerated = ref(false)

// Analysis state variables
const isAnalyzing = ref(false)
const showAnalysisResults = ref(false)
const analysisResults = ref<{
  suggestedStrategies?: string[];
  suggestedStyles?: string[];
  suggestedTools?: string[];
  suggestedAssessments?: string[];
  suggestedInteractions?: string[];
}>({})
const selectedStrategies = ref<string[]>([]) 
const selectedStyles = ref<string[]>([]) 
const selectedTools = ref<string[]>([]) 
const selectedAssessments = ref<string[]>([]) 
const selectedInteractions = ref<string[]>([])

// Textbook selection related
const bookSelectionMethod = ref('isbn')
const isbnCode = ref('')
const isSearching = ref(false)
const bookInfo = ref<BookInfo | null>(null)
const selectedBook = ref('')
const uploadedBook = ref<{ name: string } | null>(null)

// Generate teaching plan
const generatePlan = async () => {
  if (!formData.targetClass || !formData.chapter) {
    ElMessage.warning('请选择教学班级和输入教学章节')
    return
  }
  
  generating.value = true
  currentPlan.value = null; // Clear previous plan
  
  try {
    // Simulate API request - Adapt this to use formData for generation
    await sleep(2500); 

    // --- Generate Plan Content Based on formData ---
    const objectives = formData.objectives.split('\n').filter(o => o.trim() !== '').length > 0
      ? formData.objectives.split('\n').filter(o => o.trim() !== '')
      : [`掌握 ${formData.knowledgePoints.join('、')} 的基本概念与应用`, '培养分析和解决相关问题的能力']; // Default objectives

    // Get the full class name from the map
    const fullClassName = formData.targetClass ? (classMap[formData.targetClass] || formData.targetClass) : '未指定班级';

    let analysisContent = '';
    if (formData.analysisType === 1) {
      analysisContent = `<p><strong>系统分析 (${fullClassName}):</strong></p><p>根据对 ${fullClassName} 班级历史学习数据分析，学生普遍对 ${formData.subject} 的基础概念有一定了解，但在 ${formData.knowledgePoints[0] || '核心难点'} 的深入理解和应用上存在差异。建议采用 ${formData.strategies.join('、')} 等教学策略。 </p>`;
    } else if (formData.analysisType === 2) {
      analysisContent = `<p><strong>自定义学情 (${fullClassName}):</strong></p><p>${formData.customAnalysis || '教师未提供详细自定义学情分析。'}</p>`;
    } else if (formData.analysisType === 3 && formData.analysisFile) {
      analysisContent = `<p><strong>基于上传文件 (${formData.analysisFile.name}) 的学情分析 (${fullClassName}):</strong></p><p>文件分析显示，大部分学生掌握了核心概念，少数学生在应用实践方面需要加强辅导。</p>`;
    } else {
      analysisContent = '<p>未提供有效的学情分析信息。</p>';
    }

    const keyPoints = formData.knowledgePoints.length > 0 ? [...formData.knowledgePoints] : ['核心概念', '基本原理'];
    // Simulate difficult points based on key points (e.g., the first few or randomly selected)
    const difficultPoints = keyPoints.length > 1
        ? [ `深入理解 ${keyPoints[0]}`, `灵活应用 ${keyPoints[1]}` ]
        : keyPoints.length === 1 ? [`深入理解 ${keyPoints[0]}`] : ['核心概念的灵活应用'];

    // Generate process stages based on sessions and strategies
    const processStages: ProcessStage[] = [];
    const baseDurationPerStage = formData.sessionDuration > 0 ? formData.sessionDuration / 3 : 15; // Avoid division by zero
    for (let i = 0; i < formData.lessonSessions; i++) {
        let sessionName = `第 ${i + 1} 课次`;
        if (formData.lessonSessions === 1) sessionName = '主要教学过程';

        processStages.push({
            name: `${sessionName} - 导入与回顾 (${Math.round(baseDurationPerStage * 0.5)}分钟)`,
            content: `<p>简要回顾上节课内容或引入本节课主题 (${formData.chapter})，明确学习目标。</p>`
        });
        processStages.push({
            name: `${sessionName} - 新知讲解 (${Math.round(baseDurationPerStage * 1.5)}分钟)`,
            content: `<p>详细讲解核心知识点：${formData.knowledgePoints.join('、')}。${formData.strategies.includes('案例教学') ? ' 结合相关案例进行深入分析。' : ' 通过实例演示加深理解。'}</p>`,
            groupActivities: formData.strategies.includes('小组合作') ? [{name: '分组讨论', description: '就关键概念或案例进行分组讨论与成果分享'}] : undefined
        });
         processStages.push({
            name: `${sessionName} - 实践与反馈 (${Math.round(baseDurationPerStage * 1)}分钟)`,
            content: `<p>${formData.strategies.includes('项目教学') ? '开展小型项目实践或编程练习。' : '完成课堂练习题并进行讲解反馈。'} ${formData.strategies.includes('分层教学') ? '针对不同掌握程度的学生布置差异化任务。' : '鼓励学生提问与互动答疑。'}</p>`
        });
    }

    const evaluation = `<p><strong>评价方式:</strong></p><ul><li>课堂参与度与提问 (${selectedAssessments.value.includes('过程性评价') ? '30%' : '20%'})</li><li>${formData.strategies.includes('项目教学') ? '项目/实践任务完成度 (' + (selectedAssessments.value.includes('表现性评价') ? '40%' : '30%') + ')' : '课堂练习/作业质量 (30%)'}</li><li>期末知识测验 (${selectedAssessments.value.includes('终结性评价') ? '40%' : '50%'})</li></ul><p>综合考察 ${keyPoints.join('、')} 的掌握程度与应用能力。</p>`;
    const homework = [`复习 ${formData.knowledgePoints.join('、')} 相关内容笔记`, `完成 ${formData.chapter} 配套练习题或思考题`, `预习下一章节：${chapters.value[currentChapterIndex.value + 1] || '后续内容'}`]; // Better next chapter logic
    const reflection = `<p><strong>教学反思:</strong></p><p>本次教学设计侧重于 ${formData.strategies.join('、')} 等策略，旨在提高学生对 ${keyPoints[0] || '核心知识'} 的理解和应用能力。应关注学生在 ${difficultPoints[0] || '难点部分'} 的反馈，适时调整教学节奏和方法。${formData.customRequirements ? `根据特殊要求，特别注意：${formData.customRequirements}` : '可进一步引入相关领域的最新进展。'}</p>`;


    // Construct the final plan object
    const generatedPlanData: TeachingPlan = {
       id: Date.now(), // Simple ID
       courseName: formData.courseName || '生成的课程',
       chapter: formData.chapter,
       createTime: new Date().toLocaleString(),
       objectives: objectives,
       analysis: analysisContent,
       keyPoints: keyPoints,
       difficultPoints: difficultPoints,
       process: processStages,
       evaluation: evaluation,
       homework: homework,
       reflection: reflection,
    };

    currentPlan.value = generatedPlanData;
    ElMessage.success('个性化教学方案生成成功');

  } catch (error) {
    console.error("生成教学方案失败:", error);
    ElMessage.error('生成教学方案时出错');
  } finally {
    generating.value = false;
  }
};

// Helper to convert basic HTML (strong, em, br) within paragraphs to Paragraph Option Objects
const convertHtmlToDocxOptions = (htmlString: string | undefined): IParagraphOptions[] => {
  if (!htmlString) return [{ text: "" }];

  const paragraphOptionsList: IParagraphOptions[] = [];
  try {
    const parser = new DOMParser();
    // Wrap in a div to handle potential fragments
    const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html');

    const processBlockNode = (blockNode: Node) => {
        if (blockNode.nodeType === Node.ELEMENT_NODE) {
            const element = blockNode as Element;
            const tagName = element.tagName.toLowerCase();

            // Process expected block elements or top-level content
            if (tagName === 'p' || tagName === 'div' || blockNode.parentNode === doc.body) {
                let currentRuns: TextRun[] = [];

                const processInlineNodes = (inlineNode: Node) => {
                    if (inlineNode.nodeType === Node.TEXT_NODE) {
                        currentRuns.push(new TextRun(inlineNode.textContent || ""));
                    } else if (inlineNode.nodeType === Node.ELEMENT_NODE) {
                        const inlineElement = inlineNode as Element;
                        const inlineTagName = inlineElement.tagName.toLowerCase();

                        if (inlineTagName === 'strong' || inlineTagName === 'b') {
                            currentRuns.push(new TextRun({ text: inlineElement.textContent || "", bold: true }));
                        } else if (inlineTagName === 'em' || inlineTagName === 'i') {
                            currentRuns.push(new TextRun({ text: inlineElement.textContent || "", italics: true }));
                        } else if (inlineTagName === 'br') {
                            // Finish current segment and add it to list
                            if (currentRuns.length > 0) {
                                paragraphOptionsList.push({ children: [...currentRuns] }); // Create final options object
                                currentRuns = []; // Reset runs
                            }
                            // Add empty paragraph options for the line break itself
                            paragraphOptionsList.push({ text: "" });
                        } else {
                            // Treat others as plain text
                            currentRuns.push(new TextRun(inlineElement.textContent || ""));
                        }
                    }
                };

                element.childNodes.forEach(processInlineNodes);

                // Add any remaining runs as the last paragraph segment
                if (currentRuns.length > 0) {
                    paragraphOptionsList.push({ children: currentRuns }); // Create final options object
                }
                 // If the element was entirely empty (e.g., <p></p>) and we haven't added anything yet for it,
                 // add a single empty paragraph representation.
                 else if (element.childNodes.length === 0 && paragraphOptionsList.length === 0) {
                     paragraphOptionsList.push({ text: "" });
                 }
            }
             // Handle other block elements by extracting text content
            else {
                 const textContent = element.textContent?.trim();
                 if (textContent) {
                     paragraphOptionsList.push({ text: textContent });
                 }
            }
        } else if (blockNode.nodeType === Node.TEXT_NODE && blockNode.textContent?.trim()) {
             // Handle top-level text nodes
             paragraphOptionsList.push({ text: blockNode.textContent.trim() });
        }
    };

    // Process children of the wrapper div
    doc.body.firstChild?.childNodes.forEach(processBlockNode);

    // Ensure at least one paragraph option is returned
    return paragraphOptionsList.length > 0 ? paragraphOptionsList : [{ text: "" }];

  } catch (e) {
    console.error("Error parsing HTML for DOCX options:", e);
    const plainText = htmlString.replace(/<[^>]*>?/gm, '');
    return [{ text: plainText }];
  }
};

// Helper function to create bulleted or numbered list OPTIONS from STRING array
const createDocxListOptions = (items: string[], ordered: boolean = false): IParagraphOptions[] => {
    return items.map((itemText) => {
        // Create simple paragraph options for each list item text
        return {
            text: itemText.trim(), // Ensure text is trimmed
            numbering: {
                reference: ordered ? "decimalListStyle" : "bulletListStyle", // Use correct reference
                level: 0,
            },
        };
    });
};

// Download, Save Plan functions
const downloadPlan = async () => {
  if (!currentPlan.value) {
    ElMessage.warning('请先生成教学方案');
    return;
  }

  ElMessage.info('正在准备Word文档...');

  try {
    const plan = currentPlan.value;

    // --- Define SEPARATE Numbering Configurations --- 
    const bulletNumberingConfig = {
      reference: "bulletListStyle",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
         {
          level: 1, 
          format: LevelFormat.BULLET,
          text: "◦",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 1440, hanging: 360 },
            },
          },
        },
      ],
    };
     const decimalNumberingConfig = {
      reference: "decimalListStyle",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
        {
          level: 1, 
          format: LevelFormat.DECIMAL,
          text: "%2.",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: {
              indent: { left: 1440, hanging: 360 },
            },
          },
        },
      ],
    };

     const styles = {
        // Optional: Define paragraph styles if needed for more complex formatting,
        // but basic list appearance is handled by numbering config.
     };

    // --- Build Document Content --- 
    // Convert HTML content to options first
    const analysisOptions = convertHtmlToDocxOptions(plan.analysis);
    const evaluationOptions = convertHtmlToDocxOptions(plan.evaluation);
    const reflectionOptions = convertHtmlToDocxOptions(plan.reflection);
    const processOptions = plan.process.flatMap((stage) => [
      { text: stage.name, heading: HeadingLevel.HEADING_2 } as IParagraphOptions,
      ...convertHtmlToDocxOptions(stage.content),
      ...(stage.groupActivities && stage.groupActivities.length > 0 ? [
        { text: "分组活动：", heading: HeadingLevel.HEADING_3 } as IParagraphOptions,
        ...stage.groupActivities.flatMap(activity => [
          { children: [new TextRun({ text: activity.name, bold: true })]} as IParagraphOptions,
          ...convertHtmlToDocxOptions(activity.description)
        ])
      ] : []),
      { text: "" }, // Spacer
    ]);

    const docChildren = [
      new Paragraph({ text: `${plan.courseName} - ${plan.chapter}`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: `生成时间：${plan.createTime}`, italics: true })], alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "" }), // Spacer

      new Paragraph({ text: "教学目标", heading: HeadingLevel.HEADING_1 }),
      ...createDocxListOptions(plan.objectives, true).map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),

      new Paragraph({ text: "学情分析", heading: HeadingLevel.HEADING_1 }),
      ...analysisOptions.map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),

      new Paragraph({ text: "教学重难点", heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "重点：", heading: HeadingLevel.HEADING_2 }),
      ...createDocxListOptions(plan.keyPoints, false).map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "难点：", heading: HeadingLevel.HEADING_2 }),
      ...createDocxListOptions(plan.difficultPoints, false).map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),

      new Paragraph({ text: "教学过程", heading: HeadingLevel.HEADING_1 }),
      ...processOptions.map(opts => new Paragraph(opts)), // Already includes spacers
      // Remove redundant spacer: new Paragraph(""),

      new Paragraph({ text: "教学评价", heading: HeadingLevel.HEADING_1 }),
      ...evaluationOptions.map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),

      new Paragraph({ text: "课后作业", heading: HeadingLevel.HEADING_1 }),
      ...createDocxListOptions(plan.homework, false).map(opts => new Paragraph(opts)),
      new Paragraph({ text: "" }),

      new Paragraph({ text: "教学反思", heading: HeadingLevel.HEADING_1 }),
      ...reflectionOptions.map(opts => new Paragraph(opts)),
    ];

    // --- Create and Download Document --- 
    const doc = new DocxDocument({
      numbering: {
        config: [bulletNumberingConfig, decimalNumberingConfig] // Include both configs
      }, 
      // styles: styles, // Include if styles are defined
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${plan.courseName}_${plan.chapter}_教学方案.docx`);
    ElMessage.success('Word文档下载成功');

  } catch (error) {
    console.error("生成Word文档失败:", error);
    ElMessage.error('生成Word文档时出错，请检查浏览器控制台获取详细信息。');
  }
};

const savePlan = () => {
  ElMessage.success('教学方案保存成功')
}

// Search Book by ISBN
const searchBookByISBN = () => {
  if (!isbnCode.value) {
    ElMessage.warning('请输入ISBN码')
    return
  }
  
  isSearching.value = true
  
  // 模拟API请求
  setTimeout(() => {
    isSearching.value = false
    // 使用与 Syllabus.vue 一致的数据
    bookInfo.value = {
      title: '机器学习',
      author: '周志华',
      publisher: '清华大学出版社',
      publishYear: '2016',
      cover: new URL('@/assets/image/machine_learning.png', import.meta.url).href
    }
    selectedBook.value = bookInfo.value.title // 更新 selectedBook
    ElMessage.success('教材信息获取成功')
  }, 1500)
}

// Handle Book File Change & Remove
const handleBookFileChange = (file: any) => {
  if (file) {
    uploadedBook.value = { name: file.name }
    ElMessage.success('教材文件上传成功')
  }
}

const removeBookFile = () => {
  uploadedBook.value = null
  ElMessage.success('教材文件已移除')
}

// Handle Analysis File Change & Remove
const handleAnalysisFileChange = (file: any) => {
  // Basic validation (e.g., size limit)
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    ElMessage.error('文件大小不能超过 5MB');
    // Clear the invalid file from the upload component if possible
    // Note: Element Plus upload might require specific ways to clear invalid files depending on version
    return;
  }
  if (file.raw) {
    formData.analysisFile = { name: file.name, file: file.raw };
    ElMessage.success('学情文件上传成功');
  } else {
     // Fallback/Handling for potential issues with accessing file.raw immediately
     formData.analysisFile = { name: file.name };
     ElMessage.info('文件已选择'); 
     // Consider if further action needed if file.raw is essential later
  }
};

const removeAnalysisFile = () => {
  formData.analysisFile = null;
  ElMessage.success('学情文件已移除');
};

// Watch currentChapterIndex to update formData.chapter
watch(currentChapterIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < chapters.value.length) {
    formData.chapter = chapters.value[newIndex]
  } else {
    formData.chapter = '' // Clear if index is invalid
  }
}, { immediate: true }) // immediate: true ensures initial value is set

// --- AI Fill Handler (Updated for Machine Learning) --- 
const handleAiFillOptions = async () => {
  isAiFilling.value = true;
  try {
    await sleep(500);
    const currentChapter = formData.chapter;
    
    // Default suggestions for Machine Learning
    let courseNameSuggestion = '机器学习导论';
    let subjectSuggestion = '人工智能'; // Or keep '机器学习'
    let objectivesSuggestion = [
      '理解机器学习的基本概念和分类',
      '掌握至少一种核心机器学习算法的原理',
      '能够使用工具实现简单的机器学习模型',
      '了解模型评估的基本方法'
    ];
    let knowledgePointsSuggestion = [] as string[];
    let strategiesSuggestion = ['案例教学', '项目教学', '实践教学'];
    let customRequirementsSuggestion = '强调算法原理理解和代码实践能力，结合实际数据集进行案例分析。';
    let lessonSessionsSuggestion = 2; // ML topics often need more time
    let sessionDurationSuggestion = 50;

    // Customize based on specific ML chapters
    if (currentChapter.includes('线性模型')) {
      courseNameSuggestion = '机器学习 - 线性模型';
      objectivesSuggestion = [
        '理解线性回归和逻辑回归的原理与区别',
        '掌握梯度下降法优化线性模型参数',
        '能够应用线性模型解决分类和回归问题',
        '了解正则化防止过拟合'
      ];
      knowledgePointsSuggestion = ['线性回归', '逻辑回归', '梯度下降', '损失函数', '正则化 (L1/L2)'];
      customRequirementsSuggestion = '侧重数学原理推导和Python代码实现，对比不同线性模型的优劣。';
    } else if (currentChapter.includes('决策树')) {
      courseNameSuggestion = '机器学习 - 决策树';
      objectivesSuggestion = [
        '理解决策树构建的基本流程（划分选择）',
        '掌握信息熵、信息增益等概念',
        '了解ID3, C4.5, CART算法的区别',
        '理解剪枝处理防止过拟合'
      ];
      knowledgePointsSuggestion = ['决策树', '信息熵', '信息增益', 'ID3算法', 'CART算法', '剪枝处理'];
       lessonSessionsSuggestion = 1;
       sessionDurationSuggestion = 45;
    } else if (currentChapter.includes('神经网络')) {
       courseNameSuggestion = '机器学习 - 神经网络';
       subjectSuggestion = '深度学习';
       objectivesSuggestion = [
         '理解感知机和多层神经网络结构',
         '掌握反向传播算法（BP）的原理',
         '了解常见的激活函数及其作用',
         '能够搭建简单的神经网络模型'
       ];
       knowledgePointsSuggestion = ['神经网络', '感知机', '反向传播算法', '激活函数', '深度学习'];
       strategiesSuggestion = ['理论讲解', '代码实践'];
       lessonSessionsSuggestion = 3;
       sessionDurationSuggestion = 50;
    } else {
      // Generic fallback if chapter doesn't match specific cases
      const chapterKp = knowledgePointOptions.value.find(kp => currentChapter.includes(kp.label));
      knowledgePointsSuggestion = chapterKp ? [chapterKp.value] : [currentChapter || '核心概念'];
    }

    // Apply suggestions to formData
    formData.courseName = courseNameSuggestion;
    formData.subject = subjectSuggestion;
    formData.objectives = objectivesSuggestion.join('\n');
    formData.knowledgePoints = knowledgePointsSuggestion;
    formData.analysisType = 1; 
    formData.customAnalysis = ''; 
    formData.analysisFile = null; 
    formData.strategies = strategiesSuggestion;
    formData.lessonSessions = lessonSessionsSuggestion; 
    formData.sessionDuration = sessionDurationSuggestion; 
    formData.customRequirements = customRequirementsSuggestion;

    ElMessage.success('AI已填充机器学习相关配置');

  } catch (error) {
    console.error("AI填充失败:", error);
    ElMessage.error('AI填充选项时出错');
  } finally {
    isAiFilling.value = false;
  }
};

// --- Analyze History Data Handler --- 
const analyzeHistoryData = async () => {
  isAnalyzing.value = true;
  showAnalysisResults.value = false;
  analysisResults.value = {};
  selectedStrategies.value = []; 
  selectedStyles.value = []; 
  selectedTools.value = []; 
  selectedAssessments.value = []; 
  selectedInteractions.value = [];

  try {
    // Step 1: Finding plans
    const foundPlansCount = Math.floor(Math.random() * 30) + 5; 
    ElMessage.info(`已找到 ${foundPlansCount} 份历史教案`);
    await sleep(800);

    // Step 2: Analyzing
    ElMessage.info('正在进行分析...');
    await sleep(1500);

    // Step 3: Simulate results (More tags, no keywords, added interactions)
    const strategyPool = ['项目教学', '分层教学', '案例教学', '探究式学习', '小组合作', '翻转课堂', 'PBL', '讨论法'];
    const stylePool = ['启发式', '互动式', '严谨', '生动活泼', '探究式', '讲练结合', '深入浅出', '幽默风趣', '循循善诱'];
    const toolPool = ['在线编程平台', 'Jupyter Notebook', '思维导图工具', '课堂互动系统(Kahoot)', '版本控制(Git)', '流程图软件', '在线协作白板', '模拟器'];
    const assessmentPool = ['过程性评价', '终结性评价', '表现性评价', '项目报告', '代码质量', '理论考试', '小组互评', '口头展示', '在线测试'];
    const interactionPool = ['提问回答', '小组讨论', '在线投票', '学生演示', '辩论赛', '角色扮演', '同伴互教'];
    
    const simulatedResults = {
      suggestedStrategies: strategyPool.filter(() => Math.random() > 0.3).slice(0, 5),
      suggestedStyles: stylePool.filter(() => Math.random() > 0.3).slice(0, 5),
      suggestedTools: toolPool.filter(() => Math.random() > 0.4).slice(0, 5),
      suggestedAssessments: assessmentPool.filter(() => Math.random() > 0.4).slice(0, 5),
      suggestedInteractions: interactionPool.filter(() => Math.random() > 0.4).slice(0, 5)
    };
    analysisResults.value = simulatedResults;
    showAnalysisResults.value = true;

    // Step 4: Analysis complete message
    ElMessage.success('分析完成');

  } catch (error) {
    console.error("分析历史数据失败:", error);
    ElMessage.error('分析历史数据时出错');
    showAnalysisResults.value = false; 
  } finally {
    isAnalyzing.value = false;
  }
};

// --- Apply/Toggle Suggestion Handler (Manages selection state) ---
const applySuggestion = (type: 'strategies' | 'styles' | 'tools' | 'assessments' | 'interactions', value: string) => {
  let selectedArrayRef: Ref<string[]>;
  let typeName = '';

  if (type === 'strategies') {
    selectedArrayRef = selectedStrategies;
    typeName = '策略';
  } else if (type === 'styles') {
    selectedArrayRef = selectedStyles;
    typeName = '风格';
  } else if (type === 'tools') { 
    selectedArrayRef = selectedTools;
    typeName = '工具';
  } else if (type === 'assessments') { 
    selectedArrayRef = selectedAssessments;
    typeName = '评价方式';
  } else if (type === 'interactions') {
    selectedArrayRef = selectedInteractions;
    typeName = '互动方式';
  } else {
    return; 
  }

  const index = selectedArrayRef.value.indexOf(value);
  if (index === -1) {
    selectedArrayRef.value.push(value);
    ElMessage.success(`已应用${typeName}: ${value}`);
  } else {
    selectedArrayRef.value.splice(index, 1);
    ElMessage.warning(`已取消应用${typeName}: ${value}`);
  }
};

// Helper function to check if a tag is selected
const isSelected = (type: 'strategies' | 'styles' | 'tools' | 'assessments' | 'interactions', value: string): boolean => {
  if (type === 'strategies') {
    return selectedStrategies.value.includes(value);
  } else if (type === 'styles') {
    return selectedStyles.value.includes(value);
  } else if (type === 'tools') { 
    return selectedTools.value.includes(value);
  } else if (type === 'assessments') { 
    return selectedAssessments.value.includes(value);
  } else if (type === 'interactions') {
    return selectedInteractions.value.includes(value);
  }
  return false;
};

// Initialize
onMounted(() => {
  // Initial chapter is set by the watcher
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
  padding: 0px 0 0px 0;
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
  gap: 15px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin: 16px 0;
}
.book-cover {
  width: 90px;
  height: 120px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.book-details {
  flex: 1;
}
.book-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}
.book-details p {
  margin: 6px 0;
  color: #606266;
  font-size: 14px;
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

/* 覆盖 Element Plus Collapse 默认边框 */
.plan-section .el-collapse {
  border-top: none;
  border-bottom: none;
}
.plan-section .el-collapse-item__header {
  border-bottom: none;
}
.plan-section .el-collapse-item__wrap {
  border-bottom: none;
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
.chapter-selection {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.clickable-step {
  cursor: pointer;
  transition: color 0.3s;
}

/* Style for completed step title */
.clickable-step.is-success :deep(.el-step__title) {
  font-weight: bold; /* Make completed title bolder */
  color: var(--el-color-success); /* Ensure success color is applied */
}

/* Center step title */
.clickable-step :deep(.el-step__title) {
  font-size: 13px; /* Adjust font size if needed */
  text-align: center; /* Center the title text */
  margin-top: 2px; /* Add some space between icon and title */
}

/* Style for ACTIVE step title */
.clickable-step.is-process :deep(.el-step__title) {
  color: var(--el-color-primary); /* Highlight active title */
  font-weight: bold;
}

/* Style for completed step icon (Filled Circle) */
.clickable-step.is-success :deep(.el-step__icon) {
  background-color: var(--el-color-success); /* Use success color for background */
  border-color: var(--el-color-success); /* Match border color */
  border-radius: 50%; /* Make it a circle */
  width: 18px; /* Adjust size */
  height: 18px; /* Adjust size */
  display: flex; /* Use flex to center potential inner content */
  align-items: center;
  justify-content: center;
}

/* Hide the default checkmark icon inside the circle */
.clickable-step.is-success :deep(.el-step__icon-inner) {
  display: none; /* Hide the default icon */
}

/* Style for ACTIVE step icon */
.clickable-step.is-process :deep(.el-step__icon) {
  border-color: var(--el-color-primary); /* Highlight border */
  background-color: var(--el-color-primary-light-9); /* Optional: Light background */
  transform: translateY(4px); /* Move icon down by 4px */
  box-shadow: 0 0 5px var(--el-color-primary-light-5); /* Add a subtle glow */
}

/* Ensure the number inside the active icon is visible */
.clickable-step.is-process :deep(.el-step__icon-inner) {
  color: var(--el-color-primary); /* Match icon border color */
  font-weight: bold;
}

/* Style for FUTURE step title */
.clickable-step.is-wait :deep(.el-step__title) {
  color: var(--el-text-color-placeholder); /* Dim future titles */
}

/* Style for FUTURE step icon */
.clickable-step.is-wait :deep(.el-step__icon) {
  background-color: var(--el-fill-color-light); /* Lighter background for future steps */
  border-color: var(--el-border-color-lighter);
}

.clickable-step.is-wait :deep(.el-step__icon-inner) {
  color: var(--el-text-color-placeholder); /* Dim future step numbers */
}

.clickable-step:hover :deep(.el-step__title) {
  color: var(--el-color-primary);
}

/* Styles for uploaded analysis file info */
.uploaded-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px; /* Add margin top */
  padding: 10px;   /* Consistent padding */
  background-color: #f5f7fa;
  border-radius: 4px;
  width: 100%; /* Make it full width */
}
.uploaded-file-info .file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

/* Styles for the AI fill button (copied from Graphic.vue) */
.auto-fill-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  color: white; 
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 16px; 
}

.auto-fill-btn:hover:not(.is-disabled) { 
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #67c23a, #409eff);
}

.auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 14px; 
}

.analysis-card .analysis-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center button initially */
}

.analysis-tip {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.analysis-results-container {
  margin-top: 25px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fcfcfc;
  width: 100%;
}

.analysis-results-container h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.result-category {
  margin-bottom: 15px;
}

.category-title {
  font-weight: 600;
  color: #606266;
  margin-right: 10px;
  font-size: 14px;
}

.suggestion-tag {
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer; 
  transition: all 0.2s ease-in-out;
}

.suggestion-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.plan-section h4 { 
  margin: 12px 0 10px 0; /* Adjusted margin */
  font-weight: 600;
  color: #409EFF; 
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* Spacing between tags */
  margin-bottom: 10px; /* Spacing below tags container */
}

.point-tag {
  padding: 0 12px; /* Adjust padding for better look */
  height: 32px; /* Consistent height */
  line-height: 30px; /* Center text vertically */
}

.tags-container .el-empty {
  padding: 10px 0; /* Adjust empty state padding */
}

.plan-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>
