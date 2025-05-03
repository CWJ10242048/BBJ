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
          <el-input v-model="form.knowledge" placeholder="请输入知识点" :class="{ 'typing-effect': isTyping }" />
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
               <el-descriptions-item label="资源类型">{{ form.resourceType === 'image' ? '图片' : '视频' }}</el-descriptions-item>
               <el-descriptions-item label="适用学科">{{ form.subject }}</el-descriptions-item>
               <el-descriptions-item label="知识点">{{ form.knowledge }}</el-descriptions-item>

               <template v-if="form.resourceType === 'image'">
                 <el-descriptions-item label="图片类型">{{ form.imageType.join(', ') }}</el-descriptions-item>
                 <el-descriptions-item label="图片大小">{{ sizeText }}</el-descriptions-item>
                 <el-descriptions-item label="风格">{{ form.imageStyle.join(', ') }}</el-descriptions-item>
                 <el-descriptions-item label="参考图片文件">
                   <span v-if="form.imageFile.length">已上传文件: {{ form.imageFile.map(f=>f.name).join(', ') }}</span>
                   <pre v-else class="desc-pre">{{ form.imageDesc || '无' }}</pre>
               </el-descriptions-item>
               </template>

               <template v-if="form.resourceType === 'video'">
                 <el-descriptions-item label="视频时长">{{ form.videoDuration }} 秒</el-descriptions-item>
                 <el-descriptions-item label="画面比例">{{ form.videoAspectRatio }}</el-descriptions-item>
                 <el-descriptions-item label="视频风格">{{ form.videoStyle.join(', ') }}</el-descriptions-item>
                 <el-descriptions-item label="脚本/提示词"><pre class="desc-pre">{{ form.videoScript || '无' }}</pre></el-descriptions-item>
               </template>

               <el-descriptions-item label="自定义要求"><pre class="desc-pre">{{ form.custom || '无' }}</pre></el-descriptions-item>
             </el-descriptions>
           </div>
        </el-dialog>
     </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineEmits, onMounted } from 'vue'
import { ElMessage, type UploadUserFile, type UploadFile, type FormInstance, type FormItemRule, type UploadProps, type FormRules } from 'element-plus'
import axios from 'axios'
import { MagicStick } from '@element-plus/icons-vue'

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
  knowledge: string;
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
  knowledge: '',
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
  subject: [{ required: true, message: '请输入适用学科', trigger: 'blur' }],
  knowledge: [{ required: true, message: '请输入知识点', trigger: 'blur' }],
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
  console.log("[Graphic.vue] Mounted in standalone mode.");
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
  form.value.knowledge = '';
  form.value.imageDesc = '';
  form.value.videoScript = '';

  const selectedPlan = historyPlans.value.find(p => p.id === planId);
  if (selectedPlan) {
    selectedPlanStructure.value = selectedPlan.content; 
    form.value.subject = selectedPlan.content?.subject || ''; 
  } else {
    selectedPlanStructure.value = null;
    form.value.subject = ''; // Clear subject if plan not found
  }
}

