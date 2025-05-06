<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="profile-title">个人中心</h1>
      <div class="profile-subtitle">管理您的个人信息和账户设置</div>
    </div>

    <div class="profile-content">
      <!-- 左侧个人信息卡片 -->
      <el-card class="profile-card" :body-style="{ padding: '0' }">
        <div class="profile-card-header">
          <div class="profile-avatar-section">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="false"
              accept=".png,.jpg,.jpeg"
              @change="handleAvatarChange"
            >
              <div class="avatar-container">
                <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
                <el-icon v-else class="avatar-placeholder"><User /></el-icon>
                <div class="avatar-hover-mask">
                  <el-icon><EditPen /></el-icon>
                  <span>更换头像</span>
                </div>
              </div>
            </el-upload>
            <div class="user-name">{{ form.nickname }}</div>
            <div class="user-role">
              <el-tag size="small" effect="plain" type="success">教师账号</el-tag>
            </div>
          </div>
        </div>

        <div class="profile-stats">
          <div class="stat-item">
            <div class="stat-value">28</div>
            <div class="stat-label">教案</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">15</div>
            <div class="stat-label">PPT</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">32</div>
            <div class="stat-label">习题</div>
          </div>
        </div>

        <div class="user-info-summary">
          <div class="info-item">
            <el-icon><Message /></el-icon>
            <span>{{ form.email }}</span>
          </div>
          <div class="info-item">
            <el-icon><Phone /></el-icon>
            <span>{{ form.phone }}</span>
          </div>
          <div class="info-item">
            <el-icon><School /></el-icon>
            <span>{{ form.school }}</span>
          </div>
        </div>
      </el-card>

      <!-- 右侧信息编辑区域 -->
      <div class="profile-edit-section">
        <el-tabs type="border-card" class="custom-tabs" v-model="activeTabName">
          <el-tab-pane label="基本资料" name="basic">
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="user-form">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="form.nickname" placeholder="请输入昵称" prefix-icon="User" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" prefix-icon="Phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" prefix-icon="Message" />
              </el-form-item>
              <el-form-item label="所在学校" prop="school">
                <el-input v-model="form.school" placeholder="请输入学校名称" prefix-icon="School" />
              </el-form-item>
              <el-form-item label="教学科目" prop="subject">
                <el-select v-model="form.subject" placeholder="请选择教学科目" style="width: 100%">
                  <el-option label="计算机科学" value="computer_science" />
                  <el-option label="编程" value="programming" />
                  <el-option label="数据库" value="database" />
                  <el-option label="人工智能" value="ai" />
                  <el-option label="网络安全" value="security" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <div class="form-actions">
                  <el-button type="primary" @click="handleSave" :loading="saveLoading">保存信息</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="账户安全" name="security">
            <div class="security-section">
              <div class="security-item">
                <div class="security-item-info">
                  <div class="security-item-title">
                    <el-icon><Lock /></el-icon>
                    <span>账户密码</span>
                  </div>
                  <div class="security-item-desc">定期修改密码可以保护账户安全</div>
                </div>
                <el-button type="primary" @click="pwdDialog = true">修改密码</el-button>
              </div>
              
              <div class="security-item">
                <div class="security-item-info">
                  <div class="security-item-title">
                    <el-icon><Phone /></el-icon>
                    <span>手机验证</span>
                  </div>
                  <div class="security-item-desc">已绑定手机: {{ form.phone }}</div>
                </div>
                <el-button type="primary" plain>更换手机</el-button>
              </div>
              
              <div class="security-item">
                <div class="security-item-info">
                  <div class="security-item-title">
                    <el-icon><Message /></el-icon>
                    <span>邮箱验证</span>
                  </div>
                  <div class="security-item-desc">已绑定邮箱: {{ form.email }}</div>
                </div>
                <el-button type="primary" plain>更换邮箱</el-button>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="消息通知" name="notifications">
            <div class="notification-settings">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">系统通知</div>
                  <div class="setting-desc">接收系统更新、维护等通知</div>
                </div>
                <el-switch v-model="notificationSettings.system" active-color="#3d5afe" />
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">资源更新提醒</div>
                  <div class="setting-desc">有新的教学资源时通知我</div>
                </div>
                <el-switch v-model="notificationSettings.resources" active-color="#3d5afe" />
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">协作邀请</div>
                  <div class="setting-desc">接收新的协作邀请通知</div>
                </div>
                <el-switch v-model="notificationSettings.collaboration" active-color="#3d5afe" />
              </div>
              
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">邮件通知</div>
                  <div class="setting-desc">通过邮件接收重要通知</div>
                </div>
                <el-switch v-model="notificationSettings.email" active-color="#3d5afe" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="pwdDialog" title="修改密码" width="400px" destroy-on-close>
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPwd">
          <el-input v-model="pwdForm.oldPwd" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdForm.newPwd" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd">
          <el-input v-model="pwdForm.confirmPwd" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="pwdDialog = false">取消</el-button>
          <el-button type="primary" @click="handlePwdSave" :loading="pwdLoading">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, EditPen, Lock, Phone, Message, School } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'
