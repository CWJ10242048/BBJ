<template>
  <div class="graphicgen-container">
    <h2>资源生成</h2>

    <!-- Always show lesson plan selection -->
    <el-card class="box-card"> 
      <el-form label-width="120px">
        <el-form-item label="历史教案">
          <el-select v-model="selectedPlanId" placeholder="选择历史教案" filterable @change="handlePlanChange" style="width: 100%">
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
        </el-form-item>

        <el-form-item label="选择教学环节" v-if="selectedPlanId && stageOptions.length > 0">
          <el-select v-model="selectedStageId" placeholder="选择教学环节" @change="handleStageChange" style="width: 100%">
            <el-option
              v-for="stage in stageOptions"
              :key="stage.id"
              :label="stage.name" 
              :value="stage.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Resource generation options card -->
    <!-- Render only when a stage is selected -->
    <el-card class="box-card" v-if="selectedStageId"> 
      <template #header>
        <div class="card-header">
          <span>资源生成选项</span>
          <!-- AI Fill button always available when stage is selected -->
          <el-button 
            class="auto-fill-btn"
            @click="handleAiFillOptions"
            :loading="isAiFilling"
            :disabled="!selectedStageId"  
            title="根据选择的教学环节自动填充下方选项"
          >
            <el-icon><MagicStick /></el-icon>
            AI填充
          </el-button>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="资源类型" prop="resourceType">
          <el-radio-group v-model="form.resourceType">
            <el-radio label="image">图片</el-radio>
            <el-radio label="video">视频</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.resourceType === 'image'">
          <el-form-item label="图片类型" prop="imageType">
            <el-select v-model="form.imageType" placeholder="请选择图片类型" :class="{ 'typing-effect': isTyping }" multiple>
            <el-option label="思维导图" value="思维导图" />
            <el-option label="概念图" value="概念图" />
            <el-option label="流程图" value="流程图" />
            <el-option label="示意图" value="示意图" />
            <el-option label="数据图表" value="数据图表" />
            <el-option label="对比图" value="对比图" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片大小" prop="size">
          <el-select v-model="form.size" placeholder="请选择图片大小" @change="handleSizeChange" :class="{ 'typing-effect': isTyping }">
            <el-option label="小(800x600)" value="800x600" />
            <el-option label="中(1024x768)" value="1024x768" />
            <el-option label="大(1920x1080)" value="1920x1080" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <template v-if="form.size==='custom'">
            <el-input-number v-model="form.customWidth" :min="100" :max="4096" placeholder="宽(px)" style="width: 100px; margin-left: 8px" />
            <span style="margin: 0 4px">x</span>
            <el-input-number v-model="form.customHeight" :min="100" :max="4096" placeholder="高(px)" style="width: 100px" />
          </template>
        </el-form-item>
          <el-form-item label="风格" prop="imageStyle">
            <el-select v-model="form.imageStyle" placeholder="请选择风格" :class="{ 'typing-effect': isTyping }" multiple>
            <el-option label="简约" value="简约" />
            <el-option label="科技" value="科技" />
            <el-option label="学术" value="学术" />
            <el-option label="专业" value="专业" />
            <el-option label="清晰" value="清晰" />
            <el-option label="现代" value="现代" />
          </el-select>
        </el-form-item>
        <el-form-item label="参考图片文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileChange"
            accept=".jpg,.jpeg,.png,.svg,.bmp,.gif,.webp"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
          <el-input
            v-model="form.imageDesc"
            type="textarea"
            :rows="4"
            placeholder="或输入图片描述文本"
            style="margin-top: 8px"
            :class="{ 'typing-effect': isTyping }"
          />
          </el-form-item>
        </template>

        <template v-if="form.resourceType === 'video'">
           <el-form-item label="视频时长(秒)" prop="videoDuration">
             <el-input-number v-model="form.videoDuration" :min="5" :max="300" placeholder="5-300秒" />
           </el-form-item>
           <el-form-item label="画面比例" prop="videoAspectRatio">
             <el-select v-model="form.videoAspectRatio" placeholder="请选择画面比例">
               <el-option label="16:9 (横屏)" value="16:9" />
               <el-option label="9:16 (竖屏)" value="9:16" />
               <el-option label="1:1 (方形)" value="1:1" />
             </el-select>
           </el-form-item>
           <el-form-item label="视频风格" prop="videoStyle">
             <el-select v-model="form.videoStyle" placeholder="请选择视频风格" multiple>
               <el-option label="教学演示" value="教学演示" />
               <el-option label="动画科普" value="动画科普" />
               <el-option label="真人出镜(模拟)" value="真人出镜" />
               <el-option label="快速剪辑" value="快速剪辑" />
             </el-select>
           </el-form-item>
           <el-form-item label="脚本/提示词" prop="videoScript">
             <el-input
               v-model="form.videoScript"
               type="textarea"
               :rows="4"
               placeholder="请输入视频生成的脚本或核心提示词"
             />
           </el-form-item>
        </template>

        <el-form-item label="适用学科" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入适用学科" :class="{ 'typing-effect': isTyping }" />
        </el-form-item>
        <el-form-item label="知识点" prop="knowledge">
          <el-select 
            v-model="form.knowledge" 
            multiple 
            filterable 
            allow-create 
            default-first-option
            clearable
            placeholder="选择或输入知识点"
            style="width: 100%"
            :class="{ 'typing-effect': isTyping }"
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
            v-model="form.custom" 
            type="textarea" 
            :rows="2" 
            placeholder="可填写特殊要求、风格等" 
            :class="{ 'typing-effect': isTyping }"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Buttons and Preview Dialog -->
    <!-- Render only when a stage is selected -->
     <template v-if="selectedStageId"> 
        <div class="button-group">
           <el-button 
             type="primary" 
             @click="handleSave"
             :disabled="!selectedStageId" 
             title="请先选择教学环节并填写必要信息"
           >生成</el-button> 
           <el-button type="success" @click="handlePreview">预览</el-button>
           <el-button type="warning" :loading="exporting" @click="handleExport">导出</el-button>
           <el-button @click="handleReset">重置</el-button>
        </div>
        <el-dialog v-model="previewVisible" title="资源生成预览" width="60%" destroy-on-close>
           <div class="preview-content">
             <h2>生成配置预览 ({{ form.resourceType === 'image' ? '图片' : '视频' }})</h2>
             <el-descriptions :column="1" border>
               <el-descriptions-item label="资源类型">
                 <el-tag :type="form.resourceType === 'image' ? 'success' : 'warning'" size="small" round>
                   <el-icon style="margin-right: 3px;">
                     <component :is="form.resourceType === 'image' ? Picture : VideoPlay" />
                   </el-icon>
                   {{ form.resourceType === 'image' ? '图片' : '视频' }}
                 </el-tag>
               </el-descriptions-item>
               <el-descriptions-item label="适用学科">
                 <el-tag type="info" size="small" round v-if="form.subject">{{ form.subject }}</el-tag>
                 <span v-else>未指定</span>
               </el-descriptions-item>
               <el-descriptions-item label="知识点">
                 <el-tag
                   v-for="knowledgeTag in form.knowledge"
                   :key="knowledgeTag"
                   :type="getResourceTagInfo(`知识点-${knowledgeTag}`, form.resourceType).type"
                   size="small"
                   round
                   style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                 >
                   <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`知识点-${knowledgeTag}`, form.resourceType).icon" /></el-icon>
                   {{ getResourceTagInfo(`知识点-${knowledgeTag}`, form.resourceType).label }}
                 </el-tag>
                 <span v-if="!form.knowledge || form.knowledge.length === 0">未指定</span>
               </el-descriptions-item>

               <template v-if="form.resourceType === 'image'">
                 <el-descriptions-item label="图片类型">
                   <el-tag
                     v-for="typeTag in form.imageType"
                     :key="typeTag"
                     :type="getResourceTagInfo(`图片类型-${typeTag}`, 'image').type"
                     size="small"
                     round
                     style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                   >
                     <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`图片类型-${typeTag}`, 'image').icon" /></el-icon>
                     {{ getResourceTagInfo(`图片类型-${typeTag}`, 'image').label }}
                   </el-tag>
                   <span v-if="!form.imageType || form.imageType.length === 0">未指定</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="图片大小">
                   <el-tag
                     v-if="sizeText"
                     :type="getResourceTagInfo(`尺寸-${sizeText}`, 'image').type"
                     size="small"
                     round
                     style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                   >
                     <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`尺寸-${sizeText}`, 'image').icon" /></el-icon>
                     {{ getResourceTagInfo(`尺寸-${sizeText}`, 'image').label }}
                   </el-tag>
                   <span v-else>未指定</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="风格">
                   <el-tag
                     v-for="styleTag in form.imageStyle"
                     :key="styleTag"
                     :type="getResourceTagInfo(`风格-${styleTag}`, 'image').type"
                     size="small"
                     round
                     style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                   >
                     <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`风格-${styleTag}`, 'image').icon" /></el-icon>
                     {{ getResourceTagInfo(`风格-${styleTag}`, 'image').label }}
                   </el-tag>
                   <span v-if="!form.imageStyle || form.imageStyle.length === 0">未指定</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="图片描述/需求"><pre class="desc-pre">{{ form.imageDesc || '无' }}</pre></el-descriptions-item>
               </template>

               <template v-if="form.resourceType === 'video'">
                  <el-descriptions-item label="视频时长">
                    <el-tag
                      v-if="form.videoDuration"
                      :type="getResourceTagInfo(`时长-${form.videoDuration}`, 'video').type"
                      size="small"
                      round
                      style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                    >
                      <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`时长-${form.videoDuration}`, 'video').icon" /></el-icon>
                      {{ getResourceTagInfo(`时长-${form.videoDuration}`, 'video').label }}
                    </el-tag>
                    <span v-else>未指定</span>
                  </el-descriptions-item>
                 <el-descriptions-item label="画面比例">
                   <el-tag
                     v-if="form.videoAspectRatio"
                     :type="getResourceTagInfo(`比例-${form.videoAspectRatio}`, 'video').type"
                     size="small"
                     round
                     style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                   >
                     <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`比例-${form.videoAspectRatio}`, 'video').icon" /></el-icon>
                     {{ getResourceTagInfo(`比例-${form.videoAspectRatio}`, 'video').label }}
                   </el-tag>
                   <span v-else>未指定</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="视频风格">
                   <el-tag
                     v-for="styleTag in form.videoStyle"
                     :key="styleTag"
                     :type="getResourceTagInfo(`视频风格-${styleTag}`, 'video').type"
                     size="small"
                     round
                     style="margin-right: 5px; margin-bottom: 5px; display: inline-flex; align-items: center;"
                   >
                     <el-icon style="margin-right: 3px;"><component :is="getResourceTagInfo(`视频风格-${styleTag}`, 'video').icon" /></el-icon>
                     {{ getResourceTagInfo(`视频风格-${styleTag}`, 'video').label }}
                   </el-tag>
                   <span v-if="!form.videoStyle || form.videoStyle.length === 0">未指定</span>
                 </el-descriptions-item>
                 <el-descriptions-item label="脚本/提示词"><pre class="desc-pre">{{ form.videoScript || '无' }}</pre></el-descriptions-item>
               </template>

               <el-descriptions-item label="自定义要求"><pre class="desc-pre">{{ form.custom || '无' }}</pre></el-descriptions-item>
             </el-descriptions>
           </div>
        </el-dialog>
     </template>

    <!-- 显示生成的题目 -->
    <template v-if="generatedQuestions && generatedQuestions.length > 0">
      <el-card class="generated-questions-card" style="margin-top: 20px;">
         <template #header>
           <div class="card-header">
             <span>生成的题目预览</span>
             <!-- 可以加一些操作按钮，比如重新生成 -->
           </div>
         </template>
         <!-- 简单渲染题目列表 -->
         <div v-for="q in generatedQuestions" :key="q.id" class="question-item">
           <p><strong>[{{ q.type }}]</strong> {{ q.stem }}</p>
           <div v-if="q.options">
             <ul>
               <li v-for="(opt, index) in q.options" :key="index">{{ opt }}</li>
             </ul>
           </div>
           <p v-if="q.answer"><strong>答案:</strong> {{ q.answer }}</p>
           <p v-if="q.analysis && form.explain"><strong>解析:</strong> {{ q.analysis }}</p>
           <el-divider />
         </div>
         <!-- 或者使用专门的组件 <GeneratedQuestionsDisplay :questions="generatedQuestions" /> -->
      </el-card>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits, onMounted, nextTick } from 'vue'
