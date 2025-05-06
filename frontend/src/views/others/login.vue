<template>
    <div class="login-page">
        <div class="login-container">
        <div class="login-card">
                <div class="logo-wrapper">
            <div class="logo-circle">
                <!-- 这里放你的LOGO图片，替换src即可 -->
                <img src="@/assets/image/logo.png" alt="logo" class="logo-img" />
            </div>
            <div class="login-title">
                        <h1>备倍佳AI备课系统</h1>
                        <p>智能教学辅助平台</p>
                    </div>
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

                <div class="login-form">
                <div class="input-item">
                        <div class="input-icon">
                            <el-icon><User /></el-icon>
                        </div>
                        <el-input v-model="username" placeholder="请输入用户名" class="custom-input"></el-input>
                </div>
                <div class="input-item">
                        <div class="input-icon">
                            <el-icon><Lock /></el-icon>
                        </div>
                        <el-input placeholder="请输入密码" v-model="password" 
                            show-password class="custom-input"></el-input>
                    </div>
                    
                    <el-button class="login-btn" type="primary" @click="login()">登 录</el-button>
                    
                    <!-- 记住密码和自动登录 -->
                    <div class="login-options">
                        <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
                        <el-checkbox v-model="autoLogin">自动登录</el-checkbox>
                    </div>
                    
                    <!-- 注册和忘记密码 -->
                    <div class="login-links">
                        <el-button link @click="handleRegister">注册账号</el-button>
                        <span class="divider">|</span>
                        <el-button link @click="handleForgotPassword">忘记密码？</el-button>
                    </div>
                </div>
            </div>
            
            <!-- 底部版权信息 -->
            <div class="footer">
                <p>Copyright © 2025 备倍佳AI备课系统 版权所有</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

// 配置axios默认值 - 确保使用正确的地址和端口
axios.defaults.baseURL = 'http://47.97.217.4:8081'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const role = ref('teacher')
const rememberPassword = ref(false)
const autoLogin = ref(false)

const roles = [
    { label: '教师', value: 'teacher' },
    { label: '管理员', value: 'admin' }
]

const handleRegister = () => {
    ElMessage({
        message: '注册功能开发中',
        type: 'info'
    })
}

const handleForgotPassword = () => {
    ElMessage({
        message: '密码找回功能开发中',
        type: 'info'
    })
}

const login = async () => {
    if (!username.value) {
        ElMessage({
            message: '请输入用户名',
            type: 'warning'
        })
        return
    }
    
    if (!password.value) {
        ElMessage({
            message: '请输入密码',
            type: 'warning'
        })
        return
    }

    try {
        // 调用后端登录接口 - 使用配置的baseURL
        const response = await axios.post('/api/login', {
            username: username.value,
            password: password.value,
            role: role.value
        })

        if (response.data.code === 200) {
            const userData = response.data.data
            
            // 根据角色设置不同的头像
            if (userData.role === 'ADMIN') {
                userData.avatarUrl = './assets/image/admin.png'
            } else {
                userData.avatarUrl = './assets/image/lock-back.jpg'
            }
            
            // 存储token和用户信息
            userStore.setToken(response.data.token)
            userStore.setUser(JSON.stringify(userData))
            
            // 显示登录成功消息
            ElMessage({
                message: '登录成功',
                type: 'success'
            })

            // 根据角色跳转到不同页面
            if (userData.role === 'ADMIN') {
                console.log('进入管理员判断分支')
                router.push('/admin/function')
            } else {
                console.log('进入教师判断分支')
                router.push('/home')
            }
        } else {
            ElMessage.error(response.data.message || '登录失败')
        }
    } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
    }
}
</script>

<style scoped>
.login-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(125deg, #3498db, #8e44ad);
    position: relative;
    overflow: hidden;
}

.login-page::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('@/assets/image/logo.png') no-repeat center center;
    background-size: 30%;
    opacity: 0.03;
    z-index: 0;
}

.login-container {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

.login-card {
    width: 480px;
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
}

.login-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 60px rgba(0, 0, 0, 0.3);
}

.logo-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.logo-circle {
    width: 90px;
    height: 90px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
    border: 4px solid rgba(255, 255, 255, 0.8);
    animation: pulse 3s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(61, 90, 254, 0.4);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(61, 90, 254, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(61, 90, 254, 0);
    }
}

.logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #fff;
}

.login-title {
    text-align: center;
}

.login-title h1 {
    color: #333;
    font-weight: bold;
    font-size: 28px;
    margin: 0;
    background: linear-gradient(90deg, #3498db, #8e44ad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.login-title p {
    color: #666;
    font-size: 16px;
    margin: 5px 0 0;
}

.login-form {
    width: 100%;
    margin-top: 20px;
}

.input-item {
    position: relative;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    z-index: 2;
}

.custom-input :deep(.el-input__wrapper) {
    background-color: #f5f7fa;
    border-radius: 30px;
    box-shadow: none;
    padding-left: 40px;
    height: 50px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.custom-input :deep(.el-input__wrapper):hover,
.custom-input :deep(.el-input__wrapper.is-focus) {
    border-color: #3d5afe;
    box-shadow: 0 0 0 1px #3d5afe33;
}

.custom-input :deep(.el-input__inner) {
    height: 46px;
    font-size: 16px;
}

.login-btn {
    margin-top: 10px;
    border-radius: 30px;
    width: 100%;
    height: 50px;
    font-weight: bold;
    font-size: 18px;
    background: linear-gradient(90deg, #3d5afe, #8c44ff);
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(61, 90, 254, 0.3);
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(61, 90, 254, 0.4);
}

.login-btn:active {
    transform: translateY(0);
}

.login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
    color: #606266;
}

.role-btn-group {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 24px;
    gap: 12px;
}

.role-btn {
    padding: 8px 24px;
    border-radius: 30px;
    border: 2px solid #3d5afe;
    background: #fff;
    color: #3d5afe;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    user-select: none;
    flex: 1;
    text-align: center;
    max-width: 110px;
}

.role-btn.active,
.role-btn:hover {
    background: #3d5afe;
    color: #fff;
    box-shadow: 0 5px 15px rgba(61, 90, 254, 0.3);
}

.login-links {
    margin-top: 16px;
    width: 100%;
    display: flex;
    justify-content: center;
    font-size: 14px;
    text-align: center;
}

.login-links a {
    color: #3d5afe;
    text-decoration: none;
    margin: 0 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.login-links a:hover {
    color: #8c44ff;
    text-decoration: underline;
}

.login-links .divider {
    color: #ddd;
    margin: 0 4px;
}

.footer {
    margin-top: 20px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    text-align: center;
}

@media (max-width: 520px) {
    .login-card {
        width: 90%;
        padding: 30px 20px;
    }
    
    .role-btn {
        padding: 8px 15px;
        font-size: 14px;
    }
    
    .login-title h1 {
        font-size: 24px;
    }
    
    .logo-circle {
        width: 80px;
        height: 80px;
    }
}
</style>