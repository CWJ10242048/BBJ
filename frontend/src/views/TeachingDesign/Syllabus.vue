<template>
  <div class="syllabus-container">
    <h2>教学大纲设计</h2>
    
    <!-- 模板选择 -->
    <el-card class="box-card template-card">
      <template #header>
        <div class="card-header">
          <span>选择模板</span>
        </div>
      </template>
      <el-radio-group v-model="selectedTemplate" @change="handleTemplateChange">
        <el-radio-button label="default">默认模板</el-radio-button>
        <el-radio-button label="professional">专业课程模板</el-radio-button>
        <el-radio-button label="practice">实践课程模板</el-radio-button>
        <el-radio-button label="general">通识课程模板</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="课程性质" prop="courseType">
          <el-select v-model="form.courseType" placeholder="请选择课程性质">
            <el-option label="公共基础课程" value="public" />
            <el-option label="专业课程" value="professional" />
            <el-option label="选修课程" value="optional" />
            <el-option label="实践课程" value="practice" />
            <el-option label="通识教育课程" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="学时信息" prop="hours">
          <div class="hours-row">
            <div class="hours-block">
              <div class="hours-title">学分</div>
              <div class="number-control">
                <el-button size="small" @click="form.credits = Math.max(1, form.credits - 0.5)">-</el-button>
                <span class="number">{{ form.credits }}</span>
                <el-button size="small" @click="form.credits = Math.min(10, form.credits + 0.5)">+</el-button>
              </div>
              <el-slider
                v-model="form.credits"
                :min="1"
                :max="10"
                :step="0.5"
                :show-tooltip="true"
                class="long-slider"
              />
            </div>
            <div class="hours-block">
              <div class="hours-title">总学时</div>
              <div class="number-control">
                <el-button size="small" @click="form.totalHours = Math.max(16, form.totalHours - 8)">-</el-button>
                <span class="number">{{ form.totalHours }}</span>
                <el-button size="small" @click="form.totalHours = Math.min(128, form.totalHours + 8)">+</el-button>
              </div>
              <el-slider
                v-model="form.totalHours"
                :min="16"
                :max="128"
                :step="8"
                :show-tooltip="true"
                class="long-slider"
                @input="handleTotalHoursInput"
              />
            </div>
            <div class="hours-block">
              <div class="hours-title">实验学时</div>
              <div class="number-control">
                <el-button size="small" @click="form.labHours = Math.max(0, form.labHours - 4)">-</el-button>
                <span class="number">{{ form.labHours }}</span>
                <el-button size="small" @click="form.labHours = Math.min(form.totalHours, form.labHours + 4)">+</el-button>
              </div>
              <el-slider
                v-model="form.labHours"
                :min="0"
                :max="form.totalHours"
                :step="4"
                :show-tooltip="true"
                class="long-slider"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="适用专业" prop="targetStudents">
          <el-input
            v-model="form.targetStudents"
            type="textarea"
            :rows="2"
            placeholder="请输入适用专业"
          />
        </el-form-item>
        <!-- <el-form-item label="课程简介" prop="courseDescription">
          <el-input
            v-model="form.courseDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入课程简介"
          />
        </el-form-item> -->
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学方法与考核</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="教学方法" prop="teachingMethods">
          <el-checkbox-group v-model="form.teachingMethods">
            <el-checkbox label="讲授法">讲授法</el-checkbox>
            <el-checkbox label="案例教学">案例教学</el-checkbox>
            <el-checkbox label="讨论法">讨论法</el-checkbox>
            <el-checkbox label="实践教学">实践教学</el-checkbox>
            <el-checkbox label="项目教学">项目教学</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="教学手段" prop="teachingMeans">
          <el-checkbox-group v-model="form.teachingMeans">
            <el-checkbox label="多媒体教学">多媒体教学</el-checkbox>
            <el-checkbox label="网络教学">网络教学</el-checkbox>
            <el-checkbox label="实验教学">实验教学</el-checkbox>
            <el-checkbox label="实践教学">实践教学</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="考核方式" prop="assessmentMethods">
          <el-input
            v-model="form.assessmentMethods"
            type="textarea"
            :rows="3"
            placeholder="请输入考核方式"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 参考资料和自定义需求提前 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>参考资料</span>
          <el-switch
            v-model="showReferences"
            active-text="添加参考资料"
          />
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-if="showReferences">
        <el-form-item label="教材" prop="textbook">
          <div class="upload-container">
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="false"
              @change="handleFileChange"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              :before-upload="beforeUpload"
            >
              <el-button type="primary">选择文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持PDF、Word文档格式</div>
              </template>
            </el-upload>
            <el-progress
              v-if="uploadProgress > 0"
              :percentage="uploadProgress"
              :status="uploadStatus"
              class="upload-progress"
            />
            <div v-if="form.textbook" class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ form.textbook }}</span>
              <el-button type="danger" link @click="removeFile">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>
        <!-- <el-form-item label="参考书目" prop="referenceBooks">
          <el-input
            v-model="form.referenceBooks"
            type="textarea"
            :rows="3"
            placeholder="请输入参考书目"
          />
        </el-form-item> -->
        <el-form-item label="网络资源" prop="onlineResources">
          <el-input
            v-model="form.onlineResources"
            type="textarea"
            :rows="2"
            placeholder="请输入网络资源"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>自定义需求</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="特殊要求">
          <el-input
            v-model="form.customRequirements"
            type="textarea"
            :rows="4"
            placeholder="请输入您的特殊要求，如：课程特色、教学创新点等"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 教学内容卡片，右上角加自动生成按钮 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教学内容</span>
          <el-button type="primary" size="small" @click="handleAutoGenerateContent">自动生成</el-button>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="章节安排" prop="chapters">
          <el-input
            v-model="form.chapters"
            type="textarea"
            :rows="5"
            placeholder="请输入章节安排"
          />
        </el-form-item>
        <el-form-item label="重点难点" prop="keyPoints">
          <el-input
            v-model="form.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入重点难点"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSubmit">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="教学大纲预览"
      width="70%"
      destroy-on-close
    >
      <div class="preview-content">
        <h2>{{ form.courseName }}教学大纲</h2>
        <div v-for="(value, key) in form" :key="key">
          <h3>{{ getLabel(key) }}</h3>
          <p>{{ value }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'

const formRef = ref()
const previewVisible = ref(false)
const showReferences = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const selectedTemplate = ref('default')

const form = ref({
  courseName: '',
  courseType: '',
  credits: 2,
  totalHours: 32,
  labHours: 0,
  targetStudents: '',
  // courseDescription: '',
  // knowledgeObjectives: '',
  // abilityObjectives: '',
  // qualityObjectives: '',
  chapters: '',
  keyPoints: '',
  teachingMethods: [],
  teachingMeans: [],
  assessmentMethods: '',
  textbook: '',
  // referenceBooks: '',
  onlineResources: '',
  customRequirements: ''
})

const rules = {
  courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  courseType: [{ required: true, message: '请选择课程类型', trigger: 'change' }],
  credits: [{ required: true, message: '请输入学分', trigger: 'blur' }],
  totalHours: [{ required: true, message: '请输入总学时', trigger: 'blur' }],
  labHours: [{ required: true, message: '请输入实验学时', trigger: 'blur' }],
  // knowledgeObjectives: [{ required: true, message: '请输入知识目标', trigger: 'blur' }],
  // abilityObjectives: [{ required: true, message: '请输入能力目标', trigger: 'blur' }],
  // qualityObjectives: [{ required: true, message: '请输入素质目标', trigger: 'blur' }],
  chapters: [{ required: true, message: '请输入章节安排', trigger: 'blur' }],
  keyPoints: [{ required: true, message: '请输入重点难点', trigger: 'blur' }],
  teachingMethods: [{ required: true, type: 'array', min: 1, message: '请选择教学方法', trigger: 'change' }],
  teachingMeans: [{ required: true, type: 'array', min: 1, message: '请选择教学手段', trigger: 'change' }],
  assessmentMethods: [{ required: true, message: '请输入考核方式', trigger: 'blur' }],
}

// 模板预设内容
const templates = {
  default: {
    teachingMethods: ['讲授法', '案例教学'],
    teachingMeans: ['多媒体教学', '网络教学'],
    assessmentMethods: '平时成绩（30%）+ 期末考试（70%）'
  },
  professional: {
    teachingMethods: ['讲授法', '案例教学', '项目教学'],
    teachingMeans: ['多媒体教学', '实验教学', '实践教学'],
    assessmentMethods: '平时成绩（20%）+ 实验成绩（30%）+ 期末考试（50%）'
  },
  practice: {
    teachingMethods: ['实践教学', '项目教学'],
    teachingMeans: ['实验教学', '实践教学'],
    assessmentMethods: '平时成绩（40%）+ 实践报告（60%）'
  },
  general: {
    teachingMethods: ['讲授法', '讨论法'],
    teachingMeans: ['多媒体教学', '网络教学'],
    assessmentMethods: '平时成绩（40%）+ 期末论文（60%）'
  }
}

const handleTemplateChange = (template: string) => {
  const selected = templates[template]
  if (selected) {
    form.value.teachingMethods = selected.teachingMethods
    form.value.teachingMeans = selected.teachingMeans
    form.value.assessmentMethods = selected.assessmentMethods
  }
  // 自动设置课程性质
  if (template === 'professional') {
    form.value.courseType = 'professional'
  } else if (template === 'practice') {
    form.value.courseType = 'practice'
  } else if (template === 'general') {
    form.value.courseType = 'general'
  }
  // 默认模板不自动设置
}

const handleFileChange = (file: any) => {
  uploadProgress.value = 0
  uploadStatus.value = ''
  
  // 模拟上传进度，加快速度
  const timer = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += 20
    } else {
      clearInterval(timer)
      uploadStatus.value = 'success'
      ElMessage.success('上传成功')
      form.value.textbook = file.name
    }
  }, 100) // 加快上传速度
}

