<template>
  <div class="resource-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>资源管理</span>
          <div>
            <el-input v-model="search.keyword" placeholder="搜索资源名称" size="small" style="width: 200px; margin-right: 10px;" @input="handleSearch" clearable />
            <el-select v-model="search.type" placeholder="全部类型" size="small" style="width: 120px; margin-right: 10px;" @change="handleSearch" clearable>
              <el-option label="全部" value="" />
              <el-option label="教学大纲" value="syllabus" />
              <el-option label="教案" value="plan" />
              <el-option label="习题" value="exercise" />
              <el-option label="PPT" value="ppt" />
              <el-option label="互动环节设计" value="interaction" />
              <el-option label="图片" value="image" />
              <el-option label="视频" value="video" />
            </el-select>
            <el-button type="primary" size="small" @click="handleUpload">上传资源</el-button>
            <el-button type="danger" size="small" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button>
            <el-button size="small" @click="exportCSV">导出资源</el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="pagedResourceList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="资源名称" />
        <el-table-column prop="type" label="资源类型">
          <template #default="scope">
            <el-tag :type="typeTagType(scope.row.type)">{{ typeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传人" />
        <el-table-column prop="size" label="大小" />
        <el-table-column prop="uploadTime" label="上传时间" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" width="320">
          <template #default="scope">
            <el-button type="primary" link @click="handlePreview(scope.row)">预览</el-button>
            <el-button type="success" link @click="handleDownload(scope.row)">下载</el-button>
            <el-button type="info" link @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="warning" link @click="handleRename(scope.row)">重命名</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="filteredResourceList.length"
        layout="prev, pager, next, jumper"
        style="margin-top: 16px; text-align: right;"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 上传资源对话框 -->
    <el-dialog v-model="dialogVisible" title="上传资源" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :action="uploadAction"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeUpload"
        :show-file-list="false"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 jpg/png/mp4/pdf/doc/ppt 格式文件，最大100MB
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 资源详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="资源详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="资源名称">{{ detailDialog.data.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ typeLabel(detailDialog.data.type) }}</el-descriptions-item>
        <el-descriptions-item label="上传人">{{ detailDialog.data.uploader }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ detailDialog.data.size }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ detailDialog.data.uploadTime }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailDialog.data.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 资源重命名对话框 -->
    <el-dialog v-model="renameDialog.visible" title="重命名资源" width="400px">
      <el-form :model="renameDialog.form" label-width="80px">
        <el-form-item label="新名称" required>
          <el-input v-model="renameDialog.form.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRename">确定</el-button>
      </template>
    </el-dialog>

    <!-- 资源预览对话框 -->
    <el-dialog v-model="previewDialog.visible" :title="'预览 - ' + previewDialog.data.name" width="700px" top="5vh">
      <div v-if="previewDialog.data.type === 'image'">
        <img :src="previewDialog.data.url" alt="图片预览" style="max-width:100%;max-height:60vh;display:block;margin:auto;" />
      </div>
      <div v-else-if="previewDialog.data.type === 'video'">
        <video :src="previewDialog.data.url" controls style="max-width:100%;max-height:60vh;display:block;margin:auto;" />
      </div>
      <div v-else>
        <el-empty description="暂不支持该类型预览" />
      </div>
      <template #footer>
        <el-button @click="previewDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const resourceTypes = [
  { type: 'syllabus', label: '教学大纲', tag: 'info' },
  { type: 'plan', label: '教案', tag: 'primary' },
  { type: 'exercise', label: '习题', tag: 'success' },
  { type: 'ppt', label: 'PPT', tag: 'warning' },
  { type: 'interaction', label: '互动环节设计', tag: 'danger' },
  { type: 'image', label: '图片', tag: 'default' },
  { type: 'video', label: '视频', tag: 'default' }
]

function typeLabel(type) {
  const t = resourceTypes.find(t => t.type === type)
  return t ? t.label : type
}
function typeTagType(type) {
  const t = resourceTypes.find(t => t.type === type)
  return t ? t.tag : 'info'
}

