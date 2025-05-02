<template>
  <div class="interaction-container">
    <h2>互动环节设计</h2>

    <!-- 教案选择卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>教案选择</span>
          <el-button type="primary" size="small" @click="handleSearchLessonPlans">
            <el-icon><Search /></el-icon>
            浏览教案
          </el-button>
        </div>
      </template>
      <div class="lesson-plan-selection">
        <el-radio-group v-model="lessonPlanSource" size="small" class="source-selector">
          <el-radio-button label="history">历史教案</el-radio-button>
          <el-radio-button label="upload">上传教案</el-radio-button>
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
                <span>{{ item.name }}</span>
                <el-tag size="small" :type="getRecordTypeTag(item.type)">{{ item.type }}</el-tag>
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
            :on-change="(file: any) => handleFileChange(file, 'lessonPlan')"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          >
            <el-button type="primary">选择教案文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word、PPT等格式</div>
            </template>
          </el-upload>
          </div>
      </div>
    </el-card>

    <!-- 教学环节互动设计 -->
    <div v-if="selectedPlanInfo || manualStages.length > 0" class="teaching-stages-container">
      <div class="stages-header">
        <div class="header-title">
          <h3>教学环节互动设计</h3>
          <span v-if="isAIGenerated" class="ai-tag">
            <span class="ai-dot"></span>
            AI自动生成
          </span>
        </div>
        <el-button
          type="primary"
          size="small"
          @click="handleAutoGenerateAll"
          :disabled="typing"
        >
          {{ typing ? '生成中...' : '一键生成所有环节' }}
        </el-button>
      </div>
      <div class="stages-grid">
        <div
          v-for="stage in (selectedPlanInfo?.stages || manualStages)"
          :key="stage.id"
          class="stage-card"
        >
          <el-card class="stage-interaction-card">
      <template #header>
              <div class="stage-header">
                <span class="stage-title">{{ stage.name }}</span>
                <el-tag class="stage-duration-tag" type="info" effect="light">
                  <el-icon class="stage-duration-icon"><Clock /></el-icon>
                  <span class="stage-duration-num">{{ stage.time }}</span>
                  <span class="stage-duration-unit">分钟</span>
            </el-tag>
          </div>
            </template>
            <div class="stage-card-content">
            <el-form :model="stage.interaction" label-width="80px" size="small">
        <el-form-item label="互动类型">
                <el-select
                  v-model="stage.interaction.types"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择互动类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
        </el-form-item>

        <el-form-item label="互动风格">
                <el-select
                  v-model="stage.interaction.style"
                  placeholder="请选择互动风格"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in styleSelectOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
          </el-select>
        </el-form-item>

        <el-form-item label="互动时长">
                <div class="duration-row-center">
          <el-input-number
                    v-model="stage.interaction.duration"
                    :min="1"
                    :max="stage.time"
                    style="width: 90px"
          />
          <span class="unit">分钟</span>
                  <el-tag class="duration-percentage-tag" type="primary" effect="plain">
                    {{ Math.round((stage.interaction.duration / stage.time) * 100) }}%
                  </el-tag>
                </div>
        </el-form-item>

        <el-form-item label="参与人数">
                <div class="participants-container">
                  <el-input-number
                    v-model="stage.interaction.participants"
                    :min="1"
                    :max="50"
                    style="width: 120px"
                  />
          <span class="unit">人</span>
                </div>
        </el-form-item>

        <el-form-item label="难度级别">
          <div class="difficulty-row-center">
            <el-rate
              v-model="stage.interaction.difficulty"
              :max="5"
            />
            <span class="difficulty-label">
              {{ ['入门级', '基础级', '进阶级', '挑战级', '专家级'][stage.interaction.difficulty - 1] }}
            </span>
          </div>
        </el-form-item>

              <el-form-item class="stage-actions">
                <div style="width: 100%; display: flex; justify-content: center;">
                  <el-button
                    type="primary"
                    @click="handleEditStage(stage)"
                    class="edit-button"
                  >
                    编辑详细信息
                  </el-button>
                </div>
              </el-form-item>
      </el-form>
            </div>
    </el-card>
        </div>
      </div>
    </div>

    <div class="button-group">
      <el-button type="primary" @click="handleSave" :disabled="!selectedPlanInfo && manualStages.length === 0">保存</el-button>
      <el-button type="success" @click="handlePreview" :disabled="!isFormValid">预览</el-button>
      <el-button type="warning" :loading="exporting" @click="handleExport" :disabled="!isFormValid">
        {{ exporting ? '导出中...' : '导出' }}
          </el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="互动环节预览"
      width="60%"
      destroy-on-close
    >
      <div class="preview-content">
        <h2>互动环节方案</h2>
        <div v-for="stage in (selectedPlanInfo?.stages || manualStages)" :key="stage.id" class="preview-stage">
          <div class="preview-header">
            <div class="preview-stage-info">
              <el-tag type="success" effect="dark">{{ stage.name }}</el-tag>
              <span class="stage-time-label">{{ stage.time }}分钟</span>
            </div>
            <div class="preview-types">
              <el-tag v-for="type in stage.interaction.types" :key="type" effect="plain">{{ type }}</el-tag>
            </div>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="互动主题">{{ stage.interaction.topic }}</el-descriptions-item>
            <el-descriptions-item label="互动风格">{{ stage.interaction.style }}</el-descriptions-item>
            <el-descriptions-item label="互动时长">{{ stage.interaction.duration }} 分钟</el-descriptions-item>
            <el-descriptions-item label="参与人数">{{ stage.interaction.participants }}</el-descriptions-item>
            <el-descriptions-item label="难度级别">
              <el-rate
                v-model="stage.interaction.difficulty"
                disabled
                :max="5"
              />
            </el-descriptions-item>
            <el-descriptions-item label="互动目标">
              <pre class="desc-pre">{{ stage.interaction.objectives }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="互动流程">
              <pre class="desc-pre">{{ stage.interaction.procedure }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="评价标准">
              <pre class="desc-pre">{{ stage.interaction.evaluation }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="注意事项">
              <pre class="desc-pre">{{ stage.interaction.notes }}</pre>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑环节详细信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑 ${currentStage?.name} 详细信息`"
      width="60%"
      destroy-on-close
    >
      <el-form
        v-if="currentStage"
        :model="currentStage.interaction"
        label-width="100px"
        class="edit-form"
        label-position="top"
      >
        <el-form-item label="互动主题">
          <div class="form-input-container">
            <el-input
              v-model="currentStage.interaction.topic"
              type="textarea"
              :rows="2"
              placeholder="请输入互动主题"
            />
          </div>
        </el-form-item>

        <el-form-item label="互动目标">
          <div class="form-input-container">
            <el-input
              v-model="currentStage.interaction.objectives"
              type="textarea"
              :rows="3"
              placeholder="请输入互动目标"
            />
          </div>
        </el-form-item>

        <el-form-item label="互动流程">
          <div class="form-input-container">
            <el-input
              v-model="currentStage.interaction.procedure"
              type="textarea"
              :rows="5"
              placeholder="请输入互动流程"
            />
          </div>
        </el-form-item>

        <el-form-item label="评价标准">
          <div class="form-input-container">
            <el-input
              v-model="currentStage.interaction.evaluation"
              type="textarea"
              :rows="3"
              placeholder="请输入评价标准"
            />
          </div>
        </el-form-item>

        <el-form-item label="注意事项">
          <div class="form-input-container">
            <el-input
              v-model="currentStage.interaction.notes"
              type="textarea"
              :rows="2"
              placeholder="请输入注意事项"
            />
          </div>
        </el-form-item>

        <el-form-item label="相关文件">
          <div class="form-input-container">
            <el-upload
              class="upload-demo"
              :auto-upload="false"
              :show-file-list="true"
              :on-change="(file: any) => handleFileChange(file, 'stageFile')"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
            >
              <el-button type="primary">上传文件</el-button>
              <template #tip>
                <div class="el-upload__tip">支持PDF、Word、PPT等格式</div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveStageDetails">保存</el-button>
        </div>
            </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, 
  Delete, 
  Search, 
  Plus, 
  Close, 
  ChatDotRound,
  Edit,
  Clock
} from '@element-plus/icons-vue'
import axios from 'axios'
import { nanoid } from 'nanoid'
import * as docx from 'docx'
import { saveAs } from 'file-saver'

// 声明file-saver模块
declare module 'file-saver';

// 定义类型接口
interface Stage {
  id: string
  name: string
  time: number
  desc: string
  interaction: {
    types: string[]
    style: string
    duration: number
    participants: number
    difficulty: number
    topic: string
    objectives: string
    procedure: string
    evaluation: string
    notes: string
  }
}

interface Plan {
  id: string
  name: string
  type: string
  time: string
  stages: Stage[]
}

interface HistoryRecord {
  id: number
  content: string
  type: string
  time: string
}

interface UploadedPlan {
  name: string
  file: File
}

interface UploadFile {
  name: string
  raw: File
}

// 自动生成的内容模板
const autoContent = {
  objectives: `1. 帮助学生深入理解课程核心概念
2. 培养学生的批判性思维和问题解决能力
3. 促进学生之间的互动交流和团队协作
4. 提高学生的参与度和学习兴趣
5. 检验学生对知识点的掌握程度`,

  procedure: `1. 引入环节（5分钟）
   - 教师简要介绍互动主题
   - 明确互动目标和规则
   - 分组并分配任务

2. 互动实施（15分钟）
   - 学生按小组进行讨论和实践
   - 教师巡回指导，及时解答疑问
   - 鼓励学生积极表达观点

3. 成果展示（10分钟）
   - 各小组展示讨论成果
   - 教师点评和总结
   - 学生互评和反馈

4. 总结提升（5分钟）
   - 教师总结重点内容
   - 强调关键知识点
   - 布置课后思考题`,

  evaluation: `1. 参与度（30%）
   - 积极发言和讨论
   - 主动参与小组活动
   - 认真倾听他人观点

2. 内容质量（40%）
   - 观点明确，逻辑清晰
   - 论据充分，分析深入
   - 创新性和独特性

3. 团队协作（30%）
   - 分工明确，配合默契
   - 互相帮助，共同进步
   - 团队氛围融洽`,

  notes: `1. 确保互动环节时间控制得当
2. 注意维持课堂秩序和纪律
3. 关注每个学生的参与情况
4. 及时调整互动节奏和难度
5. 做好突发情况的应对预案`
}

// 教案选择相关
const lessonPlanSource = ref<'history' | 'upload'>('history')
const selectedHistoryPlan = ref('')
const uploadedPlan = ref<UploadedPlan | null>(null)
const manualStages = ref<Stage[]>([])
const selectedPlanInfo = ref<Plan | null>(null)
const lessonPlanDialogVisible = ref(false)

// 搜索筛选
const searchKeyword = ref('')
const filterType = ref('')
const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// 互动类型选项
const typeOptions = [
  { label: '课堂讨论', value: '课堂讨论' },
  { label: '小组活动', value: '小组活动' },
  { label: '角色扮演', value: '角色扮演' },
  { label: '案例分析', value: '案例分析' },
  { label: '游戏互动', value: '游戏互动' },
  { label: '问答互动', value: '问答互动' },
  { label: '头脑风暴', value: '头脑风暴' },
  { label: '团队竞赛', value: '团队竞赛' },
  { label: '辩论', value: '辩论' },
  { label: '情境模拟', value: '情境模拟' },
  { label: '案例研究', value: '案例研究' },
  { label: '小测验', value: '小测验' }
]

const styleSelectOptions = [
  '幽默风趣型', '严肃认真型', '亲切和蔼型', '热情洋溢型', '沉稳内敛型', '民主开放型', '引导启发型'
]

// 打字效果
const typing = ref(false)
const previewVisible = ref(false)
const exporting = ref(false)
const isAIGenerated = ref(false)

// 过滤后的历史记录
const filteredHistoryRecords = computed(() => {
  let records = historyRecords.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    records = records.filter(record => 
      record.content.toLowerCase().includes(keyword) ||
      record.type.toLowerCase().includes(keyword)
    )
  }

  if (filterType.value) {
    records = records.filter(record => record.type === filterType.value)
  }

  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value
    records = records.filter(record => {
      const recordDate = new Date(record.time).toISOString().split('T')[0]
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  return records
})

// 历史教案列表
const historyPlans = ref<Plan[]>([
  {
    id: '1',
    name: '计算机组成原理教案',
    type: '教案',
    time: '2025-05-10 15:32:10',
    stages: [
      { 
        id: 'stage1', 
        name: '复习旧知', 
        time: 10, 
        desc: '回顾上节课内容',
        interaction: {
          types: [],
          style: '',
          duration: 5,
          participants: 30,
          difficulty: 2,
          topic: '',
          objectives: '',
          procedure: '',
          evaluation: '',
          notes: ''
        }
      },
      { 
        id: 'stage2', 
        name: '导入新课', 
        time: 15, 
        desc: '引入新的知识点',
        interaction: {
          types: [],
          style: '',
          duration: 8,
          participants: 30,
          difficulty: 2,
          topic: '',
          objectives: '',
          procedure: '',
          evaluation: '',
          notes: ''
        }
      },
      { 
        id: 'stage3', 
        name: '讲解', 
        time: 35, 
        desc: '详细讲解课程核心内容',
        interaction: {
          types: [],
          style: '',
          duration: 15,
          participants: 30,
          difficulty: 3,
          topic: '',
          objectives: '',
          procedure: '',
          evaluation: '',
          notes: ''
        }
      },
      { 
        id: 'stage4', 
        name: '互动环节', 
        time: 20, 
        desc: '师生互动，加深理解',
        interaction: {
          types: [],
          style: '',
          duration: 15,
          participants: 30,
          difficulty: 3,
          topic: '',
          objectives: '',
          procedure: '',
          evaluation: '',
          notes: ''
        }
      },
      { 
        id: 'stage5', 
        name: '总结', 
        time: 10, 
        desc: '总结课程重点',
        interaction: {
          types: [],
          style: '',
          duration: 5,
          participants: 30,
          difficulty: 2,
          topic: '',
          objectives: '',
          procedure: '',
          evaluation: '',
          notes: ''
        }
      }
    ]
  }
])

// 获取历史记录的数据
const historyRecords = ref<HistoryRecord[]>([])
onMounted(async () => {
  try {
    historyRecords.value = [
      { id: 1, content: '《计算机组成原理教案》已生成，包含教学目标、重难点分析、教学过程等。', type: '教案', time: '2025-05-10 15:32:10' },
      { id: 2, content: '《Python编程基础PPT》自动生成，含代码示例和练习题。', type: 'PPT', time: '2025-05-10 14:58:22' },
      { id: 3, content: '《数据结构与算法习题集》已生成，包含常见题型及解析。', type: '习题', time: '2025-05-10 14:30:01' }
    ]
  } catch (error) {
    console.error('获取历史记录失败:', error)
    ElMessage.error('获取历史记录失败')
  }
})

// 选择历史教案
const handleHistoryPlanChange = (planId: string) => {
  const plan = historyPlans.value.find(p => p.id === planId)
  if (plan) {
    selectedPlanInfo.value = plan
  }
}

// 处理上传教案文件
const handleFileChange = (file: { name: string; raw: File }, type: string = 'lessonPlan') => {
  const allowedTypes = {
    lessonPlan: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    syllabus: ['pdf', 'doc', 'docx'],
    ppt: ['ppt', 'pptx', 'pdf'],
    reference: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png']
  }

  if (!isValidFileType(file.raw, allowedTypes[type as keyof typeof allowedTypes] || allowedTypes.lessonPlan)) {
    ElMessage.error('文件类型不支持')
    return false
  }

  if (type === 'lessonPlan') {
    uploadedPlan.value = {
      name: file.name,
      file: file.raw
    }
    ElMessage.success('教案文件上传成功')
  }
}

// 文件类型验证函数
const isValidFileType = (file: File, allowedTypes: string[]) => {
  const fileName = file.name.toLowerCase()
  return allowedTypes.some(type => fileName.endsWith(`.${type}`))
}

// 根据记录类型获取标签类型
const getRecordTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '教案': 'success',
    'PPT': 'warning',
    '习题': 'danger',
    '教学大纲': 'info',
    '图文': 'primary'
  }
  return typeMap[type] || ''
}

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 打开教案浏览对话框
const handleSearchLessonPlans = () => {
  lessonPlanDialogVisible.value = true
}

// 选择历史记录中的教案
const handleSelectRecord = (row: HistoryRecord) => {
  // 高亮选中行，不做其他操作
}

// 使用选中的历史记录
const handleUseRecord = (record: HistoryRecord) => {
  lessonPlanDialogVisible.value = false

  if (record.type === '教案') {
    selectedHistoryPlan.value = '1'
    handleHistoryPlanChange('1')
    lessonPlanSource.value = 'history'
    ElMessage.success(`已选择教案: ${record.content.split('》')[0].replace('《', '')}`)
  } else {
    ElMessage.warning('请选择类型为"教案"的记录')
  }
}

// 预览历史记录
const handlePreviewRecord = (record: HistoryRecord) => {
  ElMessageBox.alert(record.content, '内容预览', {
    confirmButtonText: '确定'
  })
}

// 一键生成所有环节
const handleAutoGenerateAll = async () => {
  typing.value = true
  const stages = selectedPlanInfo.value?.stages || manualStages.value

  ElMessageBox.confirm(
    '系统将使用AI为所有环节自动生成互动设计内容，是否继续？',
    'AI自动生成',
    {
      confirmButtonText: '继续生成',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(async () => {
    try {
      for (const stage of stages) {
        // 自动生成互动类型和风格（如果未选择）
        if (stage.interaction.types.length === 0) {
          suggestInteractionType(stage)
        }

        if (!stage.interaction.style) {
          const randomIndex = Math.floor(Math.random() * styleSelectOptions.length)
          stage.interaction.style = styleSelectOptions[randomIndex]
        }

        // 设置默认值
        stage.interaction.duration = Math.max(1, Math.floor(stage.time * 0.6))
        stage.interaction.participants = Math.max(1, Math.floor(Math.random() * 30) + 1)
        stage.interaction.difficulty = 3

        // 生成详细内容
        const name = stage.name.toLowerCase()
        let customTopic = ''
        if (name.includes('线性回归')) {
          customTopic = '线性回归模型的理解与应用'
        } else if (name.includes('讨论') || name.includes('互动')) {
          customTopic = `关于${stage.name}的深入探讨和思考`
        } else if (name.includes('案例')) {
          customTopic = `${stage.name}实例的分析与讨论`
        } else {
          customTopic = `${stage.name}知识点的互动理解`
        }

        stage.interaction.topic = customTopic
        stage.interaction.objectives = autoContent.objectives
        stage.interaction.procedure = autoContent.procedure
        stage.interaction.evaluation = autoContent.evaluation
        stage.interaction.notes = autoContent.notes

        await sleep(100)
      }

      isAIGenerated.value = true
      ElMessage.success('AI已成功生成所有环节互动内容')
    } finally {
      typing.value = false
    }
  }).catch(() => {
    typing.value = false
    ElMessage.info('已取消自动生成')
  })
}

// 根据环节名称建议互动类型
const suggestInteractionType = (stage: Stage) => {
  const name = stage.name.toLowerCase()
  stage.interaction.types = []

  if (name.includes('讨论') || name.includes('互动')) {
    stage.interaction.types.push('课堂讨论', '问答互动')
  } else if (name.includes('练习') || name.includes('实践')) {
    stage.interaction.types.push('小组活动', '案例分析')
  } else if (name.includes('案例')) {
    stage.interaction.types.push('案例分析', '案例研究')
  } else if (name.includes('总结') || name.includes('复习')) {
    stage.interaction.types.push('问答互动', '小测验')
  } else if (name.includes('导入') || name.includes('引入')) {
    stage.interaction.types.push('头脑风暴', '情境模拟')
  } else {
    stage.interaction.types.push('问答互动')
  }
}

// 预览单个环节
const handlePreviewStage = (stage: Stage) => {
  ElMessageBox.alert(
    `
    <div class="preview-stage-content">
      <h3>${stage.name} (${stage.time}分钟)</h3>
      <p><strong>互动类型：</strong>${stage.interaction.types.join('、')}</p>
      <p><strong>互动风格：</strong>${stage.interaction.style}</p>
      <p><strong>互动时长：</strong>${stage.interaction.duration}分钟</p>
      <p><strong>参与人数：</strong>${stage.interaction.participants}人</p>
      <p><strong>难度级别：</strong>${['入门级', '基础级', '进阶级', '挑战级', '专家级'][stage.interaction.difficulty - 1]}</p>
      <p><strong>互动主题：</strong>${stage.interaction.topic}</p>
      <p><strong>互动目标：</strong></p>
      <pre>${stage.interaction.objectives}</pre>
      <p><strong>互动流程：</strong></p>
      <pre>${stage.interaction.procedure}</pre>
      <p><strong>评价标准：</strong></p>
      <pre>${stage.interaction.evaluation}</pre>
      <p><strong>注意事项：</strong></p>
      <pre>${stage.interaction.notes}</pre>
    </div>
    `,
    '环节预览',
    {
      dangerouslyUseHTMLString: true,
      customClass: 'preview-dialog',
      confirmButtonText: '确定'
    }
  )
}

// 表单验证
const isFormValid = computed(() => {
  const stages = selectedPlanInfo.value?.stages || manualStages.value
  return stages.length > 0 && stages.every(stage => 
    stage.interaction.types.length > 0 &&
    stage.interaction.style &&
    stage.interaction.duration > 0 &&
    stage.interaction.participants > 0 &&
    stage.interaction.difficulty > 0
  )
})

// 保存
const handleSave = () => {
  if (!selectedPlanInfo.value && manualStages.value.length === 0) {
    ElMessage.warning('请先选择或上传教案')
    return
  }

  if (!isFormValid.value) {
    ElMessage.warning('请完善所有教学环节的互动设计')
    return
  }

  // 保存逻辑
  console.log('保存', selectedPlanInfo.value?.stages || manualStages.value)
  ElMessage.success('保存成功')
}

// 预览
const handlePreview = () => {
  if (!isFormValid.value) {
    ElMessage.warning('请完善所有教学环节的互动设计')
    return
  }

  previewVisible.value = true
}

// 导出
const handleExport = async () => {
  if (!isFormValid.value) {
    ElMessage.warning('请完善所有教学环节的互动设计')
    return
  }

  exporting.value = true
  try {
    // 创建Word文档
    const stages = selectedPlanInfo.value?.stages || manualStages.value
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new docx.Paragraph({
            text: `${selectedPlanInfo.value?.name || '互动环节设计'}方案`,
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // 基本信息
          new docx.Paragraph({
            text: '一、教案基本信息',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),
          
          new docx.Paragraph({
            children: [
              new docx.TextRun("教案名称："),
              new docx.TextRun(selectedPlanInfo.value?.name || '互动环节设计'),
            ],
          }),
          
          new docx.Paragraph({
            children: [
              new docx.TextRun("教案类型："),
              new docx.TextRun(selectedPlanInfo.value?.type || '互动教案'),
            ],
          }),
          
          new docx.Paragraph({
            children: [
              new docx.TextRun("生成时间："),
              new docx.TextRun(new Date().toLocaleString('zh-CN')),
            ],
          }),

          // 教学环节互动设计
          new docx.Paragraph({
            text: '二、教学环节互动设计',
            heading: docx.HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          // 针对每个环节
          ...stages.flatMap((stage, index) => {
            const stageNumber = index + 1;
            return [
              // 环节标题
              new docx.Paragraph({
                text: `环节${stageNumber}：${stage.name}（${stage.time}分钟）`,
                heading: docx.HeadingLevel.HEADING_3,
                spacing: {
                  before: 300,
                  after: 100,
                },
              }),
              
              // 基本信息表格
              new docx.Table({
                width: {
                  size: 100,
                  type: docx.WidthType.PERCENTAGE,
                },
                rows: [
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        width: {
                          size: 25,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph("互动类型")],
                        shading: {
                          fill: "F2F2F2",
                        },
                      }),
                      new docx.TableCell({
                        width: {
                          size: 75,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph(stage.interaction.types.join('、') || '无')],
                      }),
                    ],
                  }),
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        width: {
                          size: 25,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph("互动风格")],
                        shading: {
                          fill: "F2F2F2",
                        },
                      }),
                      new docx.TableCell({
                        width: {
                          size: 75,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph(stage.interaction.style || '无')],
                      }),
                    ],
                  }),
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        width: {
                          size: 25,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph("互动时长")],
                        shading: {
                          fill: "F2F2F2",
                        },
                      }),
                      new docx.TableCell({
                        width: {
                          size: 75,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph(`${stage.interaction.duration}分钟（占环节时间的${Math.round((stage.interaction.duration / stage.time) * 100)}%）`)],
                      }),
                    ],
                  }),
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        width: {
                          size: 25,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph("参与人数")],
                        shading: {
                          fill: "F2F2F2",
                        },
                      }),
                      new docx.TableCell({
                        width: {
                          size: 75,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph(`${stage.interaction.participants}人`)],
                      }),
                    ],
                  }),
                  new docx.TableRow({
                    children: [
                      new docx.TableCell({
                        width: {
                          size: 25,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph("难度级别")],
                        shading: {
                          fill: "F2F2F2",
                        },
                      }),
                      new docx.TableCell({
                        width: {
                          size: 75,
                          type: docx.WidthType.PERCENTAGE,
                        },
                        children: [new docx.Paragraph(['入门级', '基础级', '进阶级', '挑战级', '专家级'][stage.interaction.difficulty - 1] || '未设置')],
                      }),
                    ],
                  }),
                ],
              }),
              
              // 互动主题
              new docx.Paragraph({
                text: '互动主题',
                heading: docx.HeadingLevel.HEADING_4,
                spacing: {
                  before: 200,
                  after: 100,
                },
              }),
              new docx.Paragraph({
                text: stage.interaction.topic || '未设置',
              }),
              
              // 互动目标
              new docx.Paragraph({
                text: '互动目标',
                heading: docx.HeadingLevel.HEADING_4,
                spacing: {
                  before: 200,
                  after: 100,
                },
              }),
              ...(stage.interaction.objectives ? stage.interaction.objectives.split('\n')
                .filter((line: string) => line.trim())
                .map((obj: string) => new docx.Paragraph({
                  text: obj,
                })) : [new docx.Paragraph({ text: '未设置' })]),
              
              // 互动流程
              new docx.Paragraph({
                text: '互动流程',
                heading: docx.HeadingLevel.HEADING_4,
                spacing: {
                  before: 200,
                  after: 100,
                },
              }),
              ...(stage.interaction.procedure ? stage.interaction.procedure.split('\n')
                .filter((line: string) => line.trim())
                .map((proc: string) => new docx.Paragraph({
                  text: proc,
                })) : [new docx.Paragraph({ text: '未设置' })]),
              
              // 评价标准
              new docx.Paragraph({
                text: '评价标准',
                heading: docx.HeadingLevel.HEADING_4,
                spacing: {
                  before: 200,
                  after: 100,
                },
              }),
              ...(stage.interaction.evaluation ? stage.interaction.evaluation.split('\n')
                .filter((line: string) => line.trim())
                .map((evalText: string) => new docx.Paragraph({
                  text: evalText,
                })) : [new docx.Paragraph({ text: '未设置' })]),
              
              // 注意事项
              new docx.Paragraph({
                text: '注意事项',
                heading: docx.HeadingLevel.HEADING_4,
                spacing: {
                  before: 200,
                  after: 100,
                },
              }),
              ...(stage.interaction.notes ? stage.interaction.notes.split('\n')
                .filter((line: string) => line.trim())
                .map((note: string) => new docx.Paragraph({
                  text: note,
                })) : [new docx.Paragraph({ text: '未设置' })]),
              
              // 分隔线（除了最后一个环节）
              ...(index < stages.length - 1 ? [
                new docx.Paragraph({
                  children: [
                    new docx.TextRun({
                      text: "",
                      border: {
                        bottom: {
                          color: "#CCCCCC",
                          space: 1,
                          style: docx.BorderStyle.SINGLE,
                          size: 6,
                        },
                      }
                    })
                  ],
                  spacing: {
                    after: 200,
                  },
                }),
              ] : []),
            ];
          }),
          
          // 结束语
          new docx.Paragraph({
            text: '教学互动环节设计方案结束',
            alignment: docx.AlignmentType.CENTER,
            spacing: {
              before: 400,
            },
          }),
        ],
      }],
    });
    
    // 生成并保存文档
    docx.Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${selectedPlanInfo.value?.name || '互动环节设计'}方案.docx`);
      ElMessage.success('导出成功');
    });
    
  } catch (e) {
    console.error(e);
    ElMessage.error('导出失败');
  } finally {
    exporting.value = false;
  }
}