const removeFile = () => {
  form.value.textbook = ''
  uploadProgress.value = 0
  uploadStatus.value = ''
}

const getLabel = (key: string) => {
  const labelMap: Record<string, string> = {
    courseName: '课程名称',
    courseType: '课程类型',
    credits: '学分',
    totalHours: '总学时',
    labHours: '实验学时',
    targetStudents: '适用专业',
    // courseDescription: '课程简介',
    // knowledgeObjectives: '知识目标',
    // abilityObjectives: '能力目标',
    // qualityObjectives: '素质目标',
    chapters: '章节安排',
    keyPoints: '重点难点',
    teachingMethods: '教学方法',
    teachingMeans: '教学手段',
    assessmentMethods: '考核方式',
    textbook: '教材',
    // referenceBooks: '参考书目',
    onlineResources: '网络资源',
    customRequirements: '特殊需求'
  }
  return labelMap[key] || key
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

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.success('导出成功')
}

const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    courseName: '',
    courseType: '',
    credits: 2,
    totalHours: 32,
    labHours: 0,
    targetStudents: '',
    // courseDescription: '',
    // knowledgeObjectives: '',
    // abilityObjectives: '',
    // qualityObjectives: '',
    chapters: '',
    keyPoints: '',
    teachingMethods: [],
    teachingMeans: [],
    assessmentMethods: '',
    textbook: '',
    // referenceBooks: '',
    onlineResources: '',
    customRequirements: ''
  }
}

