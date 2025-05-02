<template>
    <el-header class="header">
      <!-- 左侧 LOGO 和导航区域 -->
      <div class="header-left">
        <div class="icon-div" @click="changeCollapse">
          <el-icon><Expand v-if="collapse" /><Fold v-else /></el-icon>
        </div>
        <div class="logo-container">
          <span class="app-name">备倍佳</span>
        </div>
      </div>
      
      <!-- 中间搜索区域 -->
      <div class="header-center">
        <div class="search-container">
          <el-input 
            v-model="search" 
            placeholder="dev/开课..." 
            class="search-input"
            :prefix-icon="Search"
            clearable
          ></el-input>
          <el-button type="primary" class="search-btn">搜索</el-button>
        </div>
        </div>
      
      <!-- 右侧用户信息和操作区 -->
      <div class="header-right">
        <div class="icon-div notification">
          <el-badge :value="3" :max="99" type="danger">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </div>
        
        <div class="user-profile">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="36" src="/src/assets/image/lock-back.jpg" />
              <span class="username">李老师</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon><span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  <el-icon><Key /></el-icon><span>修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item command="lock">
                  <el-icon><Lock /></el-icon><span>锁屏</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="logout-item">
                  <el-icon><SwitchButton /></el-icon><span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { 
  Fold, 
  Expand,
  FullScreen, 
  Bell, 
  Key, 
  Lock, 
  SwitchButton,
  Search,
  ArrowDown,
  User
} from '@element-plus/icons-vue'

// 定义emit
const emit = defineEmits(['toggle-collapse'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()
const search = ref("")
const collapse = ref(false)

// 获取用户信息
const user = userStore.user

// 计算当前路由对应的菜单项
const currentMenuInfo = computed(() => {
  const path = route.path
  let parentName = ''
  let childName = ''
  
  // 所有父级路径对应的名称映射
  const parentPathMap = {
    '/teaching-design': '教学设计自动化',
    '/resource-gen': '教学资源生成',
    '/analysis': '学情分析',
    '/resource-lib': '资源库',
    '/personalized': '一键个性化备课',
    '/oj': '代码OJ',
    '/history': '输出历史',
    '/cooperation': '协作空间',
    '/profile': '个人中心',
    '/home': '首页'
  }
  
  // 子级路径映射
  const childPathMap = {
    // 教学设计子路径
    '/teaching-design/syllabus': '教学大纲设计',
    '/teaching-design/LessonPlan': '教案生成',
    '/teaching-design/interaction': '互动环节设计',
    
    // 教学资源生成子路径
    '/resource-gen/ppt': 'PPT生成',
    '/resource-gen/graphic': '图文生成',
    '/resource-gen/question': '智能出题',
    
    // 学情分析子路径
    '/analysis/student-board': '学生数据看板',
    '/analysis/cognition': '认知诊断',
    '/analysis/knowledge-track': '知识追踪',
    
    // 资源库子路径
    '/resource-lib/graph': '知识图谱',
    '/resource-lib/community': '资源社区'
  }
  
  // 首先检查是否是完整路径匹配
  if (childPathMap[path]) {
    // 找到父级路径
    for (const parentPath in parentPathMap) {
      if (path.startsWith(parentPath) && parentPath !== '/home') {
        return { 
          parent: parentPathMap[parentPath], 
          child: childPathMap[path]
        }
      }
    }
  }
  
  // 检查是否是父级路径
  if (parentPathMap[path]) {
    return { 
      parent: parentPathMap[path], 
      child: '' 
    }
  }
  
  // 遍历菜单也作为备用查找方法
  for (const menu of menuStore.displayMenus) {
    // 检查是否是父菜单路径
    if (menu.routeUrl === path) {
      return { parent: menu.menuName, child: '' }
    }
    
    // 检查子菜单
    if (menu.child && menu.child.length) {
      for (const subMenu of menu.child) {
        if (subMenu.routeUrl === path) {
          return { parent: menu.menuName, child: subMenu.menuName }
        }
      }
    }
  }
  
  return { parent: '', child: '' }
})

// 当前父级菜单名称
const currentParentMenu = computed(() => currentMenuInfo.value.parent)

// 当前子菜单名称
const currentChildMenu = computed(() => currentMenuInfo.value.child)

// 折叠侧边栏
function changeCollapse() {
  collapse.value = !collapse.value
  
  // 向父组件发送事件
  emit('toggle-collapse', collapse.value)
  
  // 同时也保留原有的方法，以保证兼容性
  if (window && window.$bus) {
    window.$bus.$emit('collapse', collapse.value)
  }
}

// 全屏
function full() {
  const de = document.documentElement
  if (de.requestFullscreen) {
    de.requestFullscreen()
  } else if (de.mozRequestFullScreen) {
    de.mozRequestFullScreen()
  } else if (de.webkitRequestFullScreen) {
    de.webkitRequestFullScreen()
  }
}

// 处理命令
function handleCommand(command) {
  if (command === "profile") {
    router.push("/profile")
  } else if (command === "password") {
    if (window && window.$bus) {
      window.$bus.$emit('password', true)
    }
  } else if (command === "lock") {
    if (window && window.$bus) {
      window.$bus.$emit('lock', 1)
    }
  } else if (command === "logout") {
    // 退出登录
    userStore.setToken("")
    userStore.setUser("")
    router.push("/login")
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
  padding: 0;
  margin: 0;
  justify-content: space-between;
  border-bottom: 1px solid #e0e0e0; /* 与侧边栏边框颜色保持一致 */
  box-sizing: border-box;
}

/* 左侧区域 */
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
  color: #4a8ccf; /* 蓝色文字 */
}

/* 中间搜索区域 */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 600px;
  padding: 0 20px;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 4px 0 0 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.search-btn {
  border-radius: 0 4px 4px 0;
}

/* 右侧用户区域 */
.header-right {
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 100%;
  box-sizing: border-box;
}

.notification {
  margin-right: 15px;
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

/* 响应式布局 */
@media (max-width: 768px) {
  .header-center {
    display: none;
  }
  
  .header-left, .header-right {
    padding: 0 10px;
  }
}

:deep(.el-dropdown-menu__item.logout-item) {
  color: #f56c6c;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 5px;
}
</style>