// 重置
const handleReset = () => {
  if (lessonPlanSource.value === 'history') {
    selectedHistoryPlan.value = ''
    selectedPlanInfo.value = null
  } else {
    uploadedPlan.value = null
    manualStages.value = []
  }

  ElMessage.success('已重置表单')
}

// 辅助函数
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// 编辑对话框相关
const editDialogVisible = ref(false)
const currentStage = ref<Stage | null>(null)

// 打开编辑对话框
const handleEditStage = (stage: Stage) => {
  currentStage.value = { ...stage }
  editDialogVisible.value = true
}

// 保存环节详细信息
const handleSaveStageDetails = () => {
  if (!currentStage.value) return
  
  const stage = selectedPlanInfo.value?.stages.find(s => s.id === currentStage.value?.id) ||
               manualStages.value.find(s => s.id === currentStage.value?.id)
  
  if (stage) {
    stage.interaction = { ...currentStage.value.interaction }
    ElMessage.success('保存成功')
  }
  
  editDialogVisible.value = false
}
</script>

<style scoped>
.interaction-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.box-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teaching-stages-container {
  margin-bottom: 20px;
}

.teaching-stages-container h3 {
  margin-bottom: 16px;
  color: #303133;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stage-card {
  margin-bottom: 20px;
}

.stage-interaction-card {
  border-radius: 8px;
}

