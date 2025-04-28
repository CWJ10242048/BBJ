<template>
    <div class="login-page">
        <div class="login-card">
            <div class="logo-circle">
                <!-- 这里放你的LOGO图片，替换src即可 -->
                <img src="@/assets/image/BBJlogo.png" alt="logo" class="logo-img" />
            </div>
            <div class="login-title">
                <span>欢迎使用备倍佳AI备课系统</span>
            </div>
            <!-- 身份选择按钮组 -->
            <div class="role-btn-group">
                <div
                    v-for="item in roles"
                    :key="item.value"
                    :class="['role-btn', {active: role === item.value}]"
                    @click="role = item.value"
                >
                    {{ item.label }}
                </div>
            </div>
            <div class="login-input">
                <div class="input-item">
                    <el-input prefix-icon="el-icon-user" v-model="username" placeholder="请输入用户名"></el-input>
                </div>
                <div class="input-item">
                    <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" v-model="password"
                        show-password></el-input>
                </div>
            </div>
            <el-button class="login-btn" type="primary" @click="login()">登录</el-button>
            <!-- 注册和忘记密码 -->
            <div class="login-links">
                <a href="javascript:void(0)">注册</a>
                <span class="divider">|</span>
                <a href="javascript:void(0)">忘记密码？</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const role = ref('teacher')

const roles = [
    { label: '学生', value: 'student' },
    { label: '教师', value: 'teacher' },
    { label: '管理员', value: 'admin' }
]

const login = () => {
    // 设置模拟的token和用户信息
    const mockToken = 'mock_token_' + Date.now()
    const mockUser = {
        username: username.value || '默认用户',
        role: role.value,
        avatar: '@/assets/image/BBJlogo.png'
    }

    // 存储token和用户信息
    userStore.setToken(mockToken)
    userStore.setUser(JSON.stringify(mockUser))
    
    // 显示登录成功消息
    ElMessage({
        message: '登录成功',
        type: 'success'
    })

    // 延迟跳转到首页
    setTimeout(() => {
        router.push('/home')
    }, 500)
}
</script>

<style scoped>
.login-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #e0e7ef 0%, #b3c6e6 100%);
}

.login-card {
    width: 540px;
    padding: 60px 40px 40px 40px;
    background-color: #fff;
    border-radius: 24px;
    box-shadow: 0 6px 32px 0 rgba(0,0,0,0.10);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

.logo-circle {
    width: 90px;
    height: 90px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
    overflow: hidden;
}

.logo-img {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    object-fit: cover;
    background: #fff;
}

.login-title {
    color: #22304A;
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 36px;
    text-align: center;
}

.login-input {
    width: 100%;
    margin-bottom: 32px;
}

.input-item {
    margin-top: 20px;
}

.login-btn {
    margin-top: 14px;
    border-radius: 32px;
    width: 100%;
    height: 56px;
    font-weight: bold;
    font-size: 22px;
}

.login-input :deep(.el-input__inner) {
    border-radius: 32px !important;
    font-weight: bold !important;
    background-color: #F0F0F0 !important;
    height: 56px !important;
    font-size: 20px !important;
}

.role-btn-group {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    gap: 18px;
}

.role-btn {
    padding: 8px 32px;
    border-radius: 24px;
    border: 2px solid #7d8fff;
    background: #fff;
    color: #7d8fff;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
}

.role-btn.active,
.role-btn:hover {
    background: #7d8fff;
    color: #fff;
    border-color: #7d8fff;
}

.login-links {
    margin-top: 18px;
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: 16px;
    color: #7d8fff;
}

.login-links a {
    color: #7d8fff;
    text-decoration: none;
    margin: 0 8px;
    cursor: pointer;
    transition: color 0.2s;
}

.login-links a:hover {
    color: #22304A;
    text-decoration: underline;
}

.login-links .divider {
    color: #ccc;
    margin: 0 4px;
}
</style>