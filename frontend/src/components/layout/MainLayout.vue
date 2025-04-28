<template>
  <el-container class="layout-container">
    <Aside />
    <el-container>
      <Header />
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import Aside from './aside.vue'
import Header from './header.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
</style>