.stage-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
  margin-bottom: 0;
  padding: 0 8px;
}

.stage-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  text-align: left;
}

.stage-duration-tag {
  background: #f4f8ff;
  color: #409eff;
  border: none;
  border-radius: 22px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 42px;
  box-shadow: 0 2px 8px 0 rgba(64,158,255,0.06);
  gap: 8px;
  min-width: 100px;
  justify-content: center;
}

.stage-duration-icon {
  font-size: 22px;
  margin-right: 4px;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  position: relative;
  top: 1px;
}

.stage-duration-num {
  font-size: 18px;
  font-weight: bold;
  margin: 0 2px 0 2px;
  letter-spacing: 1px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.stage-duration-unit {
  font-size: 15px;
  font-weight: 500;
  margin-left: 2px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.stage-card-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stage-card-content :deep(.el-form) {
  width: 100%;
}

.stage-interaction-card :deep(.el-card__body) {
  flex: 1;
  padding: 15px;
}

.stage-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.stage-actions :deep(.el-form-item__content) {
  justify-content: center;
}

.edit-button {
  width: auto;
  min-width: 180px;
  display: flex;
  margin: 0 auto;
  justify-content: center;
}

.edit-form {
  padding: 20px;
}

.edit-form :deep(.el-form-item__content) {
  display: flex;
  justify-content: center;
  width: 100%;
}

.form-input-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.form-input-container .el-input,
.form-input-container .el-textarea {
  width: 90%;
}

.edit-form :deep(.el-input), 
.edit-form :deep(.el-textarea),
.edit-form :deep(.el-input__wrapper),
.edit-form :deep(.el-textarea__inner) {
  width: 90%;
}

.edit-form :deep(.el-textarea__inner) {
  resize: none;
}

.edit-form :deep(.el-upload) {
  display: flex;
  justify-content: center;
  width: 90%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
}

.unit {
  margin-left: 10px;
  color: #606266;
}

.stage-time-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}

.upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 10px;
}

