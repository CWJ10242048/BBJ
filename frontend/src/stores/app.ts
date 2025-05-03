import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isLocked = ref(false)

  function toggleLock(lockState: boolean) {
    isLocked.value = lockState
  }

  return { isLocked, toggleLock }
}) 