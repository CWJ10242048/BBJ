<template>
  <div class="lesson-plan-container">
    <h2>教案生成</h2>
    
    <!-- 教学大纲上传卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学大纲</span>
        </div>
      </template>
      <div class="upload-container">
        <el-radio-group v-model="syllabusSource" size="small" class="syllabus-source">
          <el-radio-button label="upload">上传新大纲</el-radio-button>
          <el-radio-button label="history">选择历史大纲</el-radio-button>
        </el-radio-group>

        <div v-if="syllabusSource === 'upload'" class="upload-section">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">上传教学大纲</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word文档格式</div>
            </template>
          </el-upload>
        </div>

        <div v-else class="history-section">
          <el-select
            v-model="selectedHistorySyllabus"
            placeholder="请选择历史教学大纲"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in historySyllabusList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>

        <el-progress
          v-if="uploadProgress > 0"
          :percentage="uploadProgress"
          :status="uploadStatus"
          class="upload-progress"
        />
        <div v-if="form.syllabus" class="file-info">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ form.syllabus }}</span>
          <el-button type="danger" link @click="removeFile">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 教案基本信息 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案基本信息</span>
          <el-tag v-if="isBasicInfoAIGenerated" type="success" effect="dark">AI自动生成</el-tag>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程主题" prop="topic">
          <el-input v-model="form.topic" placeholder="请输入课程主题" />
        </el-form-item>
        <el-form-item label="授课教师" prop="teacher">
          <el-input v-model="form.teacher" placeholder="请输入授课教师" />
        </el-form-item>
        <el-form-item label="授课班级" prop="class">
          <el-select
            v-model="form.class"
            placeholder="请选择或输入授课班级"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="授课时间" prop="date">
          <div class="time-range-picker">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="开始时间"
              :disabled-date="disabledDate"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
            />
            <span class="time-separator">至</span>
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="结束时间"
              :disabled-date="disabledDate"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
            />
          </div>
        </el-form-item>
        <el-form-item label="课次" prop="lessonNumber">
          <div class="number-control">
            <el-button size="small" @click="form.lessonNumber = Math.max(1, form.lessonNumber - 1)">-</el-button>
            <span class="number">{{ form.lessonNumber }}</span>
            <el-button size="small" @click="form.lessonNumber = Math.min(32, form.lessonNumber + 1)">+</el-button>
          </div>
        </el-form-item>
        <el-form-item label="课时" prop="duration">
          <div class="number-control">
            <el-button size="small" @click="form.duration = Math.max(1, form.duration - 1)">-</el-button>
            <span class="number">{{ form.duration }}</span>
            <el-button size="small" @click="form.duration = Math.min(4, form.duration + 1)">+</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教学资源上传 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学资源</span>
        </div>
      </template>
      <div class="upload-container">
        <el-upload
          class="upload-demo"
          :auto-upload="false"
          :show-file-list="true"
          multiple
          :on-preview="handlePreviewResource"
          :on-remove="handleRemoveResource"
          :before-remove="beforeRemoveResource"
          :on-exceed="handleExceed"
          :limit="5"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.jpg,.jpeg,.png"
        >
          <el-button type="primary">上传教学资源</el-button>
          <template #tip>
            <div class="el-upload__tip">支持PDF、Word、PPT、视频、图片等格式，最多上传5个文件</div>
          </template>
        </el-upload>
      </div>
    </el-card>

    <!-- 教学环节时间分配 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学环节时间分配</span>
          <el-button type="primary" size="small" @click="showAddDialog = true">增加环节</el-button>
        </div>
      </template>
      <div class="stages-list">
        <div v-for="(stage, idx) in stages" :key="stage.id" class="stage-card">
          <div class="stage-header">
            <el-select v-model="stage.type" placeholder="选择环节" style="width: 140px" @change="handleStageTypeChange(stage, idx)">
              <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
              <el-option label="自定义" value="custom" />
            </el-select>
            <el-input v-if="stage.type==='custom'" v-model="stage.name" placeholder="输入环节名称" style="width: 120px; margin-left: 8px" />
            <el-button type="danger" link icon="el-icon-delete" @click="removeStage(idx)" style="margin-left: 8px" />
          </div>
          <div class="stage-body">
            <div class="stage-time">
              <el-input-number v-model="stage.time" :min="1" :max="180" :step="1" controls-position="right" style="width: 100px" />
              <span class="time-unit">分钟</span>
            </div>
            <el-input
              v-model="stage.desc"
              type="textarea"
              :rows="2"
              placeholder="详细描述"
              style="margin-top: 8px"
            />
          </div>
        </div>
      </div>
      <div class="timeline-bar">
        <div
          v-for="(item, idx) in timeline"
          :key="item.id"
          class="timeline-segment"
          :style="{ width: item.percent + '%', background: item.color }"
          :title="item.name + '：' + item.time + '分钟'"
          draggable="true"
          @dragstart="handleDragStart($event, idx)"
          @dragover.prevent="handleDragOver($event, idx)"
          @drop="handleDrop($event, idx)"
          @dragend="handleDragEnd"
        >
          <span class="timeline-label">{{ item.name }}<span v-if="item.time">({{ item.time }})</span></span>
          <div class="resize-handle left" @mousedown="startResize($event, idx, 'left')"></div>
          <div class="resize-handle right" @mousedown="startResize($event, idx, 'right')"></div>
        </div>
      </div>
      <div class="total-time-info">
        总时间 <span class="total-time">{{ totalTime }}分钟</span>
        <span v-if="isTimeMismatch" class="time-warning">(与课时不匹配)</span>
      </div>
      <el-dialog v-model="showAddDialog" title="增加环节" width="320px" :close-on-click-modal="false">
        <el-select v-model="addStageType" placeholder="选择环节类型" style="width: 100%">
          <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
          <el-option label="自定义" value="custom" />
        </el-select>
        <el-input v-if="addStageType==='custom'" v-model="addStageName" placeholder="输入自定义环节名称" style="margin-top: 12px" />
        <div style="margin-top: 18px; text-align: right">
          <el-button @click="showAddDialog=false">取消</el-button>
          <el-button type="primary" @click="addStage">确定</el-button>
        </div>
      </el-dialog>
    </el-card>

    <!-- 教学内容 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学内容</span>
          <div class="header-right">
            <el-tag v-if="isContentAIGenerated" type="success" effect="dark">AI自动生成</el-tag>
            <el-button type="primary" size="small" @click="handleAutoGenerateContent" :disabled="typing">自动生成</el-button>
          </div>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="教学目标" prop="objectives">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="5"
            placeholder="请输入教学目标"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学重点" prop="keyPoints">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学重点"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学难点" prop="difficultPoints">
          <el-input
            v-model="form.difficultPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入教学难点"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="教学过程" prop="procedure">
          <el-input
            v-model="form.procedure"
            type="textarea"
            :rows="5"
            placeholder="请输入教学过程"
            :readonly="typing"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学反思与总结</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="教学效果" prop="teachingEffect">
          <el-rate v-model="form.teachingEffect" :texts="['很差', '较差', '一般', '较好', '很好']" show-text />
        </el-form-item>
        <el-form-item label="学生反馈" prop="studentFeedback">
          <el-input
            v-model="form.studentFeedback"
            type="textarea"
            :rows="3"
            placeholder="记录学生的反馈意见"
          />
        </el-form-item>
        <el-form-item label="教学反思" prop="teachingReflection">
          <el-input
            v-model="form.teachingReflection"
            type="textarea"
            :rows="4"
            placeholder="记录教学过程中的问题和改进建议"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" :loading="exporting" @click="handleExport">
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="教案预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-content">
        <h2>{{ form.courseName }}教案</h2>
        <div v-for="(value, key) in previewData" :key="key">
          <h3>{{ getLabel(key) }}</h3>
          <p>{{ value }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'
import { nanoid } from 'nanoid'
import axios from 'axios'

const formRef = ref()
const previewVisible = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const exporting = ref(false)

const form = ref({
  courseName: '',
  topic: '',
  teacher: '李老师',
  class: '',
  startTime: (() => { 
    const d = new Date(); 
    d.setHours(8, 0, 0, 0); 
    return d; 
  })(),
  endTime: (() => { 
    const d = new Date(); 
    d.setHours(9, 40, 0, 0); 
    return d; 
  })(),
  lessonNumber: 1,
  duration: 2,
  objectives: '',
  keyPoints: '',
  difficultPoints: '',
  procedure: '',
  syllabus: '',
  importTime: 0,
  lectureTime: 0,
  interactionTime: 0,
  practiceTime: 0,
  summaryTime: 0,
  teachingEffect: 3,
  studentFeedback: '',
  teachingReflection: '',
  resources: [] as any[]
})

const rules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  topic: [{ required: true, message: '请输入课程主题', trigger: 'blur' }],
  teacher: [{ required: true, message: '请输入授课教师', trigger: 'blur' }],
  class: [{ required: true, message: '请输入授课班级', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  lessonNumber: [{ required: true, message: '请选择课次', trigger: 'change' }],
  duration: [{ required: true, message: '请选择课时', trigger: 'change' }],
  objectives: [{ required: true, message: '请输入教学目标', trigger: 'blur' }],
  keyPoints: [{ required: true, message: '请输入教学重点', trigger: 'blur' }],
  difficultPoints: [{ required: true, message: '请输入教学难点', trigger: 'blur' }],
  procedure: [{ required: true, message: '请输入教学过程', trigger: 'blur' }]
}

const previewData = computed(() => {
  // 只保留主要字段
  const {
    courseName, topic, teacher, class: className, startTime, endTime, lessonNumber, duration,
    objectives, keyPoints, difficultPoints, procedure, syllabus
  } = form.value
  return {
    courseName, topic, teacher, class: className, startTime, endTime, lessonNumber, duration,
    objectives, keyPoints, difficultPoints, procedure, syllabus
  }
})

const getLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    courseName: '课程名称',
    topic: '课程主题',
    teacher: '授课教师',
    class: '授课班级',
    startTime: '授课时间',
    endTime: '授课时间',
    lessonNumber: '课次',
    duration: '课时',
    objectives: '教学目标',
    keyPoints: '教学重点',
    difficultPoints: '教学难点',
    procedure: '教学过程',
    syllabus: '教学大纲'
  }
  return labelMap[key] || key
}

