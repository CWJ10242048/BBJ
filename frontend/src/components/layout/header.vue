<template>
    <el-header class="header">
      <div class="header-left">
        <div class="icon-div" @click="changeCollapse">
          <el-icon><Fold /></el-icon>
        </div>
      </div>
      <div class="header-right">
        <div class="search-input">
          <el-input v-model="search" size="mini" placeholder="Search..." suffix-icon="el-icon-search"></el-input>
        </div>
        <div class="icon-div" @click="full">
          <el-icon><FullScreen /></el-icon>
        </div>
        <div class="icon-div">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="icon-div">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              <img class="avatar-img" src="/src/assets/image/lock-back.jpg" />
            </span>
            <el-dropdown-menu slot="dropdown" style="font-weight:bold">
              <el-dropdown-item command="password"><el-icon><Ship /></el-icon> 修改密码</el-dropdown-item>
              <el-dropdown-item command="lock"><el-icon><Lock /></el-icon> 锁屏</el-dropdown-item>
              <el-dropdown-item divided style="color:red" command="logout"><el-icon><Umbrella /></el-icon> 退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="icon-div" style="width:120px;">
          <div class="user-name">李老师</div>
        </div>
      </div>
    </el-header>
</template>

<script>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Fold, FullScreen, Bell, Ship, Lock, Umbrella } from '@element-plus/icons-vue'

export default {
  name: "header",
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const search = ref("")
    const collapse = ref(false)

    // 头像和用户名
    const user = userStore.user

    function changeCollapse() {
      collapse.value = !collapse.value
      // 这里假设有全局事件总线
      if (window && window.$bus) {
        window.$bus.$emit('collapse', collapse.value)
      }
    }

    function full() {
      let de = document.documentElement
      if (de.requestFullscreen) {
        de.requestFullscreen()
      } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen()
      } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen()
      }
    }

    function handleCommand(command) {
      if(command == "password") {
        if (window && window.$bus) {
          window.$bus.$emit('password', true)
        }
      } else if(command == "lock") {
        if (window && window.$bus) {
          window.$bus.$emit('lock', 1)
        }
      } else if(command == "logout") {
        //退出登陆
        logout().then(res => { 
          if(res.code == 1000) {
            userStore.setToken("")
            userStore.setUser({ userName: '', avatar: '/img/avatar.jpg', id: '' })
            removeToken()
            router.push("/login")
            if (window && window.$message) {
              window.$message({
                message: "退出登陆",
                type: 'success'
              })
            }
            setTimeout(function(){
              window.location.reload()
            },1000)
          } else {
            if (window && window.$message) {
              window.$message({
                message: res.message,
                type: 'warning'
              })
            }
          }
        })
      }
    }

    return {
      user,
      search,
      collapse,
      changeCollapse,
      full,
      handleCommand,
      Fold,
      FullScreen,
      Bell,
      Ship,
      Lock,
      Umbrella
    }
  }
}
</script>

<style scoped>
    .header {
      background-color: #fff;
      width: 100%;
      height: 60px !important;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-left: 0;
      justify-content: space-between;
      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
    }
    .header-left {
      display: flex;
      align-items: center;
    }
    .header-right {
      width: auto;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .icon-div {
      width: 50px;
      height: 50px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      position: relative;
    }
    .icon {
      font-size: 22px;
      color: #606266;
    }
    .search-input {
      width: 200px;
      margin-right: 10px;
    }
    .el-input {
      background-color: #F5F7FA !important;
    }
    .avatar-img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e4e7ed;
    }
    .user-name {
      font-size: 15px;
      font-family: '黑体', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      color: #333;
      text-align: center;
    }
</style>