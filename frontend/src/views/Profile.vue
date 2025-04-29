<template>
  <div class="personal-container">
    <h2>个人中心</h2>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <div class="avatar-row">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          accept=".png,.jpg,.jpeg"
          @change="handleAvatarChange"
        >
          <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
          <el-icon v-else class="avatar-placeholder"><User /></el-icon>
          <el-button size="small" style="margin-left:16px;">更换头像</el-button>
        </el-upload>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="margin-top:20px;">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-button type="primary" @click="pwdDialog = true">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="button-group">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    <el-dialog v-model="pwdDialog" title="修改密码" width="400px" destroy-on-close>
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPwd">
          <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdForm.newPwd" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd">
          <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;margin-top:10px;">
        <el-button @click="pwdDialog = false">取消</el-button>
        <el-button type="primary" @click="handlePwdSave">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

const formRef = ref()
const pwdFormRef = ref()
const pwdDialog = ref(false)
const form = ref({
  avatarUrl: '',
  nickname: '李老师',
  phone: '13800000000',
  email: 'Mrsli@example.com'
})
const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}
const pwdForm = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})
const pwdRules = {
  oldPwd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
      if (value !== pwdForm.value.newPwd) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}
const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = e => {
    form.value.avatarUrl = e.target?.result as string
    ElMessage.success('头像上传成功')
  }
  reader.readAsDataURL(file.raw)
}
const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('请填写完整信息')
  }
}
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.value = {
    avatarUrl: '',
    nickname: '张三',
    phone: '13800000000',
    email: 'zhangsan@example.com'
  }
}
const handlePwdSave = async () => {
  if (!pwdFormRef.value) return
  try {
    await pwdFormRef.value.validate()
    pwdDialog.value = false
    pwdForm.value = { oldPwd: '', newPwd: '', confirmPwd: '' }
    ElMessage.success('密码修改成功')
  } catch {
    ElMessage.error('请填写完整信息')
  }
}
</script>

<style scoped>
.personal-container {
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
.avatar-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.avatar-uploader {
  display: flex;
  align-items: center;
}
.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
}
.avatar-placeholder {
  width: 72px;
  height: 72px;
  font-size: 60px;
  color: #bbb;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style>