const syllabusSource = ref('upload')
const selectedHistorySyllabus = ref('')
const historySyllabusList = ref([
  { 
    id: '1', 
    name: '计算机导论教学大纲',
    content: {
      courseName: '计算机导论',
      topic: '计算机系统概述',
      objectives: '1. 了解计算机的基本组成和工作原理\n2. 掌握计算机系统的基本概念\n3. 理解计算机的发展历程',
      keyPoints: '计算机硬件组成、操作系统基本概念、计算机网络基础',
      difficultPoints: '计算机工作原理、数据表示与存储'
    }
  },
  { 
    id: '2', 
    name: '数据结构教学大纲',
    content: {
      courseName: '数据结构',
      topic: '线性表',
      objectives: '1. 掌握线性表的基本概念和操作\n2. 理解顺序表和链表的实现原理\n3. 能够应用线性表解决实际问题',
      keyPoints: '线性表的定义、顺序存储结构、链式存储结构',
      difficultPoints: '链表的操作实现、时间复杂度分析'
    }
  },
  { 
    id: '3', 
    name: '操作系统教学大纲',
    content: {
      courseName: '操作系统',
      topic: '进程管理',
      objectives: '1. 理解进程的概念和状态转换\n2. 掌握进程调度算法\n3. 了解进程同步与通信机制',
      keyPoints: '进程控制块、进程调度、进程同步',
      difficultPoints: '死锁问题、进程通信机制'
    }
  }
])

