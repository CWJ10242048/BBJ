<template>
  <div class="notice-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <div>
            <el-input v-model="search.keyword" placeholder="搜索标题/内容" size="small" style="width: 200px; margin-right: 10px;" @input="handleSearch" clearable />
            <el-select v-model="search.status" placeholder="全部状态" size="small" style="width: 120px; margin-right: 10px;" @change="handleSearch" clearable>
              <el-option label="全部" value="" />
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已下架" value="offline" />
            </el-select>
            <el-button type="primary" size="small" @click="handleAdd">发布公告</el-button>
            <el-button type="danger" size="small" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button>
            <el-button size="small" @click="exportCSV">导出公告</el-button>
          </div>
        </div>
      </template>
      <el-table
        :data="pagedNoticeList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="publisher" label="发布人" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="top" label="置顶" width="70">
          <template #default="scope">
            <el-switch v-model="scope.row.top" @change="val=>handleTopChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="160" />
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button type="info" link @click="handleDetail(scope.row)">详情</el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="warning" link @click="handleStatus(scope.row)">{{ scope.row.status==='published' ? '下架' : '发布' }}</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="filteredNoticeList.length"
        layout="prev, pager, next, jumper"
        style="margin-top: 16px; text-align: right;"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 公告详情对话框 -->
    <el-dialog v-model="detailDialog.visible" title="公告详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ detailDialog.data.title }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ detailDialog.data.content }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ detailDialog.data.publisher }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusLabel(detailDialog.data.status) }}</el-descriptions-item>
        <el-descriptions-item label="置顶">{{ detailDialog.data.top ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailDialog.data.publishTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 公告发布/编辑对话框 -->
    <el-dialog v-model="editDialog.visible" :title="editDialog.type==='add'?'发布公告':'编辑公告'" width="500px">
      <el-form :model="editDialog.form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="editDialog.form.title" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="editDialog.form.content" type="textarea" :rows="5" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="发布人" required>
          <el-input v-model="editDialog.form.publisher" />
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch v-model="editDialog.form.top" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const statusMap = [
  { value: 'published', label: '已发布', tag: 'success' },
  { value: 'draft', label: '草稿', tag: 'info' },
  { value: 'offline', label: '已下架', tag: 'warning' }
]
function statusLabel(status) {
  const s = statusMap.find(s=>s.value===status)
  return s ? s.label : status
}
function statusTagType(status) {
  const s = statusMap.find(s=>s.value===status)
  return s ? s.tag : 'info'
}
const publisherPool = [
  '李老师', '王老师', '张老师', '刘老师', '陈老师', '赵老师', '孙老师', '周老师',
  '吴老师', '郑老师', '冯老师', '褚老师', '卫老师', '蒋老师', '沈老师', '韩老师',
  '杨老师', '朱老师', '钱老师', '秦老师', '管理员', '系统公告'
]
function getRandomFromArr(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}
const noticeTitlePool = [
  '关于期末考试安排的通知',
  '实验室安全须知',
  '2025年春季学期课程表发布',
  '计算机学院学术讲座预告',
  '关于毕业设计选题的说明',
  '五一劳动节放假安排',
  '新生入学教育安排',
  '关于评选优秀教师的通知',
  '网络安全宣传周活动',
  '关于教材领取的通知',
  '人工智能竞赛报名通知',
  '关于教室调整的公告',
  '寒假放假及返校安排',
  '关于学籍异动的说明',
  '计算机基础能力测试通知',
  '关于奖学金评定的通知',
  '关于四六级考试报名',
  '关于校园网维护的公告',
  '关于毕业论文答辩安排',
  '关于暑期社会实践的通知'
]
const noticeContentPool = [
  '请各位同学关注期末考试时间和地点安排，提前做好复习准备。',
  '进入实验室请务必遵守安全操作规程，佩戴好相关防护用品。',
  '2025年春季学期课程表已发布，请同学们及时查阅并合理安排学习计划。',
  '本周五下午将举办学术讲座，欢迎广大师生积极参加。',
  '毕业设计选题工作即将开始，请同学们提前与导师沟通。',
  '五一劳动节放假时间为5月1日至5月3日，请注意安全。',
  '新生入学教育将于下周一举行，具体安排请见附件。',
  '即日起启动优秀教师评选活动，欢迎大家踊跃推荐。',
  '本周为网络安全宣传周，将举办系列讲座和活动。',
  '教材领取时间为本周三下午，请携带学生证前往指定地点。',
  '人工智能竞赛报名通道已开启，欢迎同学们积极参与。',
  '因教学需要，部分教室将进行调整，具体安排请关注通知。',
  '寒假放假时间及返校安排已公布，请同学们合理安排行程。',
  '如有学籍异动需求，请及时联系教务处办理相关手续。',
  '将于下月举行计算机基础能力测试，请同学们做好准备。',
  '奖学金评定工作已启动，符合条件的同学请及时申报。',
  '四六级考试报名即将截止，请有需要的同学尽快报名。',
  '校园网将于本周末进行维护，期间可能出现短暂中断。',
  '毕业论文答辩安排已公布，请相关同学关注时间节点。',
  '暑期社会实践活动报名开始，欢迎同学们积极参与。'
]
const noticeList = ref(Array.from({length:40},(_,i)=>{
  return {
    id: i+1,
    title: noticeTitlePool[i%noticeTitlePool.length],
    content: noticeContentPool[i%noticeContentPool.length],
    publisher: getRandomFromArr(publisherPool),
    status: ['published','draft','offline'][i%3],
    top: Math.random()>0.8,
    publishTime: `2025-01-${(i%28+1).toString().padStart(2,'0')} ${(8+i%10).toString().padStart(2,'0')}:00:00`
  }
}))

const search = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 8 })
const multipleSelection = ref([])