import { ElMessage, type UploadUserFile, type UploadFile, type FormInstance, type FormItemRule, type UploadProps, type FormRules } from 'element-plus'
import axios from 'axios'
import { 
  MagicStick, Picture, VideoPlay, 
  // Import necessary icons from PPT.vue
  Clock, Film, VideoCamera, Guide, SetUp, DataAnalysis, Collection, FullScreen, Brush, Rank, Document 
} from '@element-plus/icons-vue'
import GeneratedQuestionsDisplay from './GeneratedQuestionsDisplay.vue'; // 假设我们创建一个新组件来显示

// Define emit function (generate might not be needed if standalone only, but keep for now)
const emit = defineEmits(['generate', 'cancel'])

// --- Interfaces ---
interface Stage {
  id: string;
  name: string;
  time: number;
  desc: string;
}

interface PlanContent {
  title: string;
  usage: string;
  syllabus: string;
  subject: string;
  stages: Stage[];
  reference: string;
  remark: string;
}

interface HistoryPlan {
  id: string;
  name: string;
  type: string;
  time: string;
  content: PlanContent;
}

interface FormState {
  resourceType: 'image' | 'video';
  subject: string;
  knowledge: string[];
  custom: string;
  imageType: string[];
  size: string;
  customWidth: number;
  customHeight: number;
  imageStyle: string[];
  imageFile: UploadUserFile[];
  imageDesc: string;
  videoDuration: number;
  videoAspectRatio: string;
  videoStyle: string[];
  videoScript: string;
}