const isBasicInfoAIGenerated = ref(false)
const isContentAIGenerated = ref(false)

// 监听历史大纲选择变化
watch(selectedHistorySyllabus, (newVal) => {
  if (newVal) {
    const selectedSyllabus = historySyllabusList.value.find(item => item.id === newVal)
    if (selectedSyllabus && selectedSyllabus.content) {
      // 自动填充表单内容
      form.value.courseName = selectedSyllabus.content.courseName
      form.value.topic = selectedSyllabus.content.topic
      form.value.objectives = selectedSyllabus.content.objectives
      form.value.keyPoints = selectedSyllabus.content.keyPoints
      form.value.difficultPoints = selectedSyllabus.content.difficultPoints
      form.value.syllabus = selectedSyllabus.name
      
      // 设置AI生成标记
      isBasicInfoAIGenerated.value = true
      isContentAIGenerated.value = true
      
      // 显示成功提示
      ElMessage.success('已根据教学大纲自动填充内容')
    }
  }
})

const handleFileChange = (file: any) => {
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = '' // 清除历史大纲选择
  
  // 模拟上传进度
  const timer = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 20
    } else {
      clearInterval(timer)
      uploadStatus.value = 'success'
      ElMessage.success('上传成功')
      form.value.syllabus = file.name
    }
  }, 100)
}

