<template>
  <router-view />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
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
</style>