// 计算机相关资源名称库
const resourceNamePool = {
  syllabus: [
    '机器学习课程大纲', '数据结构课程大纲', '操作系统课程大纲', '计算机网络课程大纲', '人工智能课程大纲',
    '数据库系统课程大纲', '编译原理课程大纲', '软件工程课程大纲', '算法分析课程大纲', '信息安全课程大纲'
  ],
  plan: [
    '计算机组成原理运算器教案', '操作系统进程管理教案', '数据结构链表教案', '数据库事务管理教案',
    '人工智能搜索算法教案', '软件工程需求分析教案', '算法复杂度分析教案', '网络协议分层教案',
    '编译原理词法分析教案', '信息安全加密算法教案'
  ],
  exercise: [
    '数据结构栈与队列习题', '操作系统内存管理习题', '计算机网络路由算法习题', '机器学习回归习题',
    '数据库SQL习题', '编译原理语法分析习题', '软件工程测试习题', '人工智能推理习题',
    '算法设计递归习题', '信息安全认证习题'
  ],
  ppt: [
    '深度学习PPT', '操作系统进程调度PPT', '数据结构树PPT', '数据库范式PPT',
    '人工智能神经网络PPT', '软件工程项目管理PPT', '算法分析动态规划PPT', '网络安全PPT',
    '编译原理语法制导PPT', '信息安全攻防PPT'
  ],
  interaction: [
    '操作系统抢答互动', '数据结构小组讨论', '计算机网络案例分析', '机器学习课堂问答',
    '数据库设计头脑风暴', '编译原理知识竞赛', '软件工程项目演示', '人工智能实验互动',
    '算法分析分组挑战', '信息安全实战演练'
  ],
  image: [
    '神经网络结构图', '计算机硬件结构图', '数据结构流程图', '网络拓扑图',
    '操作系统内存分布图', '数据库E-R图', '编译原理自动机图', '软件工程UML图',
    '算法流程图', '信息安全加密流程图'
  ],
  video: [
    '机器学习算法讲解视频', '操作系统实验视频', '数据结构课程视频', '数据库系统演示视频',
    '人工智能案例视频', '软件工程开发流程视频', '算法分析讲座视频', '网络安全攻防视频',
    '编译原理实验视频', '信息安全实训视频'
  ]
}
const uploaderPool = [
  '李老师', '王老师', '张老师', '刘老师', '陈老师', '赵老师', '孙老师', '周老师',
  '吴老师', '郑老师', '冯老师', '褚老师', '卫老师', '蒋老师', '沈老师', '韩老师',
  '杨老师', '朱老师', '钱老师', '秦老师', '用户A', '用户B', '用户C', '用户D'
]
function getRandomFromArr(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}
function randomSize(type) {
  if(type==='image') return (Math.random()*2+0.2).toFixed(2)+'MB'
  if(type==='video') return (Math.random()*80+10).toFixed(2)+'MB'
  if(type==='ppt') return (Math.random()*5+1).toFixed(2)+'MB'
  return (Math.random()*1+0.1).toFixed(2)+'MB'
}
function randomDesc(type) {
  const map = {
    syllabus: '课程结构与目标说明', plan: '详细教学流程', exercise: '课后练习题', ppt: '课件幻灯片', interaction: '课堂互动设计', image: '教学相关图片', video: '教学相关视频'
  }
  return map[type]
}
function randomUrl(type, idx) {
  if(type==='image') return `https://picsum.photos/seed/${idx}/600/400`
  if(type==='video') return 'https://www.w3schools.com/html/mov_bbb.mp4'
  return ''
}
const resourceList = ref(Array.from({length:100},(_,i)=>{
  const types = Object.keys(resourceNamePool)
  const type = getRandomFromArr(types)
  const nameArr = resourceNamePool[type]
  const name = nameArr[i%nameArr.length] + (Math.floor(i/nameArr.length)+1)
  return {
    id: i+1,
    name,
    type,
    uploader: getRandomFromArr(uploaderPool),
    size: randomSize(type),
    uploadTime: `2025-01-${(i%28+1).toString().padStart(2,'0')} ${(8+i%10).toString().padStart(2,'0')}:00:00`,
    description: randomDesc(type),
    url: randomUrl(type,i+1)
  }
}))