const handleTotalHoursInput = () => {
  // 处理总学时输入时的逻辑
}

let autoGenTimer: any = null

const handleAutoGenerateContent = () => {
  // 机器学习章节内容按段分割
  const chaptersArr = [
    '一、绪论',
    '介绍机器学习的基本术语、假设空间、归纳偏好等基础概念，并探讨其发展历程及应用现状。',
    '二、模型评估与选择',
    '讲解模型的评估方法、性能度量、偏差与方差的关系，如何避免过拟合，并介绍比较检验的方法。',
    '三、线性模型',
    '涵盖线性回归、对数几率回归、线性判别分析等内容，并讨论多分类问题和类别不平衡。',
    '四、决策树',
    '介绍决策树的基本流程、划分选择、剪枝处理等，以及如何处理连续和缺失值。',
    '五、神经网络',
    '讨论神经元模型、感知机与多层网络、误差逆传播算法等，并探讨深度学习的应用。',
    '六、支持向量机',
    '讲解支持向量机的基本理论、间隔、支持向量、核函数等，介绍支持向量回归及核方法。',
    '七、贝叶斯分类',
    '介绍贝叶斯决策论、极大似然估计、朴素贝叶斯分类器、EM算法等贝叶斯方法。',
    '八、集成学习',
    '讨论个体学习与集成学习的区别，介绍Boosting、Bagging、随机森林等集成学习方法。',
    '九、聚类',
    '探讨聚类的任务、性能度量、距离计算方法，介绍原型聚类、密度聚类和层次聚类。',
    '十、降维与度量学习',
    '涵盖k近邻学习、主成分分析（PCA）、核化线性降维、流形学习和度量学习等降维方法。',
    '十一、特征选择与稀疏学习',
    '讲解特征选择方法，包括子集搜索、过滤式选择、包裹式选择和嵌入式选择。',
    '十二、计算学习理论',
    '讨论PAC学习、VC维、Rademacher复杂度等基础理论，以及如何通过稳定性进行模型评估。',
    '十三、半监督学习',
    '探讨未标记样本的利用、半监督SVM、图半监督学习等方法。',
    '十四、概率图模型',
    '介绍隐马尔可夫模型、马尔可夫随机场、条件随机场等概率图模型。',
    '十五、规则学习',
    '讲解规则学习的基本概念和优化方法，包括一阶规则学习和归纳逻辑程序设计。',
    '十六、强化学习',
    '讨论强化学习的任务与奖赏、K-摇臂赌博机、有模型学习与免模型学习、值函数近似等。'
  ]
  const keyPointsArr = [
    '一、模型评估与选择',
    '理解过拟合、偏差-方差平衡的核心思想，掌握如何选择和评估模型性能。',
    '二、神经网络',
    '深度学习及误差逆传播算法的理解较为复杂，需要对神经网络的构建和优化有一定掌握。',
    '三、支持向量机',
    '核函数的理解和支持向量回归的应用，特别是在高维数据中的使用。',
    '四、集成学习',
    'Boosting与Bagging的区别，及其如何通过集成多模型来提高预测准确性。',
    '五、计算学习理论',
    'PAC学习和VC维的数学理论可能是较难理解的部分。',
    '六、强化学习',
    '强化学习的奖励机制、值函数近似、免模型学习等，需要具备较强的数学基础。'
  ]

  // 清空内容
  form.value.chapters = ''
  form.value.keyPoints = ''

  // 清除上一次的定时器
  if (autoGenTimer) clearTimeout(autoGenTimer)

  // 2秒后逐条显示
  let chapterIndex = 0
  let keyPointIndex = 0

  function showNextChapter() {
    if (chapterIndex < chaptersArr.length) {
      form.value.chapters += (chapterIndex > 0 ? '\n' : '') + chaptersArr[chapterIndex]
      chapterIndex++
      autoGenTimer = setTimeout(showNextChapter, 200)
    } else {
      // 章节显示完后再显示重点难点
      setTimeout(showNextKeyPoint, 200)
    }
  }
  function showNextKeyPoint() {
    if (keyPointIndex < keyPointsArr.length) {
      form.value.keyPoints += (keyPointIndex > 0 ? '\n' : '') + keyPointsArr[keyPointIndex]
      keyPointIndex++
      autoGenTimer = setTimeout(showNextKeyPoint, 200)
    }
  }

  setTimeout(showNextChapter, 2000)
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
</script>

<style scoped>
.syllabus-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hours-row {
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px 0 5px 0;
}

.hours-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 140px;
  max-width: 180px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px 4px 10px 4px;
  box-shadow: 0 1px 4px #0001;
}

.hours-title {
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  color: #222;
  text-align: center;
}

.number-control {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.number {
  display: inline-block;
  min-width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  color: #409EFF;
}

.long-slider {
  width: 160px;
  margin-bottom: 0;
}

.long-slider :deep(.el-slider__runway) {
  height: 6px;
}

.long-slider :deep(.el-slider__bar) {
  height: 6px;
}

.long-slider :deep(.el-slider__button) {
  width: 14px;
  height: 14px;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-progress {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-top: 10px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  margin-bottom: 30px;
}

.preview-content h3 {
  margin: 15px 0;
  color: #409EFF;
}

.preview-content p {
  margin: 10px 0;
  line-height: 1.6;
}

.upload-demo {
  margin-bottom: 10px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