import type { UserInfo, UserUpdateRequest } from '@/types/user'
import type { FormInstance } from 'element-plus'
import { mockUserInfo, mockApiResponse } from '@/api/mock'
import lockBackImg from '@/assets/image/lock-back.jpg'
import { useRoute } from 'vue-router'

const formRef = ref<FormInstance>()
const pwdFormRef = ref<FormInstance>()
const pwdDialog = ref(false)
const saveLoading = ref(false)
const pwdLoading = ref(false)
const activeTabName = ref('basic')
const route = useRoute()

// 是否使用模拟数据
const useMockData = true;

// 用户表单数据
const form = ref<UserInfo>({
  id: 0,
  username: '',
  nickname: '李老师',
  avatarUrl: '',
  phone: '13800000000',
  email: 'Mrsli@example.com',
  school: '计算机科学大学',
  subject: 'computer_science',
  role: 'teacher'
})

// 通知设置
const notificationSettings = ref({
  system: true,
  resources: true,
  collaboration: true,
  email: false
})

// 表单验证规则
const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        callback(new Error('邮箱格式不正确'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  school: [{ required: true, message: '请输入学校', trigger: 'blur' }],
  subject: [{ required: true, message: '请选择教学科目', trigger: 'change' }]
}

// 密码表单
const pwdForm = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
})

// 密码表单验证规则
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

// 组件挂载时获取用户信息，并检查路由哈希
onMounted(async () => {
  try {
    await getUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }

  if (route.hash === '#security') {
    activeTabName.value = 'security';
  }
})

// 获取用户信息
const getUserInfo = async () => {
  try {
    saveLoading.value = true
    
    let userData: UserInfo;
    
    if (useMockData) {
      // 使用教师 mock 数据
      const response = await mockApiResponse(mockUserInfo('teacher'));
      userData = response.data;
    } else {
      // 调用实际API
      const response = await userApi.getUserInfo();
      userData = response.data;
    }
    
    // 如果获取数据成功，则使用获取的数据
    form.value = {
      ...userData,
      // 如果返回的头像URL为空，使用默认头像
      avatarUrl: userData.avatarUrl || lockBackImg
    }
    
    saveLoading.value = false
  } catch (error) {
    saveLoading.value = false
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，将使用默认数据')
    
    // 使用默认数据
    form.value = {
      id: 0,
      username: 'teacher',
      nickname: '李老师',
      avatarUrl: lockBackImg,
      phone: '13800000000',
      email: 'Mrsli@example.com',
      school: '计算机科学大学',
      subject: 'computer_science',
      role: 'teacher'
    }
    
    // 模拟成功，不影响用户体验
    ElMessage.success('已加载默认数据')
  }
}