const search = reactive({ keyword: '', type: '' })
const pagination = reactive({ page: 1, pageSize: 10 })
const multipleSelection = ref([])

const dialogVisible = ref(false)
const uploadAction = '/api/upload' // 实际开发请替换

const detailDialog = reactive({ visible: false, data: {} })
const renameDialog = reactive({ visible: false, form: { id: null, name: '' } })
const previewDialog = reactive({ visible: false, data: {} })

const filteredResourceList = computed(() => {
  let list = resourceList.value
  if (search.keyword) {
    list = list.filter(r => r.name.includes(search.keyword))
  }
  if (search.type) {
    list = list.filter(r => r.type === search.type)
  }
  return list
})

const pagedResourceList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredResourceList.value.slice(start, start + pagination.pageSize)
})

function handleSearch() {
  pagination.page = 1
}

function handlePageChange(page) {
  pagination.page = page
}

function handleSelectionChange(val) {
  multipleSelection.value = val
}

function handleUpload() {
  dialogVisible.value = true
}

function handleDownload(row) {
  ElMessage.success('开始下载：' + row.name)
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该资源吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = resourceList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      resourceList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

function handleBatchDelete() {
  ElMessageBox.confirm('确定要批量删除选中的资源吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    multipleSelection.value.forEach(row => {
      const index = resourceList.value.findIndex(item => item.id === row.id)
      if (index !== -1) resourceList.value.splice(index, 1)
    })
    ElMessage.success('批量删除成功')
    multipleSelection.value = []
  })
}

function handleSuccess(response, file) {
  ElMessage.success('上传成功')
  dialogVisible.value = false
  // 添加到资源列表
  const ext = file.name.split('.').pop().toLowerCase()
  let type = 'plan'
  if(['jpg','jpeg','png','gif'].includes(ext)) type = 'image'
  else if(['mp4','avi','mov'].includes(ext)) type = 'video'
  else if(['ppt','pptx'].includes(ext)) type = 'ppt'
  else if(['pdf','doc','docx'].includes(ext)) type = 'syllabus'
  resourceList.value.unshift({
    id: Date.now(),
    name: file.name,
    type,
    uploader: getRandomFromArr(uploaderPool),
    size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    uploadTime: new Date().toLocaleString(),
    description: '',
    url: type==='image'?URL.createObjectURL(file):''
  })
}

function handleError() {
  ElMessage.error('上传失败')
}

function beforeUpload(file) {
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('上传文件大小不能超过 100MB!')
    return false
  }
  return true
}

function handlePreview(row) {
  if(row.type==='image'||row.type==='video') {
    previewDialog.data = row
    previewDialog.visible = true
  } else {
    ElMessage.info('暂不支持该类型预览')
  }
}

function handleDetail(row) {
  detailDialog.data = row
  detailDialog.visible = true
}

function handleRename(row) {
  renameDialog.form.id = row.id
  renameDialog.form.name = row.name
  renameDialog.visible = true
}

function submitRename() {
  const idx = resourceList.value.findIndex(r=>r.id===renameDialog.form.id)
  if(idx!==-1 && renameDialog.form.name) {
    resourceList.value[idx].name = renameDialog.form.name
    ElMessage.success('重命名成功')
    renameDialog.visible = false
  }
}

function exportCSV() {
  const header = ['资源名称','类型','上传人','大小','上传时间','描述']
  const rows = resourceList.value.map(r=>[r.name,typeLabel(r.type),r.uploader,r.size,r.uploadTime,r.description])
  const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '资源列表.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.resource-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}
</style> 