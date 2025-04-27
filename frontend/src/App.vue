<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Document, Files, DataAnalysis, Collection, Edit, Cpu, Histogram, Connection, User } from '@element-plus/icons-vue'
import Aside from '@/components/layout/aside.vue'
import Header from '@/components/layout/header.vue'
</script>

<template>
  <el-container class="layout-container">
    <Aside />
    <el-container>
      <Header />
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #545c64;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
