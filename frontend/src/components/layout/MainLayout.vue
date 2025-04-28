<template>
  <el-container class="layout-container">
    <Aside :is-collapse="sidebarCollapsed" />
    <el-container class="main-container">
      <Header @toggle-collapse="toggleSidebar" />
      <el-main class="content-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import Aside from './aside.vue'
import Header from './header.vue'

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 切换侧边栏状态
function toggleSidebar(value) {
  console.log('Toggling sidebar to:', value)
  sidebarCollapsed.value = value !== undefined ? value : !sidebarCollapsed.value
}

// 监视折叠状态变化
watch(sidebarCollapsed, (newValue) => {
  console.log('Sidebar collapsed:', newValue)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.main-container {
  flex-direction: column;
  overflow: hidden;
}

.content-main {
  padding: 15px;
  overflow-y: auto;
  background-color: #f5f7fa;
}
</style>
