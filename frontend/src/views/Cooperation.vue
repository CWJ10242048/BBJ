<template>
  <div class="coop-container">
    <h2>协作空间</h2>
    <div class="top-bar">
      <el-button type="primary" @click="dialogVisible = true">发起集体备课</el-button>
      <el-select v-model="filterSubject" placeholder="全部学科" style="width:140px;margin-left:20px;">
        <el-option label="全部学科" value="" />
        <el-option label="计算机" value="计算机" />
        <el-option label="数学" value="数学" />
        <el-option label="人工智能" value="人工智能" />
        <el-option label="大数据" value="大数据" />
      </el-select>
      <el-input v-model="filterKeyword" placeholder="搜索课题/主持人" style="width:200px;margin-left:20px;" clearable />
    </div>
    <div class="coop-list">
      <el-card v-for="item in filteredList" :key="item.id" class="coop-card">
        <div class="coop-title">{{ item.title }}</div>
        <div class="coop-meta">
          主持人：{{ item.host }} | 学科范围：{{ item.subject }} | 备课时间：{{ item.time }}
        </div>
        <div class="coop-desc">{{ item.desc }}</div>
        <el-button type="primary" size="small" style="float:right;margin-top:8px;" @click="handleEnter(item)">进入备课</el-button>
      </el-card>
    </div>
    <!-- <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button type="success" @click="handlePreview">预览</el-button>
      <el-button type="warning" @click="handleExport">导出</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div> -->
    <el-dialog v-model="dialogVisible" title="发起集体备课" width="480px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="课题名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入课题名称" />
        </el-form-item>
        <el-form-item label="主持人" prop="host">
          <el-input v-model="form.host" placeholder="请输入主持人姓名" />
        </el-form-item>
        <el-form-item label="学科范围" prop="subject">
          <el-select v-model="form.subject" placeholder="请选择学科">
            <el-option label="计算机" value="计算机" />
            <el-option label="数学" value="数学" />
            <el-option label="人工智能" value="人工智能" />
            <el-option label="大数据" value="大数据" />
          </el-select>
        </el-form-item>
        <el-form-item label="备课时间" prop="time">
          <el-date-picker v-model="form.time" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:100%" />
        </el-form-item>
        <el-form-item label="简介" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="false"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar,.py,.cpp,.java,.txt"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持PDF、Word、PPT、图片、代码等格式</div>
            </template>
          </el-upload>
          <div v-if="form.fileName" class="file-info">
            <el-icon><Document /></el-icon>
            <span class="file-name">{{ form.fileName }}</span>
            <el-button type="danger" link @click="removeFile">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align:right;margin-top:10px;">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">发起</el-button>
      </div>
    </el-dialog>
    <el-dialog v-model="previewVisible" title="协作课题预览" width="480px" destroy-on-close>
      <div class="preview-content">
        <h2 style="text-align:center;">{{ form.title }}</h2>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="主持人">{{ form.host }}</el-descriptions-item>
          <el-descriptions-item label="学科范围">{{ form.subject }}</el-descriptions-item>
          <el-descriptions-item label="备课时间">{{ form.time && form.time.length ? form.time[0] + ' 至 ' + form.time[1] : '' }}</el-descriptions-item>
          <el-descriptions-item label="简介"><pre class="desc-pre">{{ form.desc }}</pre></el-descriptions-item>
          <el-descriptions-item label="上传文件">
            <span v-if="form.fileName">已上传文件</span>
            <span v-else>无</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Delete } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const previewVisible = ref(false)
const formRef = ref()
const filterSubject = ref('')
const filterKeyword = ref('')
const form = ref({
  title: '',
  host: '',
  subject: '',
  time: [],
  desc: '',
  file: null,
  fileName: ''
})
const rules = {
  title: [{ required: true, message: '请输入课题名称', trigger: 'blur' }],
  host: [{ required: true, message: '请输入主持人', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
  time: [{ required: true, message: '请选择备课时间', trigger: 'change' }],
  desc: [{ required: true, message: '请输入简介', trigger: 'blur' }]
}

const coopList = ref([
  { id: 1, title: '数据结构', host: '李老师', subject: '计算机', time: '2025/03/01-至今', desc: '数据结构课程协作备课空间，共同设计教学方案和实验内容。' },
  { id: 2, title: '高等数学', host: '王老师', subject: '数学', time: '2025/02/15-至今', desc: '高等数学课程集体备课，聚焦难点讲解与案例分析。' },
  { id: 3, title: '人工智能基础', host: '赵老师', subject: '人工智能', time: '2025/04/01-至今', desc: '人工智能基础课程协作空间，涵盖算法、应用与实验。' },
  { id: 4, title: '大数据分析', host: '陈老师', subject: '大数据', time: '2025/03/10-至今', desc: '大数据分析课程集体备课，分享数据处理与可视化经验。' }
])

const filteredList = computed(() => {
  let list = coopList.value
  if (filterSubject.value) {
    list = list.filter(r => r.subject === filterSubject.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(r => r.title.toLowerCase().includes(kw) || r.host.toLowerCase().includes(kw))
  }
  return list
})

const handleFileChange = (file: any) => {
  form.value.file = file.raw
  form.value.fileName = file.name
  ElMessage.success('文件选择成功')
}
const removeFile = () => {
  form.value.file = null
  form.value.fileName = ''
}
const beforeUpload = (file: File) => {
  return true
}
const handleCreate = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    coopList.value.unshift({
      id: Date.now(),
      title: form.value.title,
      host: form.value.host,
      subject: form.value.subject,
      time: form.value.time && form.value.time.length ? form.value.time[0] + '-' + form.value.time[1] : '',
      desc: form.value.desc
    })
    dialogVisible.value = false
    formRef.value.resetFields()
    form.value = { title: '', host: '', subject: '', time: [], desc: '', file: null, fileName: '' }
    ElMessage.success('发起成功')
  } catch {
    ElMessage.error('请填写完整信息')
  }
}
const handleEnter = (item: any) => {
  ElMessage.success('进入协作空间（模拟）')
}
const handleSave = async () => {
  ElMessage.success('保存成功')
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
  form.value = { title: '', host: '', subject: '', time: [], desc: '', file: null, fileName: '' }
}
</script>

<style scoped>
.coop-container {
  padding: 20px;
}
.top-bar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.coop-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 32px;
}
.coop-card {
  background: #fcf9f7;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0001;
  padding: 22px 28px 18px 28px;
}
.coop-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #a55;
}
.coop-meta {
  font-size: 14px;
  color: #7a6d6d;
  margin-bottom: 4px;
}
.coop-desc {
  font-size: 15px;
  color: #444;
  margin-bottom: 8px;
  min-height: 32px;
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
.desc-pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
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
.upload-demo {
  margin-bottom: 10px;
}
.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>