type TagType = 'success' | 'info' | 'warning' | 'danger' | 'primary';

// Refs
const formRef = ref<FormInstance>()
const previewVisible = ref(false)
const exporting = ref(false)
const isAiFilling = ref(false)
const isTyping = ref(false);
const generatedQuestions = ref<any[] | null>(null); // 用于存储生成的题目数据

// --- Teaching content selection state ---
const historyPlans = ref<HistoryPlan[]>([
  {
    id: 'plan1',
    name: '机器学习线性回归教案',
    type: '教案',
    time: '2025-05-10 15:32:10',
    content: {
      title: '机器学习线性回归',
      usage: '第4章',
      syllabus: '机器学习课程教学大纲',
      subject: '计算机科学',
      stages: [
        { id: 'stage1', name: '复习旧知', time: 10, desc: '回顾上节课概念: 线性模型, 假设函数 h(x) = θ₀ + θ₁x' },
        { id: 'stage2', name: '导入新课', time: 15, desc: '通过房价预测案例(面积 vs 价格)引入线性回归问题' },
        { id: 'stage3', name: '讲解新知 - 梯度下降', time: 45, desc: '详细讲解梯度下降算法原理, 包括代价函数 J(θ), 梯度 ∂J/∂θ, 学习率 α, 迭代更新规则 θ := θ - α * ∇J' },
        { id: 'stage4', name: '案例分析', time: 20, desc: '使用 Python 和示例数据集演示模型训练与可视化' },
        { id: 'stage5', name: '总结提升', time: 10, desc: '总结梯度下降要点, 讨论学习率选择, 布置相关练习题' }
      ],
      reference: '《机器学习实战》',
      remark: '重点讲解梯度下降算法'
    }
  },
  // ... more plans
]);

