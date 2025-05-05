<template>
  <el-container class="layout-container">
    <Aside :isCollapse="isCollapse" :admin="true" />
    <el-container class="main-container">
      <HeaderBar :collapse="isCollapse" @toggle-collapse="handleToggleCollapse" />
      <el-main class="content-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Aside from '@/components/layout/aside.vue'
import HeaderBar from '@/components/layout/header.vue'
import { ref } from 'vue'

const isCollapse = ref(false)
const handleToggleCollapse = (val) => {
  isCollapse.value = val
}
</script>

<style scoped lang="scss">
// 蓝白配色方案
$primary-blue: #4a8ccf;
$light-blue: #6ba4e2;
$darker-blue: #3a78b5;
$white: #ffffff;
$hover-bg: #5998da;
$bg-color: #e8f0f9;

.layout-container {
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.main-container {
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  padding: 0;
  margin: 0;
}

.content-main {
  padding: 15px;
  overflow-y: auto;
  background-color: #f5f7fa;
  height: calc(100vh - 60px);
}

.main-aside {
  background-color: $bg-color;
  height: 100%;
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  border-right: 1px solid #e0e0e0;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 48px;
  background-color: $bg-color;
  justify-content: flex-start;
  padding: 0 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.logo-collapsed {
  justify-content: center;
  padding: 0;
  width: 64px !important;
}

.logo-img {
  height: 28px;
  width: 28px;
  margin-right: 8px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
}

.logo-img-small {
  height: 28px;
  width: 28px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.app-title {
  font-size: 16px;
  font-weight: bold;
  color: $primary-blue;
}

.app-subtitle {
  font-size: 12px;
  color: #666;
}

.header {
  background-color: #fff;
  width: 100%;
  height: 60px !important;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;
  margin: 0;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}

.icon-div {
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  margin-right: 5px;
}

.icon-div:hover {
  color: #409EFF;
}

.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;
}

.app-name {
  font-size: 20px;
  font-weight: bold;
  color: $primary-blue;
}

.header-right {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 100%;
  box-sizing: border-box;
}

.user-profile {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
  margin: 0 5px;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  &:hover {
    background-color: $hover-bg !important;
  }
  &.is-active {
    background-color: $primary-blue !important;
  }
}

:deep(.el-menu--collapse .el-sub-menu .el-sub-menu__icon-arrow) {
  display: none !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  visibility: hidden !important;
  position: absolute !important;
  pointer-events: none !important;
}

.el-menu {
  border-right: none !important;
  background-color: $bg-color !important;
  padding: 10px 0 0 0;
  box-shadow: none;
  flex: unset;
  display: block;
}
</style> 