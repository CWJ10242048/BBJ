<template>
  <div class="interaction-container">
    <h2>互动环节设计</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>互动环节信息</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="互动类型">
          <el-checkbox-group v-model="form.types">
            <el-checkbox v-for="item in typeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="互动风格">
          <el-select v-model="form.style" placeholder="请选择互动风格" style="width: 200px">
            <el-option v-for="item in styleSelectOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="互动时长">
          <el-input-number v-model="form.duration" :min="5" :max="60" />
          <span class="unit">分钟</span>
        </el-form-item>
        <el-form-item label="参与人数">
          <el-input-number v-model="form.participants" :min="2" :max="50" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>相关文件上传</span>
        </div>
      </template>
      <div class="upload-row">
        <div class="upload-block">
          <span class="upload-label">教学大纲文件：</span>
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'syllabus')"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </div>
        <div class="upload-block">
          <span class="upload-label">教案文件：</span>
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'lessonPlan')"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </div>
        <div class="upload-block">
          <span class="upload-label">教学PPT文件：</span>
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'ppt')"
            accept=".ppt,.pptx,.pdf"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </div>
        <div class="upload-block">
          <span class="upload-label">参考教程：</span>
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'reference')"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          >
            <el-button size="small" type="primary">选择文件</el-button>
          </el-upload>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>互动内容</span>
          <el-button type="primary" size="small" @click="handleAutoGenerateContent" :disabled="typing">自动生成</el-button>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="互动主题">
          <el-input
            v-model="form.topic"
            type="textarea"
            :rows="2"
            placeholder="请输入互动主题"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="互动目标">
          <el-input
            v-model="form.objectives"
            type="textarea"
            :rows="3"
            placeholder="请输入互动目标"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="互动流程">
          <el-input
            v-model="form.procedure"
            type="textarea"
            :rows="5"
            placeholder="请输入互动流程"
            :readonly="typing"
          />
        </el-form-item>
        <el-form-item label="评价标准">
          <el-input
            v-model="form.evaluation"
            type="textarea"
            :rows="3"
            placeholder="请输入评价标准"
            :readonly="typing"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
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
        <el-descriptions :column="1" border>
          <el-descriptions-item label="互动类型">{{ previewTypes }}</el-descriptions-item>
          <el-descriptions-item label="互动风格">{{ form.style }}</el-descriptions-item>
          <el-descriptions-item label="互动时长">{{ form.duration }} 分钟</el-descriptions-item>
          <el-descriptions-item label="参与人数">{{ form.participants }}</el-descriptions-item>
          <el-descriptions-item label="互动主题">{{ form.topic }}</el-descriptions-item>
          <el-descriptions-item label="互动目标">
            <pre class="desc-pre">{{ form.objectives }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="互动流程">
            <pre class="desc-pre">{{ form.procedure }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="评价标准">
            <pre class="desc-pre">{{ form.evaluation }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'

const typeOptions = [
  { label: '课堂讨论', value: 'discussion' },
  { label: '小组活动', value: 'group' },
  { label: '角色扮演', value: 'roleplay' },
  { label: '案例分析', value: 'case' },
  { label: '游戏互动', value: 'game' },
  { label: '问答互动', value: 'qa' },
  { label: '头脑风暴', value: 'brainstorm' },
  { label: '团队竞赛', value: 'competition' },
  { label: '辩论', value: 'debate' },
  { label: '情境模拟', value: 'simulation' },
  { label: '案例研究', value: 'study' },
  { label: '小测验', value: 'quiz' }
]
const styleSelectOptions = [
  '幽默风趣型', '严肃认真型', '亲切和蔼型', '热情洋溢型', '沉稳内敛型', '民主开放型', '引导启发型'
]
const form = ref({
  types: [],
  style: '',
  duration: 15,
  participants: 30,
  topic: '',
  objectives: '',
  procedure: '',
  evaluation: '',
  syllabusFile: [],
  lessonPlanFile: [],
  pptFile: [],
  referenceFile: []
})
const typing = ref(false)
const autoContent = {
  topic: '线性回归模型的理解与应用',
  objectives: `通过问答和头脑风暴，帮助学生深入理解线性回归的基本概念、原理和假设。\n能够让学生学会如何运用线性回归模型解决实际问题，包括数据预处理、模型训练、评估与优化等步骤。\n提高学生的团队能力和协作创新思维，培养他们解决实际问题的能力。`,
  procedure: `问答互动（7 分钟）\n教师提问：什么是线性回归？它的基本假设是什么？如何确定线性回归模型中的参数？（3 分钟）\n学生回答：学生举手回答，教师根据学生的回答进行点评和补充，引导学生进一步思考线性回归的关键点。（4 分钟）\n头脑风暴（8 分钟）\n教师提出问题：在实际应用中，如何处理不符合线性回归假设的数据？例如存在多重共线性、异方差性等问题时该怎么办？（2 分钟）\n学生分组讨论：学生分成小组，每组 5 - 6 人，围绕问题进行讨论，提出自己的想法和解决方案，并记录下来。（4 分钟）\n小组代表发言：每组选派一名代表进行发言，分享小组的讨论结果，其他小组可以进行补充和提问。（2 分钟）`,
  evaluation: `对线性回归概念和原理的理解程度（30 分）：能够准确阐述线性回归的定义、基本假设以及参数估计方法等。\n对实际问题的解决能力（40 分）：提出合理有效的解决方案来处理不符合线性回归假设的数据情况，包括数据预处理方法、模型改进措施等。\n团队协作与参与度（20 分）：小组成员积极参与讨论，分工明确，能够有效地共同完成任务。\n表达与沟通能力（10 分）：小组代表能够清晰、准确地表达小组的观点和想法，回答其他小组的提问。`
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
const handleAutoGenerateContent = async () => {
  typing.value = true
  form.value.topic = ''
  form.value.objectives = ''
  form.value.procedure = ''
  form.value.evaluation = ''
  await sleep(2000)
  for (let i = 0; i < autoContent.topic.length; i++) {
    form.value.topic += autoContent.topic[i]
    await nextTick(); await sleep(18)
  }
  for (let i = 0; i < autoContent.objectives.length; i++) {
    form.value.objectives += autoContent.objectives[i]
    await nextTick(); await sleep(18)
  }
  for (let i = 0; i < autoContent.procedure.length; i++) {
    form.value.procedure += autoContent.procedure[i]
    await nextTick(); await sleep(18)
  }
  for (let i = 0; i < autoContent.evaluation.length; i++) {
    form.value.evaluation += autoContent.evaluation[i]
    await nextTick(); await sleep(18)
  }
  typing.value = false
}

const handleFileChange = (file, type) => {
  if (type === 'syllabus') form.value.syllabusFile = file.fileList
  if (type === 'lessonPlan') form.value.lessonPlanFile = file.fileList
  if (type === 'ppt') form.value.pptFile = file.fileList
  if (type === 'reference') form.value.referenceFile = file.fileList
}

const previewVisible = ref(false)
const previewTypes = computed(() => {
  return form.value.types.map(val => {
    const found = typeOptions.find(i => i.value === val)
    return found ? found.label : val
  }).join('，')
})

const handleSave = () => {
  // 保存逻辑
  console.log('保存', form.value)
  ElMessage.success('保存成功')
}
const handlePreview = () => {
  previewVisible.value = true
}
const handleExport = () => {
  // 导出逻辑
  console.log('导出', form.value)
  ElMessage.success('导出成功')
}
const handleReset = () => {
  form.value = {
    types: [],
    style: '',
    duration: 15,
    participants: 30,
    topic: '',
    objectives: '',
    procedure: '',
    evaluation: '',
    syllabusFile: [],
    lessonPlanFile: [],
    pptFile: [],
    referenceFile: []
  }
}
</script>

<style scoped>
.interaction-container {
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

.unit {
  margin-left: 10px;
  color: #606266;
}

.custom-style-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
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
</style>