const selectedPlanId = ref<string>('')
const selectedPlanStructure = ref<PlanContent | null>(null)
const selectedStageId = ref<string>('')

// --- Computed: Stage options ---
const stageOptions = computed(() => {
  return selectedPlanStructure.value?.stages || []
})

// --- Form state and rules ---
const form = ref<FormState>({
  resourceType: 'image',
  subject: '',
  knowledge: [],
  custom: '',
  
  imageType: [],
  size: '1024x768',
  customWidth: 800,
  customHeight: 600,
  imageStyle: [],
  imageFile: [],
  imageDesc: '',
  
  videoDuration: 60,
  videoAspectRatio: '16:9',
  videoStyle: [],
  videoScript: ''
})

const rules = computed((): FormRules => ({
  resourceType: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  subject: [{ required: true, message: '请选择教案以填充学科', trigger: 'change' }],
  knowledge: [{ required: true, type: 'array', message: '请选择或输入知识点', trigger: 'change' }],
  imageType: [{ required: form.value.resourceType === 'image', message: '请选择图片类型', trigger: 'change' }],
  size: [{ required: form.value.resourceType === 'image', message: '请选择图片大小', trigger: 'change' }],
  imageStyle: [{ required: form.value.resourceType === 'image', message: '请选择风格', trigger: 'change' }],
  videoDuration: [{ required: form.value.resourceType === 'video', message: '请输入视频时长', trigger: 'blur', type: 'number' }],
  videoAspectRatio: [{ required: form.value.resourceType === 'video', message: '请选择画面比例', trigger: 'change' }],
  videoStyle: [{ required: form.value.resourceType === 'video', message: '请选择视频风格', trigger: 'change' }],
  videoScript: [{ required: form.value.resourceType === 'video', message: '请输入脚本/提示词', trigger: 'blur' }],
}))