const detailDialog = reactive({ visible: false, data: {} })
const editDialog = reactive({ visible: false, type: 'add', form: { id: null, title: '', content: '', publisher: '', top: false } })

const filteredNoticeList = computed(() => {
  let list = noticeList.value
  if (search.keyword) {
    list = list.filter(n => n.title.includes(search.keyword) || n.content.includes(search.keyword))
  }
  if (search.status) {
    list = list.filter(n => n.status === search.status)
  }
  // 置顶优先
  return list.slice().sort((a,b)=>Number(b.top)-Number(a.top))
})

const pagedNoticeList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredNoticeList.value.slice(start, start + pagination.pageSize)
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
function handleAdd() {
  editDialog.type = 'add'
  Object.assign(editDialog.form, { id: null, title: '', content: '', publisher: '', top: false })
  editDialog.visible = true
}
function handleEdit(row) {
  editDialog.type = 'edit'
  Object.assign(editDialog.form, row)
  editDialog.visible = true
}
function handleDetail(row) {
  detailDialog.data = row
  detailDialog.visible = true
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = noticeList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      noticeList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}
function handleBatchDelete() {
  ElMessageBox.confirm('确定要批量删除选中的公告吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    multipleSelection.value.forEach(row => {
      const index = noticeList.value.findIndex(item => item.id === row.id)
      if (index !== -1) noticeList.value.splice(index, 1)
    })
    ElMessage.success('批量删除成功')
    multipleSelection.value = []
  })
}
function handleStatus(row) {
  if(row.status==='published') {
    row.status = 'offline'
    ElMessage.success('已下架')
  } else {
    row.status = 'published'
    ElMessage.success('已发布')
  }
}
function handleTopChange(row) {
  // 置顶切换后自动排序
  noticeList.value = noticeList.value.slice().sort((a,b)=>Number(b.top)-Number(a.top))
}
function submitEdit() {
  if(!editDialog.form.title || !editDialog.form.content || !editDialog.form.publisher) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if(editDialog.type==='add') {
    noticeList.value.unshift({
      id: Date.now(),
      ...editDialog.form,
      status: 'published',
      publishTime: new Date().toLocaleString()
    })
    ElMessage.success('公告发布成功')
  } else {
    const idx = noticeList.value.findIndex(n=>n.id===editDialog.form.id)
    if(idx!==-1) {
      noticeList.value[idx] = { ...editDialog.form }
      ElMessage.success('公告编辑成功')
    }
  }
  editDialog.visible = false
}
function exportCSV() {
  const header = ['标题','内容','发布人','状态','置顶','发布时间']
  const rows = noticeList.value.map(n=>[n.title,n.content,n.publisher,statusLabel(n.status),n.top?'是':'否',n.publishTime])
  const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '公告列表.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.notice-container {
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
</style> 