// Handle Stage Change (Keep this)
const handleStageChange = (stageId: string | number) => {
  const stage = selectedPlanStructure.value?.stages.find((s: Stage) => s.id === stageId);
  
  if (stage) {
    form.value.knowledge = stage.name;
  } else {
    form.value.knowledge = '';
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
      resultUrl = `https://via.placeholder.com/400x300.png?text=Generated+Image+(${form.value.imageType.join('+')})`;
      details = { imageTypes: form.value.imageType };
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
      resultUrl = `https://via.placeholder.com/320x180.png/000000/FFFFFF/?text=Generated+Video`;
      details = { duration: form.value.videoDuration, script: form.value.videoScript };
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
    subject: '', // 会在选择教案时重新填充
    knowledge: '',
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
}

// --- AI Fill Handler (Keep this, it's for standalone) ---
const handleAiFillOptions = async () => {
  if (!selectedStageId.value || !selectedPlanStructure.value) {
    ElMessage.warning('请先选择一个教学环节');
    return;
  }
  
  const stage = selectedPlanStructure.value.stages.find(s => s.id === selectedStageId.value);
  if (!stage || !stage.name) {
    ElMessage.error('未能找到选定的环节信息或环节名称');
    return;
  }

  // Reset potential previous error states if any?
  // ElMessage.closeAll(); // Optional: Close previous messages

  isAiFilling.value = true;
  console.log(`[AI Fill Debug] Started for stage: ${stage.name}. isAiFilling: ${isAiFilling.value}`);

  try {
    console.log("[AI Fill Debug] Entering try block.");
    // 查找预设配置
    const preset = presetOptionsMap[stage.name] || presetOptionsMap['默认'];
    console.log(`[AI Fill Debug] Using preset for: ${preset ? stage.name : '默认'}`);

    // -- Start Assignments --
    if (preset) {
      console.log("[AI Fill Debug] Applying preset...");
      // Assign common fields first
      form.value.subject = selectedPlanStructure.value?.subject || '未知学科';
      form.value.knowledge = stage.name;
      
      // Assign preset fields 
      const presetValues = preset as Partial<FormState>;
      if (presetValues.resourceType !== undefined) form.value.resourceType = presetValues.resourceType;
      if (presetValues.imageType !== undefined) form.value.imageType = [...presetValues.imageType];
      if (presetValues.imageStyle !== undefined) form.value.imageStyle = [...presetValues.imageStyle];
      if (presetValues.size !== undefined) form.value.size = presetValues.size;
      if (presetValues.imageDesc !== undefined) form.value.imageDesc = presetValues.imageDesc;
      if (presetValues.videoDuration !== undefined) form.value.videoDuration = presetValues.videoDuration;
      if (presetValues.videoAspectRatio !== undefined) form.value.videoAspectRatio = presetValues.videoAspectRatio;
      if (presetValues.videoStyle !== undefined) form.value.videoStyle = [...presetValues.videoStyle];
      if (presetValues.videoScript !== undefined) form.value.videoScript = presetValues.videoScript;
      console.log("[AI Fill Debug] Assignments complete.");
    } else {
       console.warn("[AI Fill Debug] No preset found, assignments skipped.");
    }
    // -- End Assignments --
    
    // Short delay 
    console.log("[AI Fill Debug] Starting final delay...");
    await sleep(150); // Slightly longer delay to ensure reactivity settles?
    console.log("[AI Fill Debug] Finished final delay.");

    // Check state before success message
    if (!isAiFilling.value) {
        console.warn("[AI Fill Debug] isAiFilling became false unexpectedly before success message!");
    }

    console.log("[AI Fill Debug] Attempting to show success message.");
    ElMessage.success('AI已填充选项'); 
    console.log(`[AI Fill Debug] Success message should be visible now.`);

  } catch (caughtValue) {
    // Log the type and value of whatever was caught
    console.error("[AI Fill Debug] Error caught! Type:", typeof caughtValue, "Value:", caughtValue);
    ElMessage.error('AI填充失败，请检查控制台获取详细信息'); 
  } finally {
    console.log(`[AI Fill Debug] Entering finally block. Current isAiFilling: ${isAiFilling.value}`);
    isAiFilling.value = false;
    console.log(`[AI Fill Debug] Finished. isAiFilling set to: ${isAiFilling.value}`);
  }
}

// --- Preset map (Keep this) ---
const presetOptionsMap: Record<string, Partial<FormState>> = {
  '复习旧知': {
    resourceType: 'image',
    imageType: ['思维导图', '概念图'],
    imageStyle: ['简约', '清晰'],
    size: '1920x1080',
    imageDesc: `## 配图需求：复习旧知

**核心内容:** 回顾上节课重点概念、公式、流程。
**视觉元素:**
  - 使用思维导图梳理知识体系结构。
  - 或用概念图清晰展示关键点及其联系。
  - 突出显示核心术语。
**风格要求:** 简洁、清晰、专业。`
  },
  '导入新课': {
    resourceType: 'video', // Usually better for engagement
    videoDuration: 45,
    videoAspectRatio: '16:9',
    videoStyle: ['动画科普', '快速剪辑'],
    videoScript: `### 视频脚本：导入新课

**时长:** 约 45 秒
**画面:** 16:9
**风格:** 动画科普 / 快速剪辑

**(画面示例)**
1.  **(0-5s)** 引人入胜的片头/问题提出 (如: [与主题相关的疑问句?])
2.  **(5-20s)** 快速展示与主题相关的生动场景/案例/痛点 (如: [房价飞涨图表], [代码运行错误截图])
3.  **(20-35s)** 点出本节课要解决的核心问题或学习主题 (如: 如何预测房价? 如何调试代码?)
4.  **(35-45s)** 清晰展示本节课学习目标 (字幕叠加) + Logo/课程信息结尾。

**旁白/字幕:** 简洁有力，激发好奇心，明确目标，节奏快。`
  },
  '讲解新知': {
    resourceType: 'video',
    videoDuration: 90,
    videoAspectRatio: '16:9',
    videoStyle: ['教学演示', '动画科普'],
    videoScript: `### 视频脚本：讲解新知

**时长:** 约 90 秒
**画面:** 16:9
**风格:** 教学演示 / 动画科普

**(内容结构示例)**
1.  **引入概念:** 清晰定义核心概念。
2.  **原理阐述:** 使用动画/图表/模型逐步解释原理或步骤。
3.  **实例演示:** 结合简单实例进行演示说明 (如公式推导、代码片段、操作流程)。
4.  **要点总结:** 再次强调关键点或注意事项。

**视觉要求:** 图文并茂，逻辑清晰，重点突出，专业准确。`
  },
  '讲解新知 - 梯度下降': { 
    resourceType: 'video',
    videoDuration: 120,
    videoAspectRatio: '16:9',
    videoStyle: ['动画科普', '教学演示'],
    videoScript: `### 视频脚本：讲解梯度下降

**时长:** 约 120 秒
**画面:** 16:9
**风格:** 动画科普 / 教学演示

**(内容&镜头建议)**
1.  **(引入)** 展示损失函数的三维/二维可视化图形。
2.  **(核心原理)** 动画演示：一个小球如何沿着梯度的反方向逐步滚下山坡（损失函数曲面），到达最低点。
3.  **(关键要素)** 逐步解释：代价函数 J(θ)、梯度 ∇J、学习率 α 的含义和作用。
4.  **(迭代过程)** 展示参数更新公式 θ := θ - α * ∇J，并通过简单数值示例演示几次迭代。
5.  **(学习率影响)** 可视化对比不同学习率（过大/过小/合适）下的收敛情况。
6.  **(总结)** 强调梯度下降是寻找函数最小值的常用优化算法。`
  },
  '案例分析': {
    resourceType: 'image', // Often needs static display for analysis
    imageType: ['数据图表', '示意图', '流程图'],
    imageStyle: ['专业', '清晰'],
    size: '1024x768',
    imageDesc: `## 配图需求：案例分析

**核心内容:** 展示案例背景、相关数据、分析/处理步骤、最终结果。
**视觉元素:**
  - **数据图表:** (如折线图、柱状图、散点图) 展示数据趋势、分布或对比。
  - **流程图:** 清晰展示分析或处理的步骤。
  - **示意图:** 展示案例场景、系统架构或关键对象关系。
**风格要求:** 专业、清晰、准确，便于理解分析过程。`
  },
   '练习': { // Added preset for '练习'
     resourceType: 'image',
     imageType: ['示意图', '流程图'],
     imageStyle: ['清晰', '简约'],
     size: '1024x768',
     imageDesc: `## 配图需求：练习

**核心内容:** 提供与练习题目相关的视觉辅助信息。
**视觉元素:**
  - **示意图:** 展示题目描述的场景、对象或数据结构。
  - **流程图:** (可选) 提供解题思路或关键步骤的提示。
**风格要求:** 清晰、简洁，避免干扰，辅助理解题意。`
   },
  '总结提升': {
    resourceType: 'image',
    imageType: ['思维导图', '对比图', '列表图'],
    imageStyle: ['简约', '清晰'],
    size: '1920x1080',
    imageDesc: `## 配图需求：总结提升

**核心内容:** 系统梳理本节课知识要点、关键概念、方法或流程。
**视觉元素:**
  - **思维导图:** 构建知识网络，展示整体结构。
  - **对比图:** 清晰比较不同概念、方法或算法的异同。
  - **列表图:** 简洁列出核心要点或步骤。
**风格要求:** 结构清晰、重点突出、简洁明了，便于回顾。`
  },
  '默认': { 
    resourceType: 'image',
    imageType: ['示意图'],
    imageStyle: ['简约'],
    size: '1024x768',
    imageDesc: '## 通用配图需求\n\n请根据下方知识点和学科信息，生成与教学内容相关的示意图。风格要求简洁明了。'
  }
};

// --- Add sleep function definition (if not already present) ---
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
</style>
