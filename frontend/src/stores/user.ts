import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      userName: '',
      avatar: '/img/avatar.jpg',
      id: ''
    },
    token: ''
  }),
  actions: {
    setUser(user: any) {
      this.user = user
    },
    setToken(token: string) {
      this.token = token
    },
    logout() {
      this.user = { userName: '', avatar: '/img/avatar.jpg', id: '' }
      this.token = ''
    }
  }
}) 