.upload-block {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7f8fa;
  border-radius: 6px;
  padding: 10px 12px;
}

.upload-label {
  min-width: 90px;
  color: #333;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.preview-stage {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-stage:last-child {
  margin-bottom: 0;
}

.preview-stage-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-types {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

/* 预览对话框样式 */
:deep(.preview-dialog) {
  width: 60%;
}

:deep(.preview-dialog .el-message-box__content) {
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.preview-stage-content) {
  padding: 20px;
}

:deep(.preview-stage-content h3) {
  margin-bottom: 16px;
  color: #303133;
}

:deep(.preview-stage-content p) {
  margin: 8px 0;
}

:deep(.preview-stage-content pre) {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  white-space: pre-wrap;
}

.stages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
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

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stage-card {
  height: 100%;
}

.stage-interaction-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}

.stage-card-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stage-card-content :deep(.el-form) {
  width: 100%;
}

.stage-interaction-card :deep(.el-card__body) {
  flex: 1;
  padding: 15px;
}

.stage-interaction-card :deep(.el-form-item) {
  margin-bottom: 15px;
}

.stage-interaction-card :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-upload__tip) {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-rate) {
  margin-top: 8px;
}

.duration-row-center {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.duration-percentage-tag {
  margin-left: 6px;
  font-size: 13px;
  border-radius: 12px;
  background: #f4f8ff;
  color: #409eff;
  border: none;
  font-weight: 500;
  padding: 0 8px;
  height: 24px;
  display: flex;
  align-items: center;
}

.source-selector {
  margin-bottom: 20px;
}
.history-section,
.upload-section {
  margin-top: 0;
}

/* 难度级别居中 */
.difficulty-row-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.difficulty-label {
  margin-left: 12px;
  font-weight: normal;
  font-size: 12px;
  line-height: 1;
  position: relative;
  top: -2px;
}

/* 微调星级评分向上 */
.difficulty-row-center .el-rate {
  position: relative;
  top: -6px;
}
</style>