const removeFile = () => {
  form.value.syllabus = ''
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = ''
}

const beforeUpload = (file: File) => {
  const isPDF = file.type === 'application/pdf'
  const isWord = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isPDF && !isWord) {
    ElMessage.error('只能上传PDF或Word文件')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    // TODO: 调用保存API
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('请填写完整信息')
  }
}

const handlePreview = () => {
  previewVisible.value = true
}

const handleExport = async () => {
  exporting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒延迟
    const response = await axios.get('/api/export/lessonplan', {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '机器学习线性回归教案.docx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    courseName: '',
    topic: '',
    teacher: '李老师',
    class: '',
    startTime: (() => { 
      const d = new Date(); 
      d.setHours(8, 0, 0, 0); 
      return d; 
    })(),
    endTime: (() => { 
      const d = new Date(); 
      d.setHours(9, 40, 0, 0); 
      return d; 
    })(),
    lessonNumber: 1,
    duration: 2,
    objectives: '',
    keyPoints: '',
    difficultPoints: '',
    procedure: '',
    syllabus: '',
    importTime: 0,
    lectureTime: 0,
    interactionTime: 0,
    practiceTime: 0,
    summaryTime: 0,
    teachingEffect: 3,
    studentFeedback: '',
    teachingReflection: '',
    resources: []
  }
  uploadProgress.value = 0
  uploadStatus.value = ''
  selectedHistorySyllabus.value = ''
  // 重置AI生成标记
  isBasicInfoAIGenerated.value = false
  isContentAIGenerated.value = false
}

const handleTimeChange = () => {
  if (isTimeMismatch.value) {
    ElMessage.warning('总时间与课时不匹配，请调整各环节时间')
  }
}

const handleAutoAllocate = () => {
  const totalMinutes = form.value.duration * 45
  const stageCount = stages.value.length
  
  // 根据环节类型分配时间
  stages.value = stages.value.map(stage => {
    let time = 0
    switch (stage.type) {
      case 'lecture':
        time = Math.floor(totalMinutes * 0.4)
        break
      case 'practice':
      case 'interaction':
        time = Math.floor(totalMinutes * 0.2)
        break
      case 'review':
      case 'import':
      case 'summary':
        time = Math.floor(totalMinutes * 0.1)
        break
      default:
        time = Math.floor(totalMinutes * 0.1)
    }
    return { ...stage, time }
  })
  
  // 调整总时间
  const currentTotal = stages.value.reduce((sum, stage) => sum + stage.time, 0)
  if (currentTotal !== totalMinutes) {
    const diff = totalMinutes - currentTotal
    // 将剩余时间加到讲授环节
    const lectureStage = stages.value.find(stage => stage.type === 'lecture')
    if (lectureStage) {
      lectureStage.time += diff
    }
  }
}

const handlePreviewResource = (file: any) => {
  // TODO: 实现资源预览功能
  console.log('预览资源:', file)
}

const handleRemoveResource = (file: any) => {
  // TODO: 实现资源删除功能
  console.log('删除资源:', file)
}

const beforeRemoveResource = (file: any) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传5个文件')
}

const timeline = computed(() => {
  const total = totalTime.value || 1
  return stages.value.map(stage => ({
    id: stage.id,
    name: stage.name,
    time: stage.time,
    color: colorMap[stage.type] || '#BDBDBD',
    percent: Math.round((stage.time / total) * 100)
  }))
})