// 处理头像更新
const handleAvatarChange = async (file: any) => {
  try {
    let avatarUrl: string;
    
    if (useMockData) {
      // 使用模拟数据，直接用FileReader预览
      const reader = new FileReader();
      reader.onload = e => {
        form.value.avatarUrl = e.target?.result as string;
        ElMessage.success('头像上传成功');
      };
      reader.readAsDataURL(file.raw);
      return;
    } else {
      // 调用实际API
      const response = await userApi.uploadAvatar(file.raw);
      form.value.avatarUrl = response.data.avatarUrl;
      ElMessage.success('头像上传成功');
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
    
    // 使用FileReader显示本地预览（备用方案）
    const reader = new FileReader();
    reader.onload = e => {
      form.value.avatarUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file.raw);
  }
}

// 保存用户信息
const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    saveLoading.value = true;
    
    // 提取需要更新的字段
    const updateData: UserUpdateRequest = {
      nickname: form.value.nickname,
      phone: form.value.phone,
      email: form.value.email,
      school: form.value.school,
      subject: form.value.subject
    };
    
    if (useMockData) {
      // 使用模拟数据
      await mockApiResponse({...mockUserInfo('teacher'), ...updateData});
      
      // 更新本地表单数据
      form.value = {
        ...form.value,
        ...updateData
      };
    } else {
      // 调用实际API
      const response = await userApi.updateUser(updateData);
      
      // 更新本地表单数据
      form.value = {
        ...form.value,
        ...response.data
      };
    }
    
    ElMessage.success('保存成功');
    saveLoading.value = false;
  } catch (error: any) {
    saveLoading.value = false;
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请检查输入信息');
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  getUserInfo()
}

// 保存密码修改
const handlePwdSave = async () => {
  if (!pwdFormRef.value) return;
  
  try {
    await pwdFormRef.value.validate();
    pwdLoading.value = true;
    
    if (useMockData) {
      // 模拟成功响应
      await mockApiResponse({ success: true, message: '密码修改成功' });
    } else {
      // 调用实际API
      await userApi.changePassword({
        oldPassword: pwdForm.value.oldPwd,
        newPassword: pwdForm.value.newPwd
      });
    }
    
    pwdDialog.value = false;
    pwdForm.value = { oldPwd: '', newPwd: '', confirmPwd: '' };
    ElMessage.success('密码修改成功');
    pwdLoading.value = false;
  } catch (error: any) {
    pwdLoading.value = false;
    console.error('密码修改失败:', error);
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error('密码修改失败，请检查原密码是否正确');
    }
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 60px);
  position: relative;
}

.profile-container::before {
  content: none;
}

.profile-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
  z-index: 1;
}

.profile-title {
  font-size: 28px;
  color: #303133;
  margin: 0;
  margin-bottom: 10px;
  font-weight: 600;
}

.profile-subtitle {
  font-size: 15px;
  color: #606266;
}

.profile-content {
  display: flex;
  gap: 30px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
}

.profile-card {
  width: 340px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }
  
  @media (max-width: 992px) {
    width: 100%;
  }
}

.profile-card-header {
  background: linear-gradient(90deg, #3d5afe, #8c44ff);
  padding: 30px 0 20px;
  border-radius: 16px 16px 0 0;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  border: 4px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  
  &:hover .avatar-hover-mask {
    opacity: 1;
  }
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  font-size: 60px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
  
  .el-icon {
    font-size: 24px;
    margin-bottom: 6px;
  }
  
  span {
    font-size: 14px;
  }
}

.user-name {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.user-role {
  margin-bottom: 10px;
}

.profile-stats {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 10%;
    height: 80%;
    width: 1px;
    background-color: #f0f0f0;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #3d5afe;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.user-info-summary {
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .el-icon {
    margin-right: 8px;
    color: #909399;
  }
}

.quick-actions {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  margin-top: auto;
}

.profile-edit-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.custom-tabs {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-form {
  padding: 24px 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.security-section {
  padding: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  
  &:last-child {
    border-bottom: none;
  }
}

.security-item-info {
  flex: 1;
}

.security-item-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #303133;
}

.security-item-desc {
  font-size: 14px;
  color: #909399;
}

.notification-settings {
  padding: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  
  &:last-child {
    border-bottom: none;
  }
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  margin-bottom: 6px;
  color: #303133;
  font-weight: 500;
}

.setting-desc {
  font-size: 14px;
  color: #909399;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-tabs__item) {
  padding: 0 24px;
  height: 50px;
  line-height: 50px;
  font-size: 15px;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

:deep(.el-dialog__header) {
  padding: 24px;
  margin-right: 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper),
:deep(.el-select) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 0 0 1px #c0c4cc inset;
  }
  
  &.is-focus {
    box-shadow: 0 0 0 1px #3d5afe inset;
  }
}

:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