// --- Lifecycle ---
onMounted(() => {
  console.log("[Graphic.vue] Mounted.");
  // fetchHistoryPlans(); // No need to call this if using static data above
});

// --- Add helper functions from PPT.vue ---
const getRecordTypeTag = (type: string): TagType | undefined => {
  const typeMap: Record<string, TagType> = {
    '教案': 'success',
    'PPT': 'warning',
    '习题': 'danger',
    '教学大纲': 'info',
    '资源': 'primary'
  }
  return typeMap[type]
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''; // Handle cases where time might be missing
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original string if formatting fails
  }
}

// --- Standalone mode functions (Keep these) ---

// Fetch History Plans (Can be removed or kept for future API integration)
// const fetchHistoryPlans = async () => { ... }

// Handle Plan Change (Keep this)
const handlePlanChange = (planId: string | number) => {
  selectedStageId.value = '';
  form.value.knowledge = [];
  form.value.imageDesc = '';
  form.value.videoScript = '';

  const selectedPlan = historyPlans.value.find(p => p.id === planId);
  if (selectedPlan) {
    selectedPlanStructure.value = selectedPlan.content; 
    form.value.subject = selectedPlan.content?.subject || '';
  } else {
    selectedPlanStructure.value = null;
    form.value.subject = '';
  }
}

// Handle Stage Change (Keep this)
const handleStageChange = (stageId: string | number) => {
  const stage = selectedPlanStructure.value?.stages.find((s: Stage) => s.id === stageId);
  
  if (stage) {
    form.value.knowledge = [stage.name];
  } else {
    form.value.knowledge = [];
    form.value.imageDesc = '';
    form.value.videoScript = '';
  }
}