const stageOptions = [
  { label: '复习旧知', value: 'review', desc: '回顾上节课内容，帮助学生温故知新。' },
  { label: '导入', value: 'import', desc: '引入新课题，激发学生兴趣。' },
  { label: '讲授', value: 'lecture', desc: '系统讲解本节课核心知识点。' },
  { label: '案例分析', value: 'case', desc: '通过实际案例加深理解。' },
  { label: '小组合作学习', value: 'group', desc: '学生分组合作，提升协作能力。' },
  { label: '课堂讨论', value: 'discussion', desc: '围绕主题展开讨论，培养思辨能力。' },
  { label: '互动', value: 'interaction', desc: '师生互动，答疑解惑。' },
  { label: '练习', value: 'practice', desc: '通过练习巩固所学知识。' },
  { label: '课堂小测验', value: 'quiz', desc: '检测学生对知识点的掌握情况。' },
  { label: '总结', value: 'summary', desc: '归纳本节课内容，布置课后任务。' }
]

const defaultStageName = (type: string) => {
  const found = stageOptions.find(i => i.value === type)
  return found ? found.label : ''
}

const defaultStageDesc = (type: string) => {
  const found = stageOptions.find(i => i.value === type)
  return found ? found.desc : ''
}

const colorMap: Record<string, string> = {
  review: '#6EC6FF',
  import: '#6EC6FF',
  lecture: '#42C39D',
  case: '#7B6CF6',
  group: '#FFB347',
  discussion: '#FFD166',
  interaction: '#FFD166',
  practice: '#FF8C42',
  quiz: '#F67280',
  summary: '#A385E0',
  custom: '#BDBDBD'
}

const stages = ref([
  { id: nanoid(), type: 'review', name: '复习旧知', time: 10, desc: defaultStageDesc('review') },
  { id: nanoid(), type: 'import', name: '导入', time: 10, desc: defaultStageDesc('import') },
  { id: nanoid(), type: 'lecture', name: '讲授', time: 60, desc: defaultStageDesc('lecture') },
  { id: nanoid(), type: 'practice', name: '练习', time: 30, desc: defaultStageDesc('practice') },
  { id: nanoid(), type: 'summary', name: '总结', time: 10, desc: defaultStageDesc('summary') }
])

const showAddDialog = ref(false)
const addStageType = ref('')
const addStageName = ref('')

const addStage = () => {
  let name = ''
  let desc = ''
  if (addStageType.value === 'custom') {
    name = addStageName.value.trim() || '自定义环节'
    desc = ''
  } else {
    name = defaultStageName(addStageType.value)
    desc = defaultStageDesc(addStageType.value)
  }
  if (!name) return
  stages.value.push({
    id: nanoid(),
    type: addStageType.value,
    name,
    time: 10,
    desc
  })
  showAddDialog.value = false
  addStageType.value = ''
  addStageName.value = ''
}

const removeStage = (idx: number) => {
  stages.value.splice(idx, 1)
}

const handleStageTypeChange = (stage: any, idx: number) => {
  if (stage.type !== 'custom') {
    stage.name = defaultStageName(stage.type)
    stage.desc = defaultStageDesc(stage.type)
  } else {
    stage.name = ''
    stage.desc = ''
  }
}

const totalTime = computed(() => stages.value.reduce((sum, s) => sum + (s.time || 0), 0))
const isTimeMismatch = computed(() => totalTime.value !== form.value.duration * 45)

const classOptions = [
  '计算机科学与技术2201班',
  '软件工程2202班',
  '数据科学与大数据技术2201班',
  '人工智能2301班'
]

