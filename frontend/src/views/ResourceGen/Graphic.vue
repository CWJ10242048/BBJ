<template>
  <div class="graphicgen-container">
    <h2>图片生成</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>图片生成信息</span>
        </div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="图片类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择图片类型">
            <el-option label="概念图" value="概念图" />
            <el-option label="流程图" value="流程图" />
            <el-option label="思维导图" value="思维导图" />
            <el-option label="示意图" value="示意图" />
            <el-option label="图表" value="图表" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="图片大小" prop="size">
          <el-select v-model="form.size" placeholder="请选择图片大小" @change="handleSizeChange">
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
        <el-form-item label="风格" prop="style">
          <el-select v-model="form.style" placeholder="请选择风格">
            <el-option label="简约" value="简约" />
            <el-option label="卡通" value="卡通" />
            <el-option label="写实" value="写实" />
            <el-option label="手绘" value="手绘" />
            <el-option label="科技" value="科技" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用学科" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入适用学科" />
        </el-form-item>
        <el-form-item label="知识点" prop="knowledge">
          <el-input v-model="form.knowledge" placeholder="请输入知识点" />
        </el-form-item>
        <el-form-item label="参考图片文件">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="file => handleFileChange(file, 'image')"
            accept=".jpg,.jpeg,.png,.svg,.bmp,.gif,.webp"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
          <el-input
            v-model="form.imageDesc"
            type="textarea"
            :rows="2"
            placeholder="或输入图片描述文本"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="自定义要求">
          <el-input v-model="form.custom" type="textarea" :rows="2" placeholder="可填写特殊要求、风格等" />
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

    <el-dialog v-model="previewVisible" title="图片生成预览" width="60%" destroy-on-close>
      <div class="preview-content">
        <h2>图片生成方案</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="图片类型">{{ form.type }}</el-descriptions-item>
          <el-descriptions-item label="图片大小">{{ sizeText }}</el-descriptions-item>
          <el-descriptions-item label="风格">{{ form.style }}</el-descriptions-item>
          <el-descriptions-item label="适用学科">{{ form.subject }}</el-descriptions-item>
          <el-descriptions-item label="知识点">{{ form.knowledge }}</el-descriptions-item>
          <el-descriptions-item label="图片文件">
            <span v-if="form.imageFile.length">已上传文件</span>
            <pre v-else class="desc-pre">{{ form.imageDesc }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="自定义要求">{{ form.custom }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const formRef = ref()
const previewVisible = ref(false)
const exporting = ref(false)
const form = ref({
  type: '',
  size: '',
  customWidth: 800,
  customHeight: 600,
  style: '',
  subject: '',
  knowledge: '',
  imageFile: [],
  imageDesc: '',
  custom: ''
})
const rules = {
  type: [{ required: true, message: '请选择图片类型', trigger: 'change' }],
  size: [{ required: true, message: '请选择图片大小', trigger: 'change' }],
  style: [{ required: true, message: '请选择风格', trigger: 'change' }],
  subject: [{ required: true, message: '请输入适用学科', trigger: 'blur' }],
  knowledge: [{ required: true, message: '请输入知识点', trigger: 'blur' }]
}
const sizeText = computed(() => {
  if (form.value.size === 'custom') {
    return `${form.value.customWidth}x${form.value.customHeight}`
  }
  if (form.value.size) return form.value.size
  return ''
})
const handleSizeChange = val => {
  if (val !== 'custom') {
    form.value.customWidth = 800
    form.value.customHeight = 600
  }
}
const handleFileChange = (file, type) => {
  if (type === 'image') form.value.imageFile = file.fileList
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
const handleExport = async () => {
  exporting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒延迟
    const response = await axios.get('/api/export/graphic', {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], { type: response.headers['content-type'] })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '二叉树.jpg'
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
    type: '',
    size: '',
    customWidth: 800,
    customHeight: 600,
    style: '',
    subject: '',
    knowledge: '',
    imageFile: [],
    imageDesc: '',
    custom: ''
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
</style>
