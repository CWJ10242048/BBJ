<template>
  <router-view />
  <LockScreen />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import LockScreen from '@/views/LockScreen.vue'
</script>

<style>
/* 全局样式，移除多余滚动条 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  height: 100%;
}

.app-container > * {
  flex: 1;
  overflow-y: auto;
}

/* Element Plus 滚动条样式 (可选) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #a8abb2;
}
</style>
