import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const user = ref<{
    username: string
    role: string
    avatar: string
  } | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
  }

  function setUser(userInfo: string) {
    try {
      user.value = JSON.parse(userInfo)
    } catch (e) {
      user.value = null
    }
  }

  function clearUser() {
    token.value = ''
    user.value = null
  }

  return {
    token,
    user,
    setToken,
    setUser,
    clearUser
  }
}) 