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
  overflow: hidden; /* 禁用默认滚动条 */
}

#app {
  height: 100%;
  overflow: hidden;
}
</style>
