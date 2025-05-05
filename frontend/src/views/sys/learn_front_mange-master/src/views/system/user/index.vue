<template>
  <div class="user-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ userList.length }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>管理员</span>
              <el-icon><UserFilled /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ userList.filter(u => u.role === 'admin').length }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>教师</span>
              <el-icon><School /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ userList.filter(u => u.role === 'teacher').length }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>禁用用户</span>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ userList.filter(u => u.status === '禁用').length }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作区域 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加用户
            </el-button>
            <el-button type="success" @click="handleImport">
              <el-icon><Upload /></el-icon>导入用户
            </el-button>
            <el-button type="danger" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>批量删除
            </el-button>
            <el-button @click="exportCSV">
              <el-icon><Download /></el-icon>导出用户
            </el-button>
          </div>
          <div class="right">
            <el-button type="primary" link @click="showAdvancedSearch = !showAdvancedSearch">
              <el-icon><Search /></el-icon>高级搜索
            </el-button>
          </div>
        </div>
      </template>

      <!-- 高级搜索表单 -->
      <el-collapse-transition>
        <div v-show="showAdvancedSearch" class="advanced-search">
          <el-form :model="advancedSearch" label-width="80px" class="search-form">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="用户名">
                  <el-input v-model="advancedSearch.username" placeholder="请输入用户名" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="邮箱">
                  <el-input v-model="advancedSearch.email" placeholder="请输入邮箱" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="手机号">
                  <el-input v-model="advancedSearch.phone" placeholder="请输入手机号" clearable />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="角色">
                  <el-select v-model="advancedSearch.role" placeholder="请选择角色" clearable>
                    <el-option label="管理员" value="admin" />
                    <el-option label="教师" value="teacher" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="状态">
                  <el-select v-model="advancedSearch.status" placeholder="请选择状态" clearable>
                    <el-option label="正常" value="正常" />
                    <el-option label="禁用" value="禁用" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="创建时间">
                  <el-date-picker
                    v-model="advancedSearch.createTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" class="search-buttons">
                <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
                <el-button @click="resetAdvancedSearch">重置</el-button>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </el-collapse-transition>

      <!-- 用户表格 -->
      <el-table
        :data="pagedUserList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        border
        stripe
        highlight-current-row
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="用户信息" min-width="200">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar || defaultAvatar">
                {{ scope.row.username.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <el-link type="primary" @click="showDetail(scope.row)">{{ scope.row.username }}</el-link>
                <div class="user-email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'" effect="dark">
              {{ scope.row.role === 'admin' ? '管理员' : '教师' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="status" label="状态" width="100" sortable>
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="正常"
              inactive-value="禁用"
              @change="val=>handleStatusChange(scope.row)"
              :disabled="scope.row.role === 'admin'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" min-width="160" sortable>
          <template #default="scope">
            <el-tooltip :content="scope.row.lastLogin" placement="top">
              <span>{{ formatDate(scope.row.lastLogin) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" min-width="160" sortable>
          <template #default="scope">
            <el-tooltip :content="scope.row.createTime" placement="top">
              <span>{{ formatDate(scope.row.createTime) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button v-if="scope.row.role !== 'admin'" type="warning" link @click="handleResetPwd(scope.row)">
                <el-icon><Key /></el-icon>重置密码
              </el-button>
              <el-button v-if="scope.row.role !== 'admin'" type="danger" link @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredUserList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户详情弹窗 -->
    <el-dialog v-model="detailDialog.visible" title="用户详情" width="500px">
      <div class="user-detail">
        <div class="user-avatar">
          <el-avatar :size="80" :src="detailDialog.data.avatar || defaultAvatar">
            {{ detailDialog.data.username?.charAt(0) }}
          </el-avatar>
        </div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">{{ detailDialog.data.username }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="detailDialog.data.role === 'admin' ? 'danger' : 'primary'" effect="dark">
              {{ detailDialog.data.role === 'admin' ? '管理员' : '教师' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailDialog.data.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailDialog.data.phone }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detailDialog.data.status === '正常' ? 'success' : 'danger'">
              {{ detailDialog.data.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ detailDialog.data.lastLogin }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailDialog.data.remark || '无' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailDialog.data.createTime }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="正常" />
            <el-option label="禁用" value="禁用" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      v-model="resetPwdDialog.visible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdDialog.form"
        :rules="resetPwdRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="resetPwdDialog.form.password"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetPwdDialog.form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitResetPwd">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入用户对话框 -->
    <el-dialog
      v-model="importDialog.visible"
      title="导入用户"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls,.csv"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 Excel 或 CSV 文件，文件大小不超过 10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleImportSubmit">开始导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  UserFilled,
  School,
  Warning,
  Plus,
  Upload,
  Delete,
  Download,
  Search,
  Edit,
  Key,
  UploadFilled
} from '@element-plus/icons-vue'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 加载状态
const loading = ref(false)

// 高级搜索
const showAdvancedSearch = ref(false)
const advancedSearch = reactive({
  username: '',
  email: '',
  phone: '',
  role: '',
  status: '',
  createTime: []
})

// 导入对话框
const importDialog = reactive({
  visible: false,
  file: null
})

// 表单校验规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const resetPwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdDialog.form.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 高级搜索处理
const handleAdvancedSearch = () => {
  // 实现高级搜索逻辑
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const resetAdvancedSearch = () => {
  Object.keys(advancedSearch).forEach(key => {
    advancedSearch[key] = key === 'createTime' ? [] : ''
  })
  handleAdvancedSearch()
}

// 文件上传处理
const handleFileChange = (file) => {
  importDialog.file = file
}

const handleImport = () => {
  importDialog.visible = true
}

const handleImportSubmit = () => {
  if (!importDialog.file) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  // 实现文件导入逻辑
  ElMessage.success('导入成功')
  importDialog.visible = false
}

// 生活化的用户数据，增加lastLogin、remark
const userList = ref([
  { id: 1, username: '李老师', role: 'admin', email: 'li.admin@school.com', phone: '13800000001', status: '正常', lastLogin: '2025-01-22 09:00:00', remark: '超级管理员', createTime: '2025-01-02 09:00:00' },
  { id: 2, username: '王老师', role: 'teacher', email: 'wang.teacher@school.com', phone: '13800000002', status: '正常', lastLogin: '2025-01-21 10:00:00', remark: '数学组', createTime: '2025-01-03 10:00:00' },
  { id: 3, username: '张老师', role: 'teacher', email: 'zhang.teacher@school.com', phone: '13800000003', status: '正常', lastLogin: '2025-01-20 11:00:00', remark: '教研组长', createTime: '2025-01-04 11:00:00' },
  { id: 4, username: '刘老师', role: 'teacher', email: 'liu.teacher@school.com', phone: '13800000004', status: '正常', lastLogin: '2025-01-19 12:00:00', remark: '', createTime: '2025-01-05 12:00:00' },
  { id: 5, username: '陈老师', role: 'teacher', email: 'chen.teacher@school.com', phone: '13800000005', status: '正常', lastLogin: '2025-01-18 13:00:00', remark: '', createTime: '2025-01-06 13:00:00' },
  { id: 6, username: '赵老师', role: 'teacher', email: 'zhao.teacher@school.com', phone: '13800000006', status: '正常', lastLogin: '2025-01-17 14:00:00', remark: '', createTime: '2025-01-07 14:00:00' },
  { id: 7, username: '孙老师', role: 'teacher', email: 'sun.teacher@school.com', phone: '13800000007', status: '正常', lastLogin: '2025-01-16 15:00:00', remark: '', createTime: '2025-01-08 15:00:00' },
  { id: 8, username: '周老师', role: 'teacher', email: 'zhou.teacher@school.com', phone: '13800000008', status: '正常', lastLogin: '2025-01-15 16:00:00', remark: '', createTime: '2025-01-09 16:00:00' },
  { id: 9, username: '吴老师', role: 'teacher', email: 'wu.teacher@school.com', phone: '13800000009', status: '正常', lastLogin: '2025-01-14 17:00:00', remark: '', createTime: '2025-01-10 17:00:00' },
  { id: 10, username: '郑老师', role: 'teacher', email: 'zheng.teacher@school.com', phone: '13800000010', status: '正常', lastLogin: '2025-01-13 18:00:00', remark: '', createTime: '2025-01-11 18:00:00' },
  { id: 11, username: '冯老师', role: 'teacher', email: 'feng.teacher@school.com', phone: '13800000011', status: '正常', lastLogin: '2025-01-12 19:00:00', remark: '', createTime: '2025-01-12 19:00:00' },
  { id: 12, username: '褚老师', role: 'teacher', email: 'chu.teacher@school.com', phone: '13800000012', status: '正常', lastLogin: '2025-01-11 20:00:00', remark: '', createTime: '2025-01-13 20:00:00' },
  { id: 13, username: '卫老师', role: 'teacher', email: 'wei.teacher@school.com', phone: '13800000013', status: '正常', lastLogin: '2025-01-10 21:00:00', remark: '', createTime: '2025-01-14 21:00:00' },
  { id: 14, username: '蒋老师', role: 'teacher', email: 'jiang.teacher@school.com', phone: '13800000014', status: '正常', lastLogin: '2025-01-09 22:00:00', remark: '', createTime: '2025-01-15 22:00:00' },
  { id: 15, username: '沈老师', role: 'teacher', email: 'shen.teacher@school.com', phone: '13800000015', status: '正常', lastLogin: '2025-01-08 23:00:00', remark: '', createTime: '2025-01-16 23:00:00' },
  { id: 16, username: '韩老师', role: 'teacher', email: 'han.teacher@school.com', phone: '13800000016', status: '正常', lastLogin: '2025-01-07 08:00:00', remark: '', createTime: '2025-01-17 08:00:00' },
  { id: 17, username: '杨老师', role: 'teacher', email: 'yang.teacher@school.com', phone: '13800000017', status: '禁用', lastLogin: '2025-01-06 09:00:00', remark: '', createTime: '2025-01-18 09:00:00' },
  { id: 18, username: '朱老师', role: 'teacher', email: 'zhu.teacher@school.com', phone: '13800000018', status: '正常', lastLogin: '2025-01-05 10:00:00', remark: '', createTime: '2025-01-19 10:00:00' },
  { id: 19, username: '钱老师', role: 'admin', email: 'qian.admin@school.com', phone: '13800000019', status: '正常', lastLogin: '2025-01-04 11:00:00', remark: '', createTime: '2025-01-20 11:00:00' },
  { id: 20, username: '秦老师', role: 'teacher', email: 'qin.teacher@school.com', phone: '13800000020', status: '正常', lastLogin: '2025-01-03 12:00:00', remark: '', createTime: '2025-01-21 12:00:00' }
])

const search = reactive({ keyword: '', role: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 8 })
const multipleSelection = ref([])

const dialogVisible = ref(false)
const dialogType = ref('add')
const userForm = reactive({
  id: null,
  username: '',
  password: '',
  role: 'teacher',
  email: '',
  phone: '',
  status: '正常',
  lastLogin: '',
  remark: '',
  createTime: ''
})

const detailDialog = reactive({ visible: false, data: {} })
const resetPwdDialog = reactive({
  visible: false,
  form: { id: null, password: '' }
})

const filteredUserList = computed(() => {
  let list = userList.value
  if (search.keyword) {
    list = list.filter(u => u.username.includes(search.keyword) || u.email.includes(search.keyword) || u.phone.includes(search.keyword))
  }
  if (search.role) {
    list = list.filter(u => u.role === search.role)
  }
  if (search.status) {
    list = list.filter(u => u.status === search.status)
  }
  return list
})

const pagedUserList = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredUserList.value.slice(start, start + pagination.pageSize)
})

function handleSearch() {
  pagination.page = 1
}
function handlePageChange(page) {
  pagination.page = page
}
function handlePageSizeChange(size) {
  pagination.pageSize = size
  pagination.page = 1
}
function handleSelectionChange(val) {
  multipleSelection.value = val
}
function showDetail(row) {
  detailDialog.data = row
  detailDialog.visible = true
}
function handleAdd() {
  dialogType.value = 'add'
  Object.assign(userForm, { id: null, username: '', password: '', role: 'teacher', email: '', phone: '', status: '正常', lastLogin: '', remark: '', createTime: '' })
  dialogVisible.value = true
}
function handleEdit(row) {
  dialogType.value = 'edit'
  Object.assign(userForm, row)
  userForm.password = ''
  dialogVisible.value = true
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = userList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      userList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}
function handleBatchDelete() {
  ElMessageBox.confirm('确定要批量删除选中的用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    multipleSelection.value.forEach(row => {
      const index = userList.value.findIndex(item => item.id === row.id)
      if (index !== -1) userList.value.splice(index, 1)
    })
    ElMessage.success('批量删除成功')
    multipleSelection.value = []
  })
}
function handleStatusChange(row) {
  ElMessage.success(row.status === '正常' ? '已启用' : '已禁用')
}
function handleSubmit() {
  if (!userForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (dialogType.value === 'add' && !userForm.password) {
    ElMessage.warning('请输入密码')
    return
  }
  if (!userForm.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (dialogType.value === 'add') {
    userList.value.push({
      id: Date.now(),
      ...userForm,
      createTime: new Date().toLocaleString()
    })
    ElMessage.success('添加成功')
  } else {
    const index = userList.value.findIndex(item => item.id === userForm.id)
    if (index !== -1) {
      userList.value[index] = { ...userForm }
      ElMessage.success('更新成功')
    }
  }
  dialogVisible.value = false
}
function handleResetPwd(row) {
  resetPwdDialog.visible = true
  resetPwdDialog.form.id = row.id
  resetPwdDialog.form.password = ''
}
function submitResetPwd() {
  if (!resetPwdDialog.form.password) {
    ElMessage.warning('请输入新密码')
    return
  }
  // 实际开发中应调用后端API
  ElMessage.success('密码重置成功')
  resetPwdDialog.visible = false
}
function exportCSV() {
  const header = ['用户名', '角色', '邮箱', '手机号', '状态', '最后登录', '备注', '创建时间']
  const rows = userList.value.map(u => [u.username, u.role === 'admin' ? '管理员' : '教师', u.email, u.phone, u.status, u.lastLogin, u.remark, u.createTime])
  const csvContent = [header, ...rows].map(e => e.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '用户列表.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.statistics-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #606266;
  }
  
  .card-value {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    text-align: center;
    margin-top: 10px;
  }
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    gap: 10px;
  }
}

.advanced-search {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .search-form {
    .el-form-item {
      margin-bottom: 18px;
    }
  }

  .search-buttons {
    text-align: center;
    margin-top: 10px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .user-email {
      font-size: 12px;
      color: #909399;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  .user-avatar {
    text-align: center;
    margin-bottom: 20px;
  }
}

.user-form {
  max-width: 500px;
  margin: 0 auto;
}

.upload-demo {
  text-align: center;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload__tip) {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
}
</style> 