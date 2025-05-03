<template>
  <div class="pptgen-container">
    <h2>PPT生成</h2>

    <!-- 教案选择卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案选择</span>
          <!-- Removed Browse button as dialog is internal now? Or keep if useful -->
          <!-- <el-button type="primary" size="small" @click="handleSearchLessonPlans">...</el-button> -->
        </div>
      </template>
      <div class="lesson-plan-selection">
        <el-radio-group v-model="lessonPlanSource" size="small" class="source-selector">
          <el-radio-button value="history">历史教案</el-radio-button>
          <el-radio-button value="upload">上传教案</el-radio-button>
        </el-radio-group>

        <!-- 历史教案选择 -->
        <div v-if="lessonPlanSource === 'history'" class="history-section">
          <el-select
            v-model="selectedHistoryPlan"
            placeholder="选择历史教案"
            filterable
            class="wide-select"
            @change="handleHistoryPlanChange"
          >
            <el-option
              v-for="item in historyPlans"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="history-option">
                <div class="name-tag-group">
                  <span>{{ item.name }}</span>
                  <el-tag size="small" :type="getRecordTypeTag(item.type)" class="type-tag">{{ item.type }}</el-tag>
                </div>
                <span class="option-time">{{ formatDate(item.time) }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 上传教案 -->
        <div v-else class="upload-section">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleLessonPlanFileChange"
            accept=".pdf,.doc,.docx"
          >
            <el-button type="primary">选择教案文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word等格式</div>
            </template>
          </el-upload>
        </div>
      </div>
    </el-card>

    <!-- PPT章节编辑卡片 -->
    <el-card v-if="selectedHistoryPlan || pptChapters.length > 0" class="box-card"> <!-- Show if plan selected OR chapters exist -->
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>PPT章节编辑</span>
            <span v-if="isAIGenerated" class="ai-tag"> <!-- Flag for content generation -->
              <span class="ai-dot"></span>
              AI自动生成内容
            </span>
          </div>
          <div class="header-buttons">
             <el-button 
              type="success"
              size="small" 
              @click="handleAutoGenerateChapters" 
              :loading="isTyping" 
              :disabled="pptChapters.length === 0"
            >
              <el-icon><MagicStick /></el-icon>
              AI生成内容
            </el-button>
            <el-button 
              type="primary"
              size="small" 
              @click="handleBatchGenerateGraphics" 
              :loading="batchGeneratingGraphics"
              :disabled="pptChapters.length === 0"
            >
              <el-icon><Picture /></el-icon>
              一键生成资源
            </el-button>
          </div>
        </div>
      </template>
      <div v-if="pptChapters.length > 0" class="chapters-container">
        <el-collapse v-model="activeChapters">
          <el-collapse-item 
            v-for="(chapter, index) in pptChapters" 
            :key="chapter.id"  
            :name="index"
          >
            <template #title>
              <div class="chapter-header">
                <span class="chapter-title">第{{ index + 1 }}章：{{ chapter.title }}</span>
                <el-tag class="chapter-duration-tag" type="info" effect="light">
                  <el-icon class="chapter-duration-icon"><Clock /></el-icon>
                  <span class="chapter-duration-num">{{ chapter.duration }}</span>
                  <span class="chapter-duration-unit">分钟</span>
                </el-tag>
              </div>
            </template>
            <!-- Removed extra button -->
            <div class="chapter-content">
              <el-form :model="chapter" label-width="100px">
                <el-form-item label="章节标题">
                  <el-input v-model="chapter.title" placeholder="请输入章节标题" />
                </el-form-item>
                <el-form-item label="章节内容">
                  <el-input
                    v-model="chapter.content"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入章节内容"
                  />
                </el-form-item>
                <el-form-item label="资源">
                  <div v-if="chapter.graphic && chapter.graphicType.length > 0" class="graphic-preview">
                     <!-- Display tags -->
                    <el-tag
                      v-for="tagType in chapter.graphicType"
                      :key="tagType"
                      :type="getResourceTagInfo(tagType).type"
                      effect="light"
                      round
                      style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                      closable
                      @close="removeGraphic(chapter, tagType)"
                    >
                      <el-icon style="margin-right: 3px;">
                        <component :is="getResourceTagInfo(tagType).icon" />
                      </el-icon>
                      {{ getResourceTagInfo(tagType).label }}
                    </el-tag>
                  </div>
                  <div v-else class="graphic-actions">
                    <!-- This button now opens the dialog -->
                    <el-button type="primary" @click="handleGenerateGraphic(chapter)">
                      <el-icon><Picture /></el-icon>
                      生成资源
                    </el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div v-else>
         <el-empty description="请选择或上传包含教学环节的教案以编辑章节"></el-empty>
      </div>
    </el-card>

    <!-- PPT基本信息卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>PPT基本信息</span>
            <span v-if="isBasicInfoAIGenerated" class="ai-tag">
              <span class="ai-dot"></span>
              AI自动填充
            </span>
          </div>
          <!-- Optional: Add button to clear basic info? -->
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="PPT主题" prop="title">
          <el-input v-model="form.title" placeholder="请输入PPT主题" />
        </el-form-item>
        <el-form-item label="章节/用途" prop="usage">
          <el-input v-model="form.usage" placeholder="如第3章、课程汇报、答辩等" />
        </el-form-item>
        <el-form-item label="教学大纲" prop="syllabus">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleSyllabusFileChange"
            accept=".pdf,.doc,.docx"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.syllabusText"
            type="textarea"
            :rows="3"
            placeholder="或直接粘贴教学大纲文本"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="参考教材" prop="reference">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleReferenceFileChange"
            accept=".pdf,.doc,.docx"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.referenceText"
            type="textarea"
            :rows="2"
            placeholder="可选，输入参考教材信息"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可填写PPT生成的特殊要求、风格等" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" :loading="exporting" @click="handleExport">
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="PPT生成预览" width="60%" destroy-on-close>
      <div class="preview-content">
        <h2>{{ form.title || 'PPT预览' }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="PPT主题">{{ form.title }}</el-descriptions-item>
          <el-descriptions-item label="章节/用途">{{ form.usage }}</el-descriptions-item>
          <el-descriptions-item label="教学大纲">
            <!-- Display file names if files exist -->
            <span v-if="form.syllabusFile.length">
              已上传: {{ form.syllabusFile.map(f => f.name).join(', ') }}
            </span>
            <pre v-else-if="form.syllabusText" class="desc-pre">{{ form.syllabusText }}</pre>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="参考教材">
             <span v-if="form.referenceFile.length">
              已上传: {{ form.referenceFile.map(f => f.name).join(', ') }}
             </span>
            <pre v-else-if="form.referenceText" class="desc-pre">{{ form.referenceText }}</pre>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注"><pre class="desc-pre">{{ form.remark || '无' }}</pre></el-descriptions-item>
        </el-descriptions>
        
        <!-- 章节预览 -->
        <div class="chapters-preview">
          <h3>章节内容</h3>
          <div v-for="(chapter, index) in pptChapters" :key="chapter.id" class="chapter-preview-item">
            <h4>第{{ index + 1 }}章：{{ chapter.title }}</h4>
            <p style="white-space: pre-wrap;">{{ chapter.content }}</p> <!-- Add pre-wrap for content -->
            <!-- Display resource preview in dialog -->
            <div v-if="chapter.graphic" class="graphic-preview" style="margin-top: 10px;">
                 <el-tag
                   v-for="tagType in chapter.graphicType"
                   :key="tagType"
                   :type="getResourceTagInfo(tagType).type"
                   effect="light"
                   size="small"
                   style="margin-right: 5px; display: inline-flex; align-items: center;"
                 >
                   <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(tagType).icon" /></el-icon>
                   {{ getResourceTagInfo(tagType).label }}
                 </el-tag>
             </div>
             <div v-else style="color: #999; font-size: 13px; margin-top: 5px;">(无资源)</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Resource Generation Dialog Implemented within PPT.vue -->
    <el-dialog 
        v-model="graphicDialogVisible" 
        title="生成章节资源" 
        width="60%" 
        destroy-on-close 
        @closed="resetDialogForm" 
    >
        <!-- Add Header with AI Fill button -->
        <template #header>
          <div class="dialog-header">
            <span>生成章节资源</span>
            <el-button 
              class="auto-fill-btn" 
              @click="handleDialogAiFill" 
              :loading="dialogAiFilling" 
              :disabled="!currentChapterForDialog" 
              size="small" 
              title="根据当前章节上下文自动填充下方选项"
            >
              <el-icon><MagicStick /></el-icon>
              AI填充
            </el-button>
          </div>
        </template>
        <!-- End Header -->

        <el-form :model="dialogForm" label-width="120px" v-loading="dialogFormLoading">
            <el-form-item label="资源类型" prop="resourceType">
                <el-radio-group v-model="dialogForm.resourceType">
                    <!-- Use :value instead of value for binding -->
                    <el-radio :value="'image'">图片</el-radio>
                    <el-radio :value="'video'">视频</el-radio>
                </el-radio-group>
            </el-form-item>

            <!-- Image Options -->
            <template v-if="dialogForm.resourceType === 'image'">
                <el-form-item label="图片类型" prop="imageType">
                    <el-select v-model="dialogForm.imageType" placeholder="请选择图片类型" multiple clearable>
                        <el-option label="思维导图" value="思维导图" />
                        <el-option label="概念图" value="概念图" />
                        <el-option label="流程图" value="流程图" />
                        <el-option label="示意图" value="示意图" />
                        <el-option label="数据图表" value="数据图表" />
                        <el-option label="对比图" value="对比图" />
                    </el-select>
                </el-form-item>
                <el-form-item label="图片大小" prop="size">
                    <el-select v-model="dialogForm.size" placeholder="请选择图片大小">
                        <el-option label="小(800x600)" value="800x600" />
                        <el-option label="中(1024x768)" value="1024x768" />
                        <el-option label="大(1920x1080)" value="1920x1080" />
                    </el-select>
                </el-form-item>
                <el-form-item label="风格" prop="imageStyle">
                    <el-select v-model="dialogForm.imageStyle" placeholder="请选择风格" multiple clearable>
                        <el-option label="简约" value="简约" />
                        <el-option label="科技" value="科技" />
                        <el-option label="学术" value="学术" />
                        <el-option label="专业" value="专业" />
                        <el-option label="清晰" value="清晰" />
                        <el-option label="现代" value="现代" />
                         <el-option label="数据驱动" value="数据驱动" />
                         <el-option label="通用" value="通用" />
                    </el-select>
                </el-form-item>
                <el-form-item label="图片描述/需求" prop="imageDesc">
                     <el-input
                        v-model="dialogForm.imageDesc"
                        type="textarea"
                        :rows="3"
                        placeholder="AI将参考此描述生成图片"
                    />
                </el-form-item>
            </template>

            <!-- Video Options -->
            <template v-if="dialogForm.resourceType === 'video'">
                <el-form-item label="视频时长(秒)" prop="videoDuration">
                    <el-input-number v-model="dialogForm.videoDuration" :min="5" :max="300" placeholder="5-300秒" />
                </el-form-item>
                <el-form-item label="画面比例" prop="videoAspectRatio">
                    <el-select v-model="dialogForm.videoAspectRatio" placeholder="请选择画面比例">
                        <el-option label="16:9 (横屏)" value="16:9" />
                        <el-option label="9:16 (竖屏)" value="9:16" />
                        <el-option label="1:1 (方形)" value="1:1" />
                    </el-select>
                </el-form-item>
                <el-form-item label="视频风格" prop="videoStyle">
                    <el-select v-model="dialogForm.videoStyle" placeholder="请选择视频风格" multiple clearable>
                        <el-option label="教学演示" value="教学演示" />
                        <el-option label="动画科普" value="动画科普" />
                        <el-option label="真人出镜(模拟)" value="真人出镜(模拟)" />
                        <el-option label="快速剪辑" value="快速剪辑" />
                    </el-select>
                </el-form-item>
                <el-form-item label="脚本/提示词" prop="videoScript">
                    <el-input
                        v-model="dialogForm.videoScript"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入视频生成的脚本或核心提示词"
                    />
                </el-form-item>
            </template>

            <!-- Common Fields -->
            <el-form-item label="知识点" prop="knowledge">
                <el-select 
                    v-model="dialogForm.knowledge" 
                    multiple 
                    filterable 
                    allow-create 
                    default-first-option
                    clearable
                    placeholder="选择或输入知识点"
                    style="width: 100%"
                >
                    <el-option 
                        v-for="item in machineLearningKnowledgePoints" 
                        :key="item.value" 
                        :label="item.label" 
                        :value="item.value" 
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="自定义要求">
                <el-input 
                    v-model="dialogForm.custom" 
                    type="textarea" 
                    :rows="2" 
                    placeholder="可填写特殊要求、风格等" 
                />
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="graphicDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleGenerateFromDialog" :loading="dialogFormLoading">
                    {{ dialogFormLoading ? '生成中...' : '生成资源' }}
                </el-button>
            </span>
        </template>
    </el-dialog>
    <!-- End of Resource Generation Dialog -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, type FormInstance, type UploadFile, type UploadUserFile, type UploadRawFile, ElLoading } from 'element-plus' // Import ElLoading
import { Search, MagicStick, Picture, Delete, Clock, VideoPlay, Guide, SetUp, DataAnalysis, Collection, FullScreen, Film, VideoCamera, Brush, Rank } from '@element-plus/icons-vue'
import axios from 'axios'

// --- Interfaces ---
interface Stage {
  // Assume stage might have an ID from the source data, add if necessary
  // id?: string; 
  name: string;
  time: number;
  content: string;
}

interface PlanContent {
  title: string;
  usage: string;
  syllabus: string;
  stages: Stage[];
  reference: string;
  remark: string;
  subject?: string;
}

interface HistoryPlan {
  id: string;
  name: string;
  type: string;
  time: string;
  content: PlanContent;
}

interface GraphicRequirements {
  type: string;
  style: string;
  subject: string;
  knowledge: string;
  custom: string;
  isAIGenerated?: boolean;
}

interface Chapter {
  id: string; // Use a unique ID for each chapter
  title: string;
  content: string;
  duration: number;
  graphic: string | null;
  graphicType: string[];
  graphicRequirements: GraphicRequirements;
  // Removed isAIGenerated from here as it was related to handleAutoFillGraphic
}

type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary';

const formRef = ref<FormInstance>()
const previewVisible = ref(false)
const exporting = ref(false)
const form = ref({
  title: '',
  usage: '',
  syllabusFile: [] as UploadRawFile[], // Use correct type
  syllabusText: '',
  referenceFile: [] as UploadRawFile[], // Use correct type
  referenceText: '',
  remark: ''
})

// Add types for validator parameters
const rules = {
  title: [{ required: true, message: '请输入PPT主题', trigger: 'blur' }],
  usage: [{ required: true, message: '请输入章节/用途', trigger: 'blur' }],
  syllabus: [
    { validator: (rule: any, value: any, callback: any) => {
      if (!form.value.syllabusFile.length && !form.value.syllabusText) {
        callback(new Error('请上传教学大纲文件或输入文本'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 教案选择相关
const lessonPlanSource = ref<'history' | 'upload'>('history')
const selectedHistoryPlan = ref('')
const lessonPlanDialogVisible = ref(false)
const historyPlans = ref<HistoryPlan[]>([
  {
    id: 'plan1',
    name: '机器学习线性回归教案',
    type: '教案',
    time: '2025-05-10 15:32:10',
    content: {
      title: '机器学习线性回归',
      usage: '第4章',
      syllabus: '机器学习课程教学大纲', // Example syllabus text or reference
      subject: '计算机科学', // Added subject
      stages: [
        { name: '复习旧知', time: 10, content: '回顾上节课的线性回归基本概念和最小二乘估计原理' },
        { name: '导入新课', time: 15, content: '通过房价预测案例引入线性回归的应用场景' },
        { name: '讲解新知', time: 45, content: '详细讲解梯度下降算法原理和实现' },
        { name: '案例分析', time: 20, content: '通过实际数据集演示线性回归模型的训练过程' },
        { name: '总结提升', time: 10, content: '总结本节课重点，布置课后作业' }
      ],
      reference: '《机器学习实战》',
      remark: '重点讲解梯度下降算法'
    }
  },
  // Add more mock plans if needed
  {
    id: 'plan2', 
    name: 'Python基础语法入门',
    type: '教案',
    time: '2025-05-10 15:32:10',
    content: {
      title: 'Python基础语法入门',
      usage: '第1章',
      syllabus: 'Python课程教学大纲',
      subject: '计算机科学',
      stages: [
        { name: '复习旧知', time: 10, content: '回顾Python基础知识' },
        { name: '导入新课', time: 15, content: '通过实例引入Python编程' },
        { name: '讲解新知', time: 45, content: '详细讲解Python基础语法' },
        { name: '案例分析', time: 20, content: '通过实际项目演示Python编程' },
        { name: '总结提升', time: 10, content: '总结本节课重点，布置课后作业' }
      ],
      reference: '《Python编程从入门到实践》',
      remark: '重点讲解Python基础语法'
    }
  }
])

// PPT章节相关
const activeChapters = ref<number[]>([0]) // Explicitly type as number array
const pptChapters = ref<Chapter[]>([]) // Use Chapter interface
const isAIGenerated = ref(false) // Flag for chapter content generation
const isTyping = ref(false) // Flag for typing effect (if kept)
const batchGeneratingGraphics = ref(false) // Flag for batch graphic generation
const isBasicInfoAIGenerated = ref(false) // Flag for basic info AI fill

// --- Dialog State ---
const graphicDialogVisible = ref(false)
const currentChapterForDialog = ref<Chapter | null>(null) // Store context for dialog
const dialogFormLoading = ref(false) // Loading state for dialog form generation
const dialogAiFilling = ref(false); // Loading state for dialog AI fill button

// Reactive form state for the dialog - remove subject
const dialogForm = reactive({
  resourceType: 'image' as 'image' | 'video',
  knowledge: [] as string[], // Change to string array for multi-select
  custom: '',
  // Image specific
  imageType: [] as string[],
  size: '1024x768' as string,
  customWidth: 800,
  customHeight: 600,
  imageStyle: [] as string[],
  imageDesc: '', // Keep description separate from chapter content
  // Video specific
  videoDuration: 60,
  videoAspectRatio: '16:9',
  videoStyle: [] as string[],
  videoScript: '' // Keep script separate
})

// Helper: Reset dialog form to defaults - remove subject
const resetDialogForm = () => {
    dialogForm.resourceType = 'image';
    dialogForm.knowledge = []; // Reset to empty array
    dialogForm.custom = '';
    dialogForm.imageType = [];
    dialogForm.size = '1024x768';
    dialogForm.customWidth = 800;
    dialogForm.customHeight = 600;
    dialogForm.imageStyle = [];
    dialogForm.imageDesc = '';
    dialogForm.videoDuration = 60;
    dialogForm.videoAspectRatio = '16:9';
    dialogForm.videoStyle = [];
    dialogForm.videoScript = '';
    dialogFormLoading.value = false; // Ensure loading is reset
}

// Define sleep function
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fix return type and typeMap
const getRecordTypeTag = (type: string): TagType | undefined => {
  const typeMap: Record<string, TagType> = {
    '教案': 'success',
    'PPT': 'warning',
    '习题': 'danger',
    '教学大纲': 'info',
    '资源': 'primary'
  }
  return typeMap[type] // Returns undefined if not found
}

// Format date (seems ok)
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Fallback
  }
}

// Search lesson plans (seems ok)
const handleSearchLessonPlans = () => {
  lessonPlanDialogVisible.value = true
}

// Handle history plan change (seems ok, ensure plan.content.stages exists)
const handleHistoryPlanChange = (planId: string) => {
  const plan = historyPlans.value.find(p => p.id === planId)
  if (plan?.content) {
    // AI fill basic info
    form.value.title = `${plan.content.title} (PPT)`
    form.value.usage = plan.content.usage
    form.value.syllabusText = `根据教案 "${plan.name}" 生成的教学大纲要点：\n${plan.content.syllabus || '(无具体文本，请参考源文件)'}`
    form.value.referenceText = plan.content.reference || '无'
    form.value.remark = `AI 生成备注：基于教案 "${plan.name}" 的内容，${plan.content.remark || '无特殊备注'}`
    form.value.syllabusFile = []
    form.value.referenceFile = []
    isBasicInfoAIGenerated.value = true

    // Generate chapters if stages exist
    if (plan.content.stages && plan.content.stages.length > 0) {
    generateChaptersFromStages(plan.content.stages)
        isAIGenerated.value = false // Reset chapter AI generation flag
    ElMessage.success('已根据所选教案自动填充PPT基本信息和章节')
  } else {
        pptChapters.value = [] // Clear chapters if no stages found
        ElMessage.warning('所选教案没有找到教学环节信息，无法自动生成章节')
    }
  } else {
    handleReset() // Reset if plan or content not found
  }
}

// Generate chapters from stages - Add unique ID and type parameters
const generateChaptersFromStages = (stages: Stage[]) => {
  pptChapters.value = stages.map((stage: Stage) => ({
    id: Math.random().toString(36).substring(2, 9), // Simple unique ID
    title: stage.name,
    content: stage.content,
    duration: stage.time,
    graphic: null,
    graphicType: [],
    graphicRequirements: { // Initialize requirements
      type: '', style: '', subject: '', knowledge: '', custom: '' 
    }
  }))
}

// --- File Handlers --- (Corrected signatures and logic)
const handleSyllabusFileChange = (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) => {
  if (uploadFile.raw) {
      form.value.syllabusFile = uploadFiles.map(f => f.raw as UploadRawFile).filter(Boolean); // Store raw files
      form.value.syllabusText = ''
      isBasicInfoAIGenerated.value = false
  }
}

const handleReferenceFileChange = (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) => {
  if (uploadFile.raw) {
      form.value.referenceFile = uploadFiles.map(f => f.raw as UploadRawFile).filter(Boolean); // Store raw files
      form.value.referenceText = ''
      isBasicInfoAIGenerated.value = false
  }
}

const handleLessonPlanFileChange = (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) => {
  if (uploadFile.raw) {
       ElMessage.success('教案文件 ' + uploadFile.name + ' 已选择，待处理...')
      // TODO: Implement logic for handling uploaded lesson plan file
      // e.g., read file, parse, call generateChaptersFromStages
  }
}
// --- End File Handlers ---

// --- Generation Logic ---

// Helper function to get preset resource info based on title
const getPresetResourceInfo = (title: string): { resourceType: string; types: string[]; duration?: number; style?: string[] } => {
    const lowerTitle = title.toLowerCase();
    // Add suggested styles to presets where applicable
    if (lowerTitle.includes('复习') || lowerTitle.includes('总结')) {
      return { resourceType: 'image', types: ['思维导图', '概念图'], style: ['简约', '清晰'] };
    } else if (lowerTitle.includes('导入') || lowerTitle.includes('引入')) {
      return { resourceType: 'video', types: ['动画科普', '快速剪辑'], duration: 45 };
    } else if (lowerTitle.includes('讲解新知') || lowerTitle.includes('梯度下降')) {
      return { resourceType: 'video', types: ['教学演示', '动画科普'], duration: 90 };
    } else if (lowerTitle.includes('讲解') || lowerTitle.includes('讲授')) {
      return { resourceType: 'image', types: ['概念图', '流程图'], style: ['专业', '清晰'] };
    } else if (lowerTitle.includes('案例分析')) {
      return { resourceType: 'image', types: ['数据图表', '示意图'], style: ['专业', '数据驱动'] };
    } else if (lowerTitle.includes('练习')) {
      return { resourceType: 'image', types: ['示意图'], style: ['简洁'] };
    } else if (lowerTitle.includes('互动') || lowerTitle.includes('讨论')) {
      return { resourceType: 'video', types: ['教学演示(模拟)'], duration: 60 };
    } else {
      return { resourceType: 'image', types: ['示意图'], style: ['通用'] }; // Default
    }
}

// Handle auto-generation of chapter content (Fix typo)
const handleAutoGenerateChapters = async () => {
  isTyping.value = true // Correct typo
  try {
    // (Keep existing logic for generating content)
    for (const chapter of pptChapters.value) {
      const name = chapter.title.toLowerCase()
      let customContent = ''
      // ... (logic to set customContent based on name) ...
      if (name.includes('复习') || name.includes('回顾')) {
        customContent = `1. 回顾上节课重点内容\n2. 检查学生掌握情况\n3. 解答学生疑问\n4. 为新课做铺垫`
      } else if (name.includes('导入') || name.includes('引入')) {
        customContent = `1. 通过案例引入新课\n2. 激发学生学习兴趣\n3. 明确本节课学习目标\n4. 建立新旧知识联系`
      } else if (name.includes('讲解') || name.includes('讲授')) {
        customContent = `1. 详细讲解核心概念\n2. 通过实例加深理解\n3. 重点难点突破\n4. 课堂互动问答`
      } else if (name.includes('互动') || name.includes('讨论')) {
        customContent = `1. 组织课堂讨论\n2. 小组合作探究\n3. 展示交流成果\n4. 教师点评总结`
      } else if (name.includes('总结') || name.includes('提升')) {
        customContent = `1. 总结本节课重点\n2. 梳理知识体系\n3. 布置课后作业\n4. 预告下节课内容`
      } else {
        customContent = `1. 明确学习目标\n2. 讲解核心内容\n3. 课堂互动练习\n4. 总结提升`
      }

      chapter.content = customContent
      await sleep(100)
    }
    isAIGenerated.value = true
    ElMessage.success('AI已成功生成所有章节内容')
  } catch (error) {
    console.error("章节内容生成失败:", error)
    ElMessage.error('章节内容生成失败')
  } finally {
    isTyping.value = false // Correct typo
  }
}

// Handle batch generation of graphics (seems mostly ok, check types)
const handleBatchGenerateGraphics = async () => {
  if (!pptChapters.value || pptChapters.value.length === 0) {
    ElMessage.warning('请先选择或生成章节')
    return
  }
  batchGeneratingGraphics.value = true
  try {
    for (const chapter of pptChapters.value) { // chapter is type Chapter
      const resourceInfo = getPresetResourceInfo(chapter.title)
      let graphicUrl = ''
      let descriptiveTags: string[] = [] // Ensure this is string[]

      if (resourceInfo.resourceType === 'video') {
        const styleParam = resourceInfo.types.join('+') || 'Video';
        graphicUrl = `https://via.placeholder.com/150x100/000000/FFFFFF/?text=${styleParam}:${encodeURIComponent(chapter.title)}`
        descriptiveTags = resourceInfo.types.map((t: string) => `视频-${t}${resourceInfo.duration ? ` (${resourceInfo.duration}s)` : ''}`) // Add type for t
        // Add more tags for batch video
        if (resourceInfo.duration) descriptiveTags.push(`时长-${resourceInfo.duration}s`);
        descriptiveTags.push(`比例-16:9`); // Assume default 16:9 for batch
        resourceInfo.types.forEach(style => descriptiveTags.push(`风格-${style}`));
        descriptiveTags.push(`知识点-${chapter.title}`); 
      } else {
        // Assume default size for batch generation
        const size = '1024x768'; 
        const typeParam = resourceInfo.types.join('+') || 'Image';
        graphicUrl = `https://via.placeholder.com/${size}.png?text=${typeParam}:${encodeURIComponent(chapter.title)}`;
        descriptiveTags = resourceInfo.types.map((t: string) => `图片-${t}`) // Add type for t
        // Add more tags for batch image
        descriptiveTags.push(`尺寸-${size}`);
        if (resourceInfo.style && resourceInfo.style.length > 0) {
            resourceInfo.style.forEach(style => descriptiveTags.push(`风格-${style}`));
        }
        descriptiveTags.push(`知识点-${chapter.title}`);
      }
      
      chapter.graphic = graphicUrl // Assign string | null
      chapter.graphicType = descriptiveTags // Assign string[]
      
      await sleep(150) // Use defined sleep
    }
    isAIGenerated.value = true // Consider a different flag like 'graphicsGenerated'
    ElMessage.success('所有章节资源已生成')
  } catch (error) {
    console.error("批量生成资源失败:", error)
    ElMessage.error('批量生成资源失败')
  } finally {
    batchGeneratingGraphics.value = false
  }
}

// Modified to open and pre-fill the dialog
const handleGenerateGraphic = (chapter: Chapter) => {
  currentChapterForDialog.value = chapter; // Store the chapter context
  resetDialogForm(); // Reset form to defaults before pre-filling

  graphicDialogVisible.value = true; // Open the dialog
}

// Function called by the Generate button inside the dialog
const handleGenerateFromDialog = async () => {
  if (!currentChapterForDialog.value) {
      ElMessage.error('无法生成资源，缺少章节上下文');
      return;
  }

  const targetChapterId = currentChapterForDialog.value.id;
  const chapterToUpdate = pptChapters.value.find(c => c.id === targetChapterId);
  if (!chapterToUpdate) {
      ElMessage.error('未在列表中找到要更新的章节');
      return;
  }

  dialogFormLoading.value = true; // Show loading state
  const loadingInstance = ElLoading.service({ 
      target: '.el-dialog__body', // Target dialog body for loading spinner
      text: '正在生成资源...'
  }); 

  try {
      await sleep(1200); // Simulate generation delay

      let graphicUrl = '';
      let descriptiveTags: string[] = [];
      // Use selected knowledge points for encoding
      const knowledgeText = dialogForm.knowledge.join('+') || chapterToUpdate.title; 
      const encodedKnowledge = encodeURIComponent(knowledgeText);

      if (dialogForm.resourceType === 'image') {
          const sizeParam = dialogForm.size === 'custom' ? `${dialogForm.customWidth}x${dialogForm.customHeight}` : dialogForm.size;
          const typeParam = dialogForm.imageType.join('+') || 'Image';
          graphicUrl = `https://via.placeholder.com/${sizeParam}.png?text=${typeParam}:${encodedKnowledge}`;
          descriptiveTags = dialogForm.imageType.map(t => `图片-${t}`);
          if (dialogForm.size !== 'custom') descriptiveTags.push(`尺寸-${dialogForm.size}`);
          if (dialogForm.imageStyle.length > 0) descriptiveTags.push(`风格-${dialogForm.imageStyle.join('+')}`);
          // Add knowledge tags
          dialogForm.knowledge.forEach(k => descriptiveTags.push(`知识点-${k}`)); 
  } else {
          const styleParam = dialogForm.videoStyle.join('+') || 'Video';
          graphicUrl = `https://via.placeholder.com/150x100/000000/FFFFFF/?text=${styleParam}:${encodedKnowledge}`;
          descriptiveTags = dialogForm.videoStyle.map(t => `视频-${t}`);
          descriptiveTags.push(`时长-${dialogForm.videoDuration}s`);
          descriptiveTags.push(`比例-${dialogForm.videoAspectRatio}`);
          // Add knowledge tags
          dialogForm.knowledge.forEach(k => descriptiveTags.push(`知识点-${k}`)); 
      }

      // Update the actual chapter in the list
      chapterToUpdate.graphic = graphicUrl;
      chapterToUpdate.graphicType = descriptiveTags;

      ElMessage.success(`章节 "${chapterToUpdate.title}" 资源已根据选项生成`);
      graphicDialogVisible.value = false; // Close dialog on success

  } catch (error) {
      console.error("资源生成失败（对话框内）:", error);
      ElMessage.error('资源生成失败');
  } finally {
      dialogFormLoading.value = false;
      loadingInstance.close(); // Close loading spinner
  }
}

const removeGraphic = (chapter: Chapter, tagTypeToRemove: string) => {
  const chapterToUpdate = pptChapters.value.find(c => c.id === chapter.id);
   if (!chapterToUpdate) return;

  const index = chapterToUpdate.graphicType.indexOf(tagTypeToRemove)
  if (index > -1) {
    chapterToUpdate.graphicType.splice(index, 1)
  }
  // If all tags removed, clear the graphic URL too
  if (chapterToUpdate.graphicType.length === 0) {
    chapterToUpdate.graphic = null;
    ElMessage.success('资源已删除');
  } else {
    ElMessage.success(`标签 "${tagTypeToRemove}" 已删除`);
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    // TODO: Implement actual save logic (e.g., send data to backend)
    console.log("Form Data:", form.value);
    console.log("Chapters Data:", pptChapters.value);
    ElMessage.success('保存成功');
  } catch (e) {
    console.error("Save failed:", e);
    ElMessage.error('保存失败，请检查表单信息');
  }
}

const handlePreview = () => {
  // Optional: Validate before preview?
  previewVisible.value = true
}

const handleExport = async () => {
  exporting.value = true
  try {
    // Simulate export
    await sleep(1500); 
    // In a real scenario, you'd generate the PPT file (server-side or client-side)
    // and trigger a download.
    ElMessage.success('导出成功'); 
  } catch (e) {
    console.error("Export failed:", e);
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields(); // Reset fields defined in rules
  }
  // Manually reset other form fields and state
  form.value = {
    title: '', usage: '',
    syllabusFile: [], syllabusText: '',
    referenceFile: [], referenceText: '',
    remark: ''
  };
  selectedHistoryPlan.value = '';
  pptChapters.value = [];
  isAIGenerated.value = false;
  isBasicInfoAIGenerated.value = false;
}

// --- Add AI Fill Handler for Dialog ---
const handleDialogAiFill = async () => {
  if (!currentChapterForDialog.value) {
    ElMessage.warning('缺少章节上下文，无法进行AI填充');
    return;
  }

  dialogAiFilling.value = true;
  const chapter = currentChapterForDialog.value; // Get the current chapter

  try {
    // Get preset based on chapter title
    const preset = getPresetResourceInfo(chapter.title);
    console.log(`[Dialog AI Fill] Using preset for: ${chapter.title}`, preset);

    // Set knowledge based on content or title
    const chapterContentSummary = chapter.content?.split('\n')[0]?.substring(0, 50) || chapter.title;

    console.log('[Dialog AI Fill Debug] Chapter Content Summary:', chapterContentSummary);

    // Attempt to find matching keywords or use the summary directly
    let foundKnowledge = machineLearningKnowledgePoints.value
                          .filter(kp => {
                              const included = chapterContentSummary.toLowerCase().includes(kp.value.toLowerCase());
                              if (included) {
                                  console.log(`[Dialog AI Fill Debug] Found match: '${kp.value}' in summary.`);
                              }
                              return included;
                          })
                          .map(kp => kp.value);
      
    if (foundKnowledge.length === 0) {
        console.log('[Dialog AI Fill Debug] No predefined match found. Using summary as custom knowledge point.');
        dialogForm.knowledge = [chapterContentSummary]; 
    } else {
        console.log('[Dialog AI Fill Debug] Found predefined knowledge points:', foundKnowledge);
        dialogForm.knowledge = foundKnowledge; // Select matched predefined knowledge points
    }

    console.log('[Dialog AI Fill Debug] Final dialogForm.knowledge:', JSON.parse(JSON.stringify(dialogForm.knowledge))); // Log the final value

    dialogForm.resourceType = preset.resourceType as 'image' | 'video';

    if (preset.resourceType === 'image') {
      dialogForm.imageType = preset.types ? [...preset.types] : [];
      dialogForm.imageStyle = preset.style ? [...preset.style] : [];
      // Generate a description based on preset and context
      dialogForm.imageDesc = `为知识点 "${dialogForm.knowledge.join(', ')}" 生成相关的${preset.types?.join('或') || '图片'}，风格偏向${preset.style?.join('、') || '通用'}。`;
      // Reset video fields if switching from video
      dialogForm.videoDuration = 60;
      dialogForm.videoAspectRatio = '16:9';
      dialogForm.videoStyle = [];
      dialogForm.videoScript = '';
      // Set a default size if not provided by preset (or handle it in getPresetResourceInfo)
      dialogForm.size = (preset as any).size || '1024x768'; 
    } else { // resourceType is 'video'
      dialogForm.videoStyle = preset.types ? [...preset.types] : [];
      dialogForm.videoDuration = preset.duration || 60;
      dialogForm.videoAspectRatio = (preset as any).videoAspectRatio || '16:9'; // Add default if needed
      // Generate a script prompt based on preset and context
      dialogForm.videoScript = `制作一个关于 "${dialogForm.knowledge.join(', ')}" 的教学${preset.types?.join('或') || '视频'}，时长约${preset.duration || 60}秒。`;
      // Reset image fields if switching from image
      dialogForm.imageType = [];
      dialogForm.size = '1024x768';
      dialogForm.imageStyle = [];
      dialogForm.imageDesc = '';
    }
    // Apply custom requirements if available in chapter context (optional)
    dialogForm.custom = chapter.graphicRequirements?.custom || '';

    // Simulate AI thinking
    await sleep(300); 
    ElMessage.success('AI已填充生成选项');

  } catch (error) {
    console.error("对话框AI填充失败:", error);
    ElMessage.error('AI填充选项时出错');
  } finally {
    dialogAiFilling.value = false;
  }
};

// --- Predefined Knowledge Points for Machine Learning ---
const machineLearningKnowledgePoints = ref([
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

// --- New Helper Function for Resource Tag Info ---
const getResourceTagInfo = (tagString: string): { icon: any; type: TagType | 'primary'; label: string } => {
  let icon: any = Document; // Default icon
  let type: TagType | 'primary' = 'danger'; // Default type (changed from primary to danger)
  let label = tagString; // Default label

  if (tagString.startsWith('图片-')) {
    type = 'success';
    label = tagString.substring(3);
    if (label.includes('思维导图') || label.includes('概念图')) icon = Guide;
    else if (label.includes('流程图')) icon = SetUp;
    else if (label.includes('数据图表') || label.includes('对比图')) icon = DataAnalysis;
    else icon = Picture;
  } else if (tagString.startsWith('视频-')) {
    type = 'warning';
    label = tagString.substring(3);
    if (label.includes('动画') || label.includes('剪辑')) icon = Film;
    else if (label.includes('演示') || label.includes('出镜')) icon = VideoCamera;
    else icon = VideoPlay;
    // Keep duration in label if present
    // label remains as extracted
  } else if (tagString.startsWith('知识点-')) {
    type = 'primary';
    label = tagString.substring(4);
    icon = Collection;
  } else if (tagString.startsWith('尺寸-')) {
    type = 'danger'; // Changed from primary
    label = tagString.substring(3);
    icon = Rank;
  } else if (tagString.startsWith('风格-')) {
    type = 'warning'; // Changed from success
    label = tagString.substring(3);
    icon = Brush;
  } else if (tagString.startsWith('时长-')) {
    type = 'primary'; // Changed from warning
    label = tagString.substring(3);
    icon = Clock;
  } else if (tagString.startsWith('比例-')) {
    type = 'success'; // Changed from primary
    label = tagString.substring(3);
    icon = FullScreen;
  }

  return { icon, type, label };
}

</script>

<style scoped>
.pptgen-container {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lesson-plan-selection {
  padding: 10px 0;
}
.source-selector {
  margin-bottom: 16px;
}
.history-section {
  margin-bottom: 16px;
}
.wide-select {
  width: 100%;
}
.history-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name-tag-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.type-tag {
  margin-left: 0;
}
.option-time {
  color: #909399;
  font-size: 12px;
}
.upload-section {
  margin-bottom: 16px;
}
.chapters-container {
  margin-top: 16px;
}
.chapter-content {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
.graphic-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.graphic-image-preview { /* Style for preview in chapter edit */
  max-width: 100px; 
  max-height: 75px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-left: 10px; 
}
.chapter-graphic { /* Style for preview in dialog */
    max-width: 200px; /* Larger preview in dialog */
    max-height: 150px;
    object-fit: contain;
    border: 1px solid #eee;
  border-radius: 4px;
    margin-left: 10px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
.preview-content {
  padding: 20px;
}
.preview-content h2 {
  text-align: center;
  margin-bottom: 24px;
}
.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}
.upload-demo {
  margin-bottom: 8px;
}
.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chapter-title {
  font-size: 16px;
  font-weight: 500;
}

.chapter-duration-tag {
  background: #f0f6ff;
  color: #409eff;
  border: none;
  border-radius: 16px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.chapter-duration-icon {
  font-size: 16px;
}

.chapter-duration-num {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.chapter-duration-unit {
  font-size: 12px;
  font-weight: 500;
  margin: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-tag {
  margin-left: 8px;
  font-size: 14px;
  height: 20px;
  line-height: 20px;
  color: #67c23a;
  display: flex;
  align-items: center;
}

.ai-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #67c23a;
  border-radius: 50%;
  margin-right: 4px;
}

.graphic-actions {
  display: flex;
  gap: 12px;
}

.auto-fill-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.auto-fill-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #67c23a, #409eff);
}

.auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 16px;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

.typing-effect {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 0.5s steps(40, end);
}

/* Style for the dialog header */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header .auto-fill-btn {
  /* Inherit or copy styles from .auto-fill-btn */
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 6px 12px; /* Adjust padding for size */
}

.dialog-header .auto-fill-btn:hover:not(.is-disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #67c23a, #409eff);
}

.dialog-header .auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 16px; /* Adjust icon size */
}
</style>
