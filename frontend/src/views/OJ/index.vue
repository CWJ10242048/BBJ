<template>
  <div class="oj-container">
    <el-tabs v-model="activeTab" class="oj-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="题目列表" name="problem-list"></el-tab-pane>
      <el-tab-pane label="提交记录" name="submissions"></el-tab-pane>
      <el-tab-pane label="排行榜" name="leaderboard"></el-tab-pane>
    </el-tabs>
    
    <div class="router-view-container" :class="{ 'fade-in': isRouteReady }">
      <template v-if="isRouteReady">
        <keep-alive>
          <router-view />
        </keep-alive>
      </template>
      <template v-else>
        <div class="loading-placeholder">
          <el-skeleton :rows="10" animated />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 默认激活的标签页
const activeTab = ref('problem-list')
// 路由准备就绪标记
const isRouteReady = ref(true)
// 是否正在路由切换
const isNavigating = ref(false)

// 初始化时设置正确的激活标签
const initActiveTab = () => {
  const path = route.path
  if (path.includes('/oj/problem-list')) {
    activeTab.value = 'problem-list'
  } else if (path.includes('/oj/submissions')) {
    activeTab.value = 'submissions'
  } else if (path.includes('/oj/leaderboard')) {
    activeTab.value = 'leaderboard'
  } else {
    // 默认为题目列表
    activeTab.value = 'problem-list'
  }
}

// 初始化
initActiveTab()

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 只在路由变化时更新标签，避免循环
  if (!isNavigating.value) {
    initActiveTab()
  }
  // 重置导航状态
  isNavigating.value = false
}, { immediate: false })

// 处理标签页点击
const handleTabClick = (tab: any) => {
  // 得到tab的name
  const tabName = tab.props.name
  
  if (activeTab.value === tabName) return
  
  console.log('Tab clicked:', tabName)
  
  // 设置导航状态，防止watch监听触发循环
  isNavigating.value = true
  // 临时隐藏视图
  isRouteReady.value = false
  
  // 构建路径并导航
  const path = `/oj/${tabName}`
  console.log('Navigating to:', path)
  
  // 使用timeout确保UI有时间响应
  setTimeout(() => {
    router.push(path).then(() => {
      // 路由完成后显示内容
      setTimeout(() => {
        isRouteReady.value = true
      }, 50)
    }).catch(err => {
      console.error('Navigation error:', err)
      isRouteReady.value = true
      isNavigating.value = false
    })
  }, 10)
}
</script>

<style scoped>
.oj-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

.oj-tabs {
  margin-bottom: 20px;
}

.router-view-container {
  flex: 1;
  position: relative;
  min-height: 300px;
}

.loading-placeholder {
  padding: 20px;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
</style> 