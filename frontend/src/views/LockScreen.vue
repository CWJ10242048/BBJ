<template>
  <transition name="fade">
    <div v-if="appStore.isLocked" class="lock-screen-overlay">
      <div class="lock-content">
        <el-avatar :size="80" :src="(userStore.user as any)?.avatarUrl || userStore.user?.avatar || lockBackImg" class="user-avatar"/>
        <!-- <div class="user-name">{{ (userStore.user as any)?.nickname || userStore.user?.userName || '教师' }}</div> -->
        <div class="user-role">{{ userStore.user?.role === 'admin' ? '管理员' : '教师' }}</div>
        <div class="lock-tip">屏幕已锁定</div>
        <el-input
          v-model="password"
          type="password"
          placeholder="请输入密码解锁"
          show-password
          class="password-input"
          @keyup.enter="handleUnlock"
        >
          <template #prepend>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleUnlock" class="unlock-button">解锁</el-button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import lockBackImg from '@/assets/image/lock-back.jpg' // 引入默认头像

const appStore = useAppStore()
const userStore = useUserStore()
const password = ref('')

const handleUnlock = () => {
  // --- 模拟密码验证 ---
  // 在实际应用中，应该调用后端 API 进行验证
  // 这里我们简单地假设密码是 '123456'
  if (password.value === '123456') {
    appStore.toggleLock(false) // 解锁
    password.value = '' // 清空密码
    ElMessage.success('解锁成功')
  } else {
    ElMessage.error('密码错误')
    password.value = '' // 清空密码
  }
}
</script>

<style scoped>
.lock-screen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色背景 */
  backdrop-filter: blur(15px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(15px); /* Safari 兼容 */
  z-index: 9999; /* 最高层级 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.lock-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.user-avatar {
  margin-bottom: 15px;
  border: 3px solid #fff;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.user-role {
  font-size: 15px;
  color: #409EFF;
  margin-bottom: 6px;
  font-weight: 500;
}

.lock-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
}

.password-input {
  width: 280px;
  margin-bottom: 20px;
}

.password-input :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.unlock-button {
  width: 120px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 