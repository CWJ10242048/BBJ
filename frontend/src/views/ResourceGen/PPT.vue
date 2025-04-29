<template>
  <div class="pptgen-container">
    <h2>PPT生成</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>PPT基本信息</span>
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
            :on-change="file => handleFileChange(file, 'syllabus')"
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
        <el-form-item label="教案" prop="lessonPlan">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'lessonPlan')"
            accept=".pdf,.doc,.docx"
          >
            <el-button size="small" type="primary">上传文件</el-button>
          </el-upload>
          <el-input
            v-model="form.lessonPlanText"
            type="textarea"
            :rows="3"
            placeholder="或直接粘贴教案文本"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="参考教材" prop="reference">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'reference')"
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
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-dialog v-model="previewVisible" title="PPT生成预览" width="60%" destroy-on-close>
      <div class="preview-content">
        <h2>{{ form.title || 'PPT预览' }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="PPT主题">{{ form.title }}</el-descriptions-item>
          <el-descriptions-item label="章节/用途">{{ form.usage }}</el-descriptions-item>
          <el-descriptions-item label="教学大纲">
            <span v-if="form.syllabusFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.syllabusText }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="教案">
            <span v-if="form.lessonPlanFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.lessonPlanText }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="参考教材">
            <span v-if="form.referenceFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.referenceText }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ form.remark }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref()
const previewVisible = ref(false)
const form = ref({
  title: '',
  usage: '',
  syllabusFile: [],
  syllabusText: '',
  lessonPlanFile: [],
  lessonPlanText: '',
  referenceFile: [],
  referenceText: '',
  remark: ''
})
const rules = {
  title: [{ required: true, message: '请输入PPT主题', trigger: 'blur' }],
  usage: [{ required: true, message: '请输入章节/用途', trigger: 'blur' }],
  syllabus: [
    { validator: (rule, value, callback) => {
      if (!form.value.syllabusFile.length && !form.value.syllabusText) {
        callback(new Error('请上传教学大纲文件或输入文本'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  lessonPlan: [
    { validator: (rule, value, callback) => {
      if (!form.value.lessonPlanFile.length && !form.value.lessonPlanText) {
        callback(new Error('请上传教案文件或输入文本'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const handleFileChange = (file, type) => {
  if (type === 'syllabus') form.value.syllabusFile = file.fileList
  if (type === 'lessonPlan') form.value.lessonPlanFile = file.fileList
  if (type === 'reference') form.value.referenceFile = file.fileList
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
    title: '',
    usage: '',
    syllabusFile: [],
    syllabusText: '',
    lessonPlanFile: [],
    lessonPlanText: '',
    referenceFile: [],
    referenceText: '',
    remark: ''
  }
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
</style>