// 打字机效果相关
const typing = ref(false)
const autoContent = {
  objectives: `| 维度 | 具体目标 |
|------|----------|
| **知识目标** | 1. 说出线性回归的模型最小二乘估计思想。<br>2. 理解正规方程与梯度下降两类求解方式及其数值特点。<br>3. 解释欠拟合、过拟合与正则化（岭回归 / Lasso）在回归中的作用。 |
| **技能目标** | 1. 能够独立使用 Python/NumPy 或 scikit-learn 训练一元和多元线性回归模型，并完成模型评估。<br>2. 能对给定数据集选择合适的特征缩放、交叉验证和正则化策略。 |
| **情感与态度目标** | 1. 形成"模型简单性 vs. 表达能力"平衡的工程思维。<br>2. 培养用数据与实验而非直觉作决策的科学态度。 |`,
  keyPoints: `损失函数 → 最优化：均方误差的由来、几何含义与凸优化特性。\n解析解 vs. 数值解：正规方程与梯度下降的条件、效率、数值稳定性比较。\n正则化：λ 的物理意义，岭回归与 L1 正则对参数的不同影响。`,
  difficultPoints: `| 难点 | 化解策略 |
|------|----------|
| **梯度下降的收敛性与学习率选择** | 动画记录 loss 曲线并评价收敛速度。 |
| **多重共线性引发的矩阵不可逆** | 通过可视化列空间、演示正规方程求解失败，再引入岭回归作为解决方案。 |
| **正则化超参数 λ 的调优** | 课堂现场用交叉验证网格搜索，展示"U 形"验证误差曲线，帮助学生直观体会。 |`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const handleAutoGenerateContent = async () => {
  typing.value = true
  form.value.objectives = ''
  form.value.keyPoints = ''
  form.value.difficultPoints = ''
  form.value.procedure = ''
  await sleep(2000)
  // 打字机效果
  for (let i = 0; i < autoContent.objectives.length; i++) {
    form.value.objectives += autoContent.objectives[i]
    await nextTick()
    await sleep(18)
  }
  for (let i = 0; i < autoContent.keyPoints.length; i++) {
    form.value.keyPoints += autoContent.keyPoints[i]
    await nextTick()
    await sleep(18)
  }
  for (let i = 0; i < autoContent.difficultPoints.length; i++) {
    form.value.difficultPoints += autoContent.difficultPoints[i]
    await nextTick()
    await sleep(18)
  }
  // 教学过程自动生成
  let proc = ''
  stages.value.forEach((stage, idx) => {
    proc += `${idx + 1}. 【${stage.name}】（${stage.time}分钟）：${stage.desc || '……'}\n`
  })
  form.value.procedure = ''
  for (let i = 0; i < proc.length; i++) {
    form.value.procedure += proc[i]
    await nextTick()
    await sleep(10)
  }
  typing.value = false
}

// 禁用日期（只能选择今天及以后的日期）
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 禁用非工作时间（8:00-21:00）
const disabledHours = () => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    if (i < 8 || i > 21) {
      hours.push(i)
    }
  }
  return hours
}

// 禁用非整点时间（只能选择整点或30分）
const disabledMinutes = (hour: number) => {
  const minutes = []
  for (let i = 0; i < 60; i++) {
    if (i % 30 !== 0) {
      minutes.push(i)
    }
  }
  return minutes
}

// 监听时间变化，自动计算课时
watch([() => form.value.startTime, () => form.value.endTime], ([start, end]) => {
  if (start && end) {
    const diff = end.getTime() - start.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    form.value.duration = Math.ceil(minutes / 45) // 每45分钟一节课
  }
})

const draggedIndex = ref(-1)
const draggedOverIndex = ref(-1)

const handleDragStart = (event: DragEvent, index: number) => {
  if (isResizing.value) {
    event.preventDefault()
    return
  }
  draggedIndex.value = index
  event.dataTransfer?.setData('text/plain', index.toString())
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  draggedOverIndex.value = index
}

const handleDrop = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (draggedIndex.value === -1 || draggedOverIndex.value === -1) return
  
  // 交换教学环节顺序
  const stagesCopy = [...stages.value]
  const [draggedStage] = stagesCopy.splice(draggedIndex.value, 1)
  stagesCopy.splice(index, 0, draggedStage)
  stages.value = stagesCopy
  
  // 重置拖拽状态
  draggedIndex.value = -1
  draggedOverIndex.value = -1
}

const handleDragEnd = () => {
  draggedIndex.value = -1
  draggedOverIndex.value = -1
}

// 监听教学环节时间变化，更新总时间
watch(stages, (newStages) => {
  const totalMinutes = newStages.reduce((sum, stage) => sum + stage.time, 0)
  if (totalMinutes !== form.value.duration * 45) {
    form.value.duration = Math.ceil(totalMinutes / 45)
  }
}, { deep: true })

// 监听课时变化，调整教学环节时间
watch(() => form.value.duration, (newDuration) => {
  const totalMinutes = newDuration * 45
  const currentTotal = stages.value.reduce((sum, stage) => sum + stage.time, 0)
  
  if (currentTotal !== totalMinutes) {
    // 按比例调整各环节时间
    const ratio = totalMinutes / currentTotal
    stages.value = stages.value.map(stage => ({
      ...stage,
      time: Math.round(stage.time * ratio)
    }))
  }
})