// Common functions
const sizeText = computed(() => {
  if (form.value.size === 'custom') {
    return `${form.value.customWidth}x${form.value.customHeight}`
  }
  if (form.value.size) return form.value.size
  return ''
})
const handleSizeChange = (val: string) => {
  if (val !== 'custom') {
    form.value.customWidth = 800
    form.value.customHeight = 600
  }
}
const handleFileChange: UploadProps['onChange'] = (uploadFile: UploadFile, uploadFiles: UploadUserFile[]) => {
  form.value.imageFile = uploadFiles;
}
const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const resourceType = form.value.resourceType
    let apiUrl = ''
    let payload = {}
    let resultUrl = ''
    let details = {}

    if (resourceType === 'image') {
      apiUrl = '/api/generate/image'
      payload = {
        types: form.value.imageType,
        size: form.value.size === 'custom' ? `${form.value.customWidth}x${form.value.customHeight}` : form.value.size,
        styles: form.value.imageStyle,
        subject: form.value.subject,
        knowledge: form.value.knowledge,
        imageDesc: form.value.imageDesc,
        custom: form.value.custom,
      };
      await new Promise(resolve => setTimeout(resolve, 1000));
      resultUrl = `https://via.placeholder.com/400x300.png?text=Image:${encodeURIComponent(form.value.knowledge.join('+'))}`;
      details = { 
        imageTypes: form.value.imageType,
        knowledge: form.value.knowledge,
        imageStyle: form.value.imageStyle,
        size: sizeText.value
      };
      ElMessage.success('图片生成成功');

    } else if (resourceType === 'video') {
      apiUrl = '/api/generate/video'
       payload = {
         duration: form.value.videoDuration,
         aspectRatio: form.value.videoAspectRatio,
         styles: form.value.videoStyle,
         script: form.value.videoScript,
         subject: form.value.subject,
         knowledge: form.value.knowledge,
         custom: form.value.custom,
       };
      await new Promise(resolve => setTimeout(resolve, 2000));
      resultUrl = `https://via.placeholder.com/320x180.png/000000/FFFFFF/?text=Video:${encodeURIComponent(form.value.knowledge.join('+'))}`;
      details = { 
        duration: form.value.videoDuration,
        script: form.value.videoScript, 
        knowledge: form.value.knowledge,
        videoStyle: form.value.videoStyle,
        videoAspectRatio: form.value.videoAspectRatio
      };
      ElMessage.success('视频生成成功');
    }

    emit('generate', { 
      resourceType: resourceType,
      url: resultUrl, 
      details: details
    })

  } catch (e) {
    if (e instanceof Error) {
       console.error("资源生成或表单验证失败:", e)
       ElMessage.error('资源生成失败，请检查表单或联系管理员')
    } else {
       console.log("表单校验未通过", e)
    }
  }
}
const handlePreview = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate().catch((err: any) => {
      console.warn('预览前表单校验未通过:', err)
      ElMessage.warning('表单部分内容不符合要求，仅预览当前已填写信息')
    })
    previewVisible.value = true;
  } catch(e) {
    previewVisible.value = true; 
  }
}
const handleExport = async () => {
  exporting.value = true
  try {
    let exportUrl = '/api/export/graphic';
    let downloadName = 'generated_image.jpg';
    if (form.value.resourceType === 'video') {
      exportUrl = '/api/export/video';
      downloadName = 'generated_video.mp4';
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('模拟导出成功');

  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}
const handleReset = () => {
  // 重置教学内容选择
  selectedPlanId.value = '';
  selectedPlanStructure.value = null;
  selectedStageId.value = '';

  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields(); // 重置 rules 中定义的字段
  }
  // 手动重置其他字段和默认值
  form.value = {
    resourceType: 'image',
    subject: '',
    knowledge: [],
    custom: '',
    imageType: [],
    size: '1024x768',
    customWidth: 800,
    customHeight: 600,
    imageStyle: [],
    imageFile: [],
    imageDesc: '',
    videoDuration: 60,
    videoAspectRatio: '16:9',
    videoStyle: [],
    videoScript: ''
  };
  // 清除可能残留的文件列表等
  generatedQuestions.value = null; // 清空生成的题目
}

// --- AI Fill Handler (Strictly mimicking PPT.vue logic) ---
const handleAiFillOptions = async () => {
  if (!selectedStageId.value || !selectedPlanStructure.value) {
    ElMessage.warning('请先选择一个教学环节');
    return;
  }

  isAiFilling.value = true;
  const stage = selectedPlanStructure.value.stages.find(s => s.id === selectedStageId.value);

  if (!stage) {
      ElMessage.error('未能找到选定的环节信息');
      isAiFilling.value = false;
      return;
  }

  console.log(`[AI Fill Debug - PPT Strict Mimic] Started for stage: ${stage.name}. isAiFilling: ${isAiFilling.value}`);

  try {
    // Use the getPresetResourceInfo function (copied from PPT.vue)
    const preset = getPresetResourceInfo(stage.name);
    console.log(`[AI Fill Debug - PPT Strict Mimic] Using preset from getPresetResourceInfo for: ${stage.name}`, preset);

    // --- Apply Preset to form.value (Mimicking PPT.vue dialogForm) ---
    // Set Subject first
    form.value.subject = '机器学习'; // Force subject as requested previously
    console.log(`[AI Fill Debug - PPT Strict Mimic] Assigned Subject: ${form.value.subject}`);

    // --- Knowledge Point Assignment (Strictly mimicking PPT.vue) ---
    const stageContext = stage.desc || stage.name; // Use description first, then name
    console.log(`[AI Fill Debug - PPT Strict Mimic] Context for Knowledge (desc || name): '${stageContext}'`);

    let foundKnowledge = machineLearningKnowledgePoints.value
                          .filter(kp => {
                              const contextLower = stageContext.toLowerCase();
                              const kpLower = kp.value.toLowerCase();
                              const isIncluded = contextLower.includes(kpLower);
                              console.log(`[AI Fill Debug - PPT Strict Mimic] Comparing context with '${kp.value}': ${isIncluded}`);
                              return isIncluded;
                           })
                           .map(kp => kp.value);
                           
    console.log('[AI Fill Debug - PPT Strict Mimic] Raw foundKnowledge array before assignment:', JSON.parse(JSON.stringify(foundKnowledge)));

    // Wrap assignment in nextTick
    await nextTick(); 

    if (foundKnowledge.length === 0) {
        // Mimic PPT: Use context as custom tag if no match
        console.log('[AI Fill Debug - PPT Strict Mimic] No predefined knowledge match found. Using context as custom knowledge point.');
        form.value.knowledge = [stageContext]; 
    } else {
        console.log('[AI Fill Debug - PPT Strict Mimic] Found predefined knowledge points:', foundKnowledge);
        form.value.knowledge = foundKnowledge; // Direct assignment, exactly like PPT.vue
    }

    // Log after potential assignment (might log before nextTick completes if assignment is async?)
    console.log('[AI Fill Debug - PPT Strict Mimic] Final assigned knowledge in form state (immediately after assignment):', JSON.parse(JSON.stringify(form.value.knowledge)));

    // Assign resource type from preset or default to 'image'
    form.value.resourceType = (preset?.resourceType as 'image' | 'video') || 'image';
    console.log(`[AI Fill Debug - PPT Strict Mimic] Assigned Resource Type: ${form.value.resourceType}`);

    // Assign specific fields and generate desc/script AFTER knowledge is set
    if (form.value.resourceType === 'image') {
      form.value.imageType = preset?.types ? [...preset.types] : [];
      form.value.imageStyle = preset?.style ? [...preset.style] : [];
      form.value.size = (preset as any)?.size || '1024x768'; 
      form.value.imageDesc = `为知识点 "${form.value.knowledge.join(', ')}" 生成相关的${form.value.imageType.join('或') || '图片'}，风格偏向${form.value.imageStyle.join('、') || '通用'}。`;
      // Reset video fields
      form.value.videoDuration = 60;
      form.value.videoAspectRatio = '16:9';
      form.value.videoStyle = [];
      form.value.videoScript = '';
      console.log('[AI Fill Debug - PPT Strict Mimic] Applied Image Presets');
    } else { // resourceType is 'video'
      form.value.videoStyle = preset?.types ? [...preset.types] : [];
      form.value.videoDuration = preset?.duration || 60; // Use duration from preset, assign to videoDuration
      form.value.videoAspectRatio = (preset as any)?.videoAspectRatio || '16:9';
      form.value.videoScript = `制作一个关于 "${form.value.knowledge.join(', ')}" 的教学${form.value.videoStyle.join('或') || '视频'}，时长约${form.value.videoDuration}秒。`;
      // Reset image fields
      form.value.imageType = [];
      form.value.size = '1024x768';
      form.value.imageStyle = [];
      form.value.imageDesc = '';
      console.log('[AI Fill Debug - PPT Strict Mimic] Applied Video Presets');
    }
    form.value.custom = ''; // Reset custom

    // Simulate AI thinking
    await sleep(300); 
    ElMessage.success('AI已填充生成选项');

  } catch (error) {
    console.error("AI填充失败 (Graphic.vue - PPT Strict Mimic Logic):", error);
    ElMessage.error('AI填充选项时出错');
  } finally {
    isAiFilling.value = false;
    console.log('[AI Fill Debug - PPT Strict Mimic] Finished AI Fill.');
  }
}; // End of handleAiFillOptions function

// --- getPresetResourceInfo function (Copied from PPT.vue) ---
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

// --- Predefined Knowledge Points (Copied from PPT.vue) ---
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

// --- Add sleep function definition ---
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- New Helper Function for Resource Tag Info (Adapted from PPT.vue) ---
const getResourceTagInfo = (tagString: string, resourceType: 'image' | 'video'): { icon: any; type: TagType | 'primary'; label: string } => {
  let icon: any = Document; // Default icon
  let type: TagType | 'primary' = 'danger'; // Default type
  let label = tagString; // Default label

  if (tagString.startsWith('图片类型-')) {
    type = 'success';
    label = tagString.substring(5); // Adjusted index
    if (label.includes('思维导图') || label.includes('概念图')) icon = Guide;
    else if (label.includes('流程图')) icon = SetUp;
    else if (label.includes('数据图表') || label.includes('对比图')) icon = DataAnalysis;
    else icon = Picture;
  } else if (tagString.startsWith('视频风格-')) {
    type = 'warning';
    label = tagString.substring(5); // Adjusted index
    if (label.includes('动画') || label.includes('剪辑')) icon = Film;
    else if (label.includes('演示') || label.includes('出镜')) icon = VideoCamera;
    else icon = VideoPlay;
  } else if (tagString.startsWith('知识点-')) {
    type = 'primary';
    label = tagString.substring(4);
    icon = Collection;
  } else if (tagString.startsWith('尺寸-')) {
    type = 'danger';
    label = tagString.substring(3);
    icon = Rank;
  } else if (tagString.startsWith('风格-')) { // This is for Image Style
    if (resourceType === 'image') { // Only apply if image resource
      type = 'warning';
      label = tagString.substring(3);
      icon = Brush;
    }
  } else if (tagString.startsWith('时长-')) {
    type = 'primary';
    label = `${tagString.substring(3)}秒`; // Append '秒'
    icon = Clock;
  } else if (tagString.startsWith('比例-')) {
    type = 'success';
    label = tagString.substring(3);
    icon = FullScreen;
  }

  return { icon, type, label };
}

// --- Generate Questions Handler ---
const handleGenerateQuestions = async () => {
  if (!formRef.value || !selectedPlanStructure.value) {
      ElMessage.warning('请先完成所有配置步骤');
      return;
  }

  try {
    await formRef.value.validate();

    // Prepare configuration object (still useful even without navigation)
    const generationConfig: GenerationConfig = {
        source: selectedPlanStructure.value.title,
        generationParams: { ...form.value },
        major: selectedPlanStructure.value.content.syllabus,
        course: selectedPlanStructure.value.usage,
        overallKnowledgePoints: selectedPlanStructure.value.content.stages.map(s => s.name),
    };

    console.log("准备生成题目，配置:", generationConfig);

    // *** 模拟题目生成过程 ***
    // TODO: 替换为实际的 API 调用
    ElMessage.info('正在生成题目 (模拟)...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟

    // 模拟生成的题目数据 (你需要根据实际需要调整结构)
    const simulatedQuestions = [
        { id: 1, type: '选择题', stem: '关于栈的描述，以下哪个是错误的？', options: ['A. LIFO', 'B. FILO', 'C. FIFO', 'D.只能在一端操作'], answer: 'C', analysis: '栈是后进先出（LIFO）或先进后出（FILO）的数据结构，操作通常在栈顶进行。FIFO是队列的特性。' },
        { id: 2, type: '填空题', stem: '快速排序的平均时间复杂度是 ____。', answer: 'O(n log n)', analysis: '...' },
        // ... 添加更多模拟题目 ...
    ];

    // *** 更新状态以显示题目 ***
    generatedQuestions.value = simulatedQuestions;
    ElMessage.success('题目已生成 (模拟)');

  } catch (e) {
    console.error("表单校验失败或生成出错:", e);
    ElMessage.error('请填写/修正所有必填项后才能生成题目');
    generatedQuestions.value = null; // 出错时清空
  }
}
</script>

<style scoped>
.graphicgen-container {
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
.typing-effect {
  transition: all 0.3s ease;
}
.typing-effect.is-typing {
  background-color: #f0f9eb;
}
:deep(.el-select),
:deep(.el-input),
:deep(.el-textarea),
:deep(.el-input-number) {
  transition: all 0.3s ease;
}
:deep(.el-select.typing-effect),
:deep(.el-input.typing-effect),
:deep(.el-textarea.typing-effect) {
  animation: highlight 0.5s ease;
}
@keyframes highlight {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: #f0f9eb;
  }
  100% {
    background-color: transparent;
  }
}
:deep(.el-select .el-select__tags) {
  background-color: transparent;
}
:deep(.el-select.typing-effect .el-tag) {
  animation: tagHighlight 0.5s ease;
}
@keyframes tagHighlight {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
    background-color: #f0f9eb;
  }
  100% {
    transform: scale(1);
  }
}

/* Add styles for the AI fill button */
.auto-fill-btn {
  background: linear-gradient(45deg, #409eff, #67c23a);
  border: none;
  color: white; /* Ensure text is white */
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 16px; /* Keep the margin */
}

.auto-fill-btn:hover:not(.is-disabled) { /* Add :not(.is-disabled) */
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(45deg, #67c23a, #409eff);
}

.auto-fill-btn .el-icon {
  margin-right: 4px;
  font-size: 16px; /* Adjust if needed for size="small" */
}

/* Add styles copied from PPT.vue */
.history-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-tag-group {
  display: flex;
  align-items: center;
  gap: 6px; /* Adjust gap between name and tag */
}

.type-tag {
  /* Adjust tag styling if needed, e.g., remove margins */
  margin-left: 0; 
}

.option-time {
  /* Keep existing styles or adjust */
  color: #909399;
  font-size: 12px;
}

.generated-questions-card {
  /* Add styles for the generated questions card if needed */
}

.question-item {
  margin-bottom: 15px;
}
.question-item p {
  margin: 5px 0;
}
.question-item ul {
  margin-left: 20px;
  list-style: none;
  padding: 0;
}
.question-item li {
  margin-bottom: 3px;
}

/* 微调分隔线 */
.question-item .el-divider {
  margin: 15px 0;
}
</style>
