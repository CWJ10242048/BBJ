<template>
    <div class="admin-profile-wrapper">
      <div class="profile-main">
        <!-- 左侧个人信息卡片 -->
        <div class="profile-card">
          <el-card class="profile-card-content" :body-style="{ padding: '0px' }">
            <!-- 头像区域 -->
            <div class="profile-header">
              <div class="avatar-block" @click="triggerAvatarSelect" title="点击更换头像">
                <el-avatar :size="120" :src="avatarUrl">
                  {{ form.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <div class="avatar-upload-icon">
                  <el-icon><Camera /></el-icon>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden-input"
                  @change="onAvatarSelected"
                />
              </div>
              <div class="admin-info">
                <div class="admin-name">{{ form.username }}</div>
                <el-tag type="success" effect="dark" class="role-tag">
                  <el-icon><UserFilled /></el-icon>
                  管理员账号
                </el-tag>
                <div class="admin-status">
                  <el-tag type="success" effect="plain" size="small">
                    <el-icon><CircleCheck /></el-icon>
                    在线
                  </el-tag>
                </div>
              </div>
            </div>
  
            <!-- 统计信息 -->
            <div class="profile-stats">
              <div class="stat-item">
                <el-icon><User /></el-icon>
                <div class="stat-content">
                  <div class="stat-num">{{ stats.userCount }}</div>
                  <div class="stat-label">管理用户</div>
                </div>
              </div>
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <div class="stat-content">
                  <div class="stat-num">{{ stats.resourceCount }}</div>
                  <div class="stat-label">资源数</div>
                </div>
              </div>
              <div class="stat-item">
                <el-icon><List /></el-icon>
                <div class="stat-content">
                  <div class="stat-num">{{ stats.logCount }}</div>
                  <div class="stat-label">操作日志</div>
                </div>
              </div>
            </div>
  
            <!-- 联系信息 -->
            <div class="profile-contact">
              <div class="contact-item">
                <el-icon><Message /></el-icon>
                <span>{{ form.email }}</span>
              </div>
              <div class="contact-item">
                <el-icon><Phone /></el-icon>
                <span>{{ form.phone }}</span>
              </div>
              <div class="contact-item">
                <el-icon><Location /></el-icon>
                <span>上次登录：{{ lastLoginTime }}</span>
              </div>
            </div>
  
            <!-- 快捷操作 -->
            <div class="profile-actions">
              <el-button type="primary" plain @click="activeTab = 'security'">
                <el-icon><Lock /></el-icon>
                安全设置
              </el-button>
              <el-button type="success" plain @click="activeTab = 'notify'">
                <el-icon><Bell /></el-icon>
                消息中心
              </el-button>
            </div>
          </el-card>
        </div>
  
        <!-- 右侧信息表单 -->
        <div class="profile-info">
          <el-card>
            <el-tabs v-model="activeTab" class="profile-tabs">
              <!-- 基本资料 -->
              <el-tab-pane label="基本资料" name="base">
                <template #label>
                  <el-icon><User /></el-icon>
                  <span>基本资料</span>
                </template>
                <el-form
                  ref="baseFormRef"
                  :model="form"
                  :rules="baseRules"
                  label-width="90px"
                  class="profile-form"
                >
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" disabled>
                      <template #prefix>
                        <el-icon><User /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="角色">
                    <el-input value="管理员" disabled>
                      <template #prefix>
                        <el-icon><UserFilled /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email">
                      <template #prefix>
                        <el-icon><Message /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="form.phone">
                      <template #prefix>
                        <el-icon><Phone /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitBaseInfo">
                      <el-icon><Check /></el-icon>
                      保存信息
                    </el-button>
                    <el-button @click="resetBaseInfo">
                      <el-icon><Refresh /></el-icon>
                      重置
                    </el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
  
              <!-- 账户安全 -->
              <el-tab-pane label="账户安全" name="security">
                <template #label>
                  <el-icon><Lock /></el-icon>
                  <span>账户安全</span>
                </template>
                
                <!-- 修改密码 -->
                <el-card class="security-card">
                  <template #header>
                    <div class="security-header">
                      <el-icon><Key /></el-icon>
                      <span>修改密码</span>
                    </div>
                  </template>
                  <el-form
                    ref="pwdFormRef"
                    :model="pwdForm"
                    :rules="pwdRules"
                    label-width="110px"
                    class="profile-form"
                  >
                    <el-form-item label="当前密码" prop="oldPwd">
                      <el-input
                        v-model="pwdForm.oldPwd"
                        show-password
                        autocomplete="off"
                      />
                    </el-form-item>
                    <el-form-item label="新密码" prop="newPwd">
                      <el-input
                        v-model="pwdForm.newPwd"
                        show-password
                        autocomplete="off"
                      />
                    </el-form-item>
                    <el-form-item label="确认新密码" prop="confirmPwd">
                      <el-input
                        v-model="pwdForm.confirmPwd"
                        show-password
                        autocomplete="off"
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submitPassword">
                        <el-icon><Check /></el-icon>
                        修改密码
                      </el-button>
                      <el-button @click="resetPassword">
                        <el-icon><Refresh /></el-icon>
                        重置
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
  
                <!-- 更改手机号 -->
                <el-card class="security-card">
                  <template #header>
                    <div class="security-header">
                      <el-icon><Phone /></el-icon>
                      <span>手机号验证</span>
                    </div>
                  </template>
                  <el-form
                    ref="phoneFormRef"
                    :model="phoneForm"
                    :rules="phoneRules"
                    label-width="110px"
                    class="profile-form"
                  >
                    <el-form-item label="新手机号" prop="phone">
                      <el-input v-model="phoneForm.phone" />
                    </el-form-item>
                    <el-form-item label="验证码" prop="code">
                      <el-row :gutter="6">
                        <el-col :span="12">
                          <el-input v-model="phoneForm.code" />
                        </el-col>
                        <el-col :span="12">
                          <el-button
                            type="primary"
                            :disabled="phoneCountdown > 0"
                            @click="sendPhoneCode"
                            style="width: 100%"
                          >
                            {{ phoneCountdown > 0 ? `${phoneCountdown}s 后重发` : '获取验证码' }}
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submitPhone">
                        <el-icon><Check /></el-icon>
                        更改手机号
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
  
                <!-- 更改邮箱 -->
                <el-card class="security-card">
                  <template #header>
                    <div class="security-header">
                      <el-icon><Message /></el-icon>
                      <span>邮箱验证</span>
                    </div>
                  </template>
                  <el-form
                    ref="emailFormRef"
                    :model="emailForm"
                    :rules="emailRules"
                    label-width="110px"
                    class="profile-form"
                  >
                    <el-form-item label="新邮箱" prop="email">
                      <el-input v-model="emailForm.email" />
                    </el-form-item>
                    <el-form-item label="验证码" prop="code">
                      <el-row :gutter="6">
                        <el-col :span="12">
                          <el-input v-model="emailForm.code" />
                        </el-col>
                        <el-col :span="12">
                          <el-button
                            type="primary"
                            :disabled="emailCountdown > 0"
                            @click="sendEmailCode"
                            style="width: 100%"
                          >
                            {{ emailCountdown > 0 ? `${emailCountdown}s 后重发` : '获取验证码' }}
                          </el-button>
                        </el-col>
                      </el-row>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submitEmail">
                        <el-icon><Check /></el-icon>
                        更改邮箱
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-tab-pane>
  
              <!-- 消息通知 -->
              <el-tab-pane label="消息通知" name="notify">
                <template #label>
                  <el-icon><Bell /></el-icon>
                  <span>消息通知</span>
                </template>
                <div class="notification-container">
                  <el-empty v-if="notifications.length === 0" description="暂无消息通知" />
                  <el-timeline v-else>
                    <el-timeline-item
                      v-for="(item, index) in notifications"
                      :key="index"
                      :type="item.type"
                      :color="item.color"
                      :timestamp="item.time"
                    >
                      <el-card class="notification-card">
                        <template #header>
                          <div class="notification-header">
                            <el-icon><component :is="item.icon" /></el-icon>
                            <span>{{ item.title }}</span>
                          </div>
                        </template>
                        <div class="notification-content">{{ item.content }}</div>
                      </el-card>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    User,
    UserFilled,
    Message,
    Phone,
    Camera,
    CircleCheck,
    Document,
    List,
    Location,
    Lock,
    Bell,
    Key,
    Check,
    Refresh
  } from '@element-plus/icons-vue'
  
  /** ───────── state ───────── */
  const activeTab = ref('base')
  
  // 统计数据
  const stats = reactive({
    userCount: 20,
    resourceCount: 156,
    logCount: 89
  })
  
  // 最后登录时间
  const lastLoginTime = ref('2025-01-22 09:00:00')
  
  // 消息通知
  const notifications = ref([
    {
      type: 'primary',
      color: '#409EFF',
      icon: 'Bell',
      title: '系统通知',
      content: '系统将于今晚22:00进行例行维护，请提前做好相关准备。',
      time: '2025-01-22 10:00:00'
    },
    {
      type: 'success',
      color: '#67C23A',
      icon: 'Check',
      title: '操作成功',
      content: '您已成功更新个人信息。',
      time: '2025-01-21 15:30:00'
    },
    {
      type: 'warning',
      color: '#E6A23C',
      icon: 'Warning',
      title: '安全提醒',
      content: '检测到您的账号在新设备上登录，请注意账号安全。',
      time: '2025-01-20 09:15:00'
    }
  ])
  
  // avatar
  const avatarUrl = ref('/src/assets/image/lock-back.jpg')
  const avatarInput = ref()
  
  // base info
  const form = reactive({
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800000000'
  })
  const baseRules = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        pattern: /^1\d{10}$/,
        message: '手机号格式不正确',
        trigger: ['blur', 'change']
      }
    ]
  }
  const baseFormRef = ref()
  
  // password
  const pwdForm = reactive({
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
  })
  const pwdRules = {
    oldPwd: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPwd: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '至少 6 位字符', trigger: 'blur' }
    ],
    confirmPwd: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (_, v) =>
          v === pwdForm.newPwd
            ? Promise.resolve()
            : Promise.reject('两次输入密码不一致'),
        trigger: 'blur'
      }
    ]
  }
  const pwdFormRef = ref()
  
  // phone
  const phoneForm = reactive({
    phone: '',
    code: ''
  })
  const phoneRules = {
    phone: [
      { required: true, message: '请输入新手机号', trigger: 'blur' },
      {
        pattern: /^1\d{10}$/,
        message: '手机号格式不正确',
        trigger: ['blur', 'change']
      }
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }
  const phoneFormRef = ref()
  const phoneCountdown = ref(0)
  let phoneTimer = null
  
  // email
  const emailForm = reactive({
    email: '',
    code: ''
  })
  const emailRules = {
    email: [
      { required: true, message: '请输入新邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ],
    code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }
  const emailFormRef = ref()
  const emailCountdown = ref(0)
  let emailTimer = null
  
  /** ───────── methods ───────── */
  // avatar
  function triggerAvatarSelect() {
    avatarInput.value?.click()
  }
  function onAvatarSelected(e) {
    const file = e.target.files[0]
    if (!file) return
    // preview
    avatarUrl.value = URL.createObjectURL(file)
    // TODO: upload file to backend
    ElMessage.success('头像已更新（仅本地预览）')
  }
  
  // base info
  function submitBaseInfo() {
    baseFormRef.value.validate(async (valid) => {
      if (!valid) return
      // TODO: call API
      ElMessage.success('基本信息已保存')
    })
  }
  function resetBaseInfo() {
    baseFormRef.value.resetFields()
  }
  
  // password
  function submitPassword() {
    pwdFormRef.value.validate(async (valid) => {
      if (!valid) return
      // TODO: call API
      ElMessage.success('密码修改成功')
      resetPassword()
    })
  }
  function resetPassword() {
    pwdFormRef.value.resetFields()
  }
  
  // phone
  function sendPhoneCode() {
    phoneFormRef.value.validateField('phone', async (err) => {
      if (err) return
      phoneCountdown.value = 60
      phoneTimer = setInterval(() => {
        phoneCountdown.value--
        if (phoneCountdown.value === 0) clearInterval(phoneTimer)
      }, 1000)
      // TODO: call API
      ElMessage.success('验证码已发送')
    })
  }
  function submitPhone() {
    phoneFormRef.value.validate(async (valid) => {
      if (!valid) return
      // TODO: call API
      ElMessage.success('手机号已更新')
      phoneCountdown.value = 0
      clearInterval(phoneTimer)
      Object.assign(form, { phone: phoneForm.phone })
      phoneFormRef.value.resetFields()
    })
  }
  
  // email
  function sendEmailCode() {
    emailFormRef.value.validateField('email', async (err) => {
      if (err) return
      emailCountdown.value = 60
      emailTimer = setInterval(() => {
        emailCountdown.value--
        if (emailCountdown.value === 0) clearInterval(emailTimer)
      }, 1000)
      // TODO: call API
      ElMessage.success('验证码已发送')
    })
  }
  function submitEmail() {
    emailFormRef.value.validate(async (valid) => {
      if (!valid) return
      // TODO: call API
      ElMessage.success('邮箱已更新')
      emailCountdown.value = 0
      clearInterval(emailTimer)
      Object.assign(form, { email: emailForm.email })
      emailFormRef.value.resetFields()
    })
  }
  </script>
  
  <style scoped>
  .admin-profile-wrapper {
    padding: 32px;
    background: #f5f7fa;
    min-height: calc(100vh - 84px);
  }
  
  .profile-main {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    gap: 32px;
  }
  
  .profile-card {
    width: 320px;
    min-width: 260px;
  }
  
  .profile-card-content {
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
  }
  
  .profile-card-content:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  /* 头像区域 */
  .profile-header {
    padding: 32px 20px;
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    color: white;
    text-align: center;
  }
  
  .avatar-block {
    position: relative;
    display: inline-block;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .avatar-block:hover .avatar-upload-icon {
    opacity: 1;
  }
  
  .avatar-upload-icon {
    position: absolute;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s;
  }
  
  .hidden-input {
    display: none;
  }
  
  .admin-info {
    margin-top: 16px;
  }
  
  .admin-name {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .role-tag {
    margin-bottom: 8px;
    padding: 4px 12px;
    border-radius: 16px;
  }
  
  .admin-status {
    margin-top: 8px;
  }
  
  /* 统计信息 */
  .profile-stats {
    padding: 20px;
    background: white;
    border-bottom: 1px solid #eee;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .stat-item:last-child {
    margin-bottom: 0;
  }
  
  .stat-item .el-icon {
    font-size: 24px;
    color: var(--el-color-primary);
    margin-right: 12px;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-num {
    font-size: 20px;
    font-weight: bold;
    color: #303133;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 13px;
    color: #909399;
  }
  
  /* 联系信息 */
  .profile-contact {
    padding: 20px;
    background: white;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    color: #606266;
  }
  
  .contact-item:last-child {
    margin-bottom: 0;
  }
  
  .contact-item .el-icon {
    margin-right: 8px;
    color: var(--el-color-primary);
  }
  
  /* 快捷操作 */
  .profile-actions {
    padding: 20px;
    background: white;
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  /* 右侧信息 */
  .profile-info {
    flex: 1;
  }
  
  .profile-tabs {
    :deep(.el-tabs__item) {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  
  .profile-form {
    max-width: 460px;
    margin: 0 auto;
  }
  
  /* 安全设置卡片 */
  .security-card {
    margin-bottom: 20px;
  }
  
  .security-card:last-child {
    margin-bottom: 0;
  }
  
  .security-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: bold;
  }
  
  /* 消息通知 */
  .notification-container {
    padding: 20px;
  }
  
  .notification-card {
    margin-bottom: 16px;
  }
  
  .notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
  }
  
  .notification-content {
    color: #606266;
    line-height: 1.6;
  }
  
  /* 响应式布局 */
  @media screen and (max-width: 768px) {
    .profile-main {
      flex-direction: column;
    }
    
    .profile-card {
      width: 100%;
    }
    
    .profile-form {
      max-width: 100%;
    }
  }
  </style>
  