const isResizing = ref(false)
const resizeDirection = ref('')
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)
const resizeStageIndex = ref(-1)

const startResize = (event: MouseEvent, index: number, direction: string) => {
  isResizing.value = true
  resizeDirection.value = direction
  resizeStartX.value = event.clientX
  resizeStartWidth.value = stages.value[index].time
  resizeStageIndex.value = index
  
  // 添加全局鼠标事件监听
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const timelineBar = document.querySelector('.timeline-bar')
  if (!timelineBar) return
  
  const barWidth = timelineBar.clientWidth
  const deltaX = event.clientX - resizeStartX.value
  const deltaMinutes = Math.round((deltaX / barWidth) * (form.value.duration * 45))
  
  if (resizeDirection.value === 'left') {
    // 调整左侧环节的时间
    if (resizeStageIndex.value > 0) {
      const prevStage = stages.value[resizeStageIndex.value - 1]
      const currentStage = stages.value[resizeStageIndex.value]
      
      // 确保时间不会小于5分钟
      if (currentStage.time - deltaMinutes >= 5 && prevStage.time + deltaMinutes >= 5) {
        currentStage.time -= deltaMinutes
        prevStage.time += deltaMinutes
      }
    }
  } else {
    // 调整右侧环节的时间
    if (resizeStageIndex.value < stages.value.length - 1) {
      const currentStage = stages.value[resizeStageIndex.value]
      const nextStage = stages.value[resizeStageIndex.value + 1]
      
      // 确保时间不会小于5分钟
      if (currentStage.time + deltaMinutes >= 5 && nextStage.time - deltaMinutes >= 5) {
        currentStage.time += deltaMinutes
        nextStage.time -= deltaMinutes
      }
    }
  }
  
  resizeStartX.value = event.clientX
}

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  resizeStartX.value = 0
  resizeStartWidth.value = 0
  resizeStageIndex.value = -1
  
  // 移除全局鼠标事件监听
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<style scoped>
.lesson-plan-container {
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

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.syllabus-source {
  margin-bottom: 16px;
}

.upload-section,
.history-section {
  width: 100%;
}

.upload-progress {
  margin-top: 8px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number {
  min-width: 40px;
  text-align: center;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 20px;
}

.preview-content {
  padding: 20px;
}

.preview-content h2 {
  text-align: center;
  margin-bottom: 20px;
}

.preview-content h3 {
  margin: 16px 0 8px;
}

.preview-content p {
  margin: 8px 0;
  line-height: 1.6;
}

.time-unit {
  margin-left: 8px;
  color: #909399;
}

.total-time {
  font-weight: bold;
  color: #409EFF;
}

.time-warning {
  margin-left: 8px;
  color: #E6A23C;
}

.el-rate {
  margin-top: 8px;
}

.timeline-bar {
  display: flex;
  height: 48px;
  margin: 24px 0 12px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px #0001;
  background: #f7f8fa;
  width: 100%;
  min-width: 600px;
  max-width: 100%;
}
.timeline-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  transition: width 0.3s;
  white-space: nowrap;
  border-right: 2px solid #fff;
  cursor: move;
  user-select: none;
}
.timeline-segment:last-child {
  border-right: none;
}
.resize-handle {
  position: absolute;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  transition: background-color 0.2s;
}
.resize-handle:hover {
  background: rgba(255, 255, 255, 0.6);
}
.resize-handle.left {
  left: 0;
}
.resize-handle.right {
  right: 0;
}
.timeline-segment.dragging {
  opacity: 0.5;
}
.timeline-segment.drag-over {
  border: 2px dashed #fff;
}
.timeline-label {
  width: 100%;
  text-align: center;
  padding: 0 8px;
  text-shadow: 0 1px 2px #0002;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.stages-list {
  display: flex;
  flex-direction: row;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.stage-card {
  background: #f7f8fa;
  border-radius: 8px;
  box-shadow: 0 1px 4px #0001;
  padding: 16px 18px 12px 18px;
  min-width: 220px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  position: relative;
}
.stage-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.stage-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stage-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.total-time-info {
  margin-top: 8px;
  font-size: 15px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-tag {
  margin-left: 8px;
}

.time-range-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-separator {
  color: #909399;
  font-size: 14px;
}
</style> 