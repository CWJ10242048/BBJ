<template>
  <div class="questiongen-container">
    <h2>智能出题</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>出题信息</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="出题模式" prop="mode">
          <el-radio-group v-model="form.mode">
            <el-radio label="单题">单题</el-radio>
            <el-radio label="整卷">整卷</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="题目难度" prop="difficulty">
          <el-rate v-model="form.difficulty" :max="5" />
        </el-form-item>
        <el-form-item label="题目类型" prop="type" v-if="form.mode==='单题'">
          <el-select v-model="form.type" placeholder="请选择题目类型">
            <el-option label="选择题" value="选择题" />
            <el-option label="填空题" value="填空题" />
            <el-option label="简答题" value="简答题" />
            <el-option label="编程题" value="编程题" />
            <el-option label="判断题" value="判断题" />
            <el-option label="综合题" value="综合题" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <template v-if="form.mode==='整卷'">
          <el-form-item label="题型分配">
            <div class="type-counts">
              <div v-for="item in typeList" :key="item.value" class="type-count-item">
                <span>{{ item.label }}</span>
                <el-input-number v-model="form.typeCounts[item.value]" :min="0" :max="100" size="small" style="width: 90px; margin-left: 8px;" />
              </div>
            </div>
          </el-form-item>
        </template>
        <el-form-item label="专业" prop="major">
          <el-select v-model="form.major" placeholder="请选择专业" filterable allow-create default-first-option>
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
            <el-option label="软件工程" value="软件工程" />
            <el-option label="数据科学与大数据技术" value="数据科学与大数据技术" />
            <el-option label="人工智能" value="人工智能" />
            <el-option label="网络工程" value="网络工程" />
            <el-option label="信息安全" value="信息安全" />
            <el-option label="物联网工程" value="物联网工程" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识点" prop="knowledge">
          <el-input v-model="form.knowledge" placeholder="请输入知识点，如：线性回归、排序算法等" />
        </el-form-item>
        <el-form-item label="题目语言" prop="lang">
          <el-select v-model="form.lang" placeholder="请选择题目语言">
            <el-option label="中文" value="中文" />
            <el-option label="英文" value="英文" />
            <el-option label="中英双语" value="中英双语" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含解析" prop="explain">
          <el-switch v-model="form.explain" active-text="是" inactive-text="否" />
        </el-form-item>
        <el-form-item label="题库文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'file')"
            accept=".xlsx,.csv,.txt,.doc,.docx,.pdf"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.fileDesc"
            type="textarea"
            :rows="2"
            placeholder="或输入题库描述文本"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="自定义要求">
          <el-input v-model="form.custom" type="textarea" :rows="2" placeholder="可填写特殊要求、出题风格等" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="previewVisible" title="智能出题预览" width="60%" destroy-on-close>
      <div class="preview-content">
        <h2>智能出题方案</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="出题模式">{{ form.mode }}</el-descriptions-item>
          <el-descriptions-item label="题目难度">{{ form.difficulty }} 星</el-descriptions-item>
          <el-descriptions-item v-if="form.mode==='单题'" label="题目类型">{{ form.type }}</el-descriptions-item>
          <el-descriptions-item v-if="form.mode==='整卷'" label="题型分配">
            <div>
              <div v-for="item in typeList" :key="item.value" v-if="form.typeCounts[item.value] > 0">
                {{ item.label }}：{{ form.typeCounts[item.value] }} 道
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="专业">{{ form.major }}</el-descriptions-item>
          <el-descriptions-item label="知识点">{{ form.knowledge }}</el-descriptions-item>
          <el-descriptions-item label="题目语言">{{ form.lang }}</el-descriptions-item>
          <el-descriptions-item label="包含解析">{{ form.explain ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="题库文件">
            <span v-if="form.fileList.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.fileDesc }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="自定义要求">{{ form.custom }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const typeList = [
  { label: '选择题', value: '选择题' },
  { label: '填空题', value: '填空题' },
  { label: '简答题', value: '简答题' },
  { label: '编程题', value: '编程题' },
  { label: '判断题', value: '判断题' },
  { label: '综合题', value: '综合题' },
  { label: '其他', value: '其他' }
]

const formRef = ref()
const previewVisible = ref(false)
const form = ref({
  mode: '单题',
  difficulty: 3,
  type: '',
  major: '',
  knowledge: '',
  // 整卷时各题型数量
  typeCounts: {
    选择题: 0,
    填空题: 0,
    简答题: 0,
    编程题: 0,
    判断题: 0,
    综合题: 0,
    其他: 0
  },
  lang: '中文',
  explain: true,
  fileList: [],
  fileDesc: '',
  custom: ''
})
const rules = {
  mode: [{ required: true, message: '请选择出题模式', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择题目难度', trigger: 'change' }],
  type: [{ required: true, message: '请选择题目类型', trigger: 'change', required: () => form.value.mode === '单题' }],
  major: [{ required: true, message: '请选择专业', trigger: 'change' }],
  knowledge: [{ required: true, message: '请输入知识点', trigger: 'blur' }],
  lang: [{ required: true, message: '请选择题目语言', trigger: 'change' }]
}
const handleFileChange = (file, type) => {
  if (type === 'file') form.value.fileList = file.fileList
}
const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    ElMessage.success('保存成功')
  } catch (e) {
    ElMessage.error('请填写完整信息')
  }
}
const handlePreview = () => {
  previewVisible.value = true
}
const handleExport = () => {
  ElMessage.success('导出成功')
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    mode: '单题',
    difficulty: 3,
    type: '',
    major: '',
    knowledge: '',
    typeCounts: {
      选择题: 0,
      填空题: 0,
      简答题: 0,
      编程题: 0,
      判断题: 0,
      综合题: 0,
      其他: 0
    },
    lang: '中文',
    explain: true,
    fileList: [],
    fileDesc: '',
    custom: ''
  }
}
</script>

<style scoped>
.questiongen-container {
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
.type-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
}
.type-count-item {
  display: flex;
  align-items: center;
  min-width: 180px;
  margin-bottom: 8px;
}
</style>
