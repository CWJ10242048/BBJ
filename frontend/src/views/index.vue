<template>
  <div class="index-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 自动重定向到首页
  router.push('/home')
})
</script>

<style scoped>
.index-container {
  width: 100%;
  height: 100%;
}
</style> 