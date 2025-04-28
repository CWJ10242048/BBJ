<template>
    <el-header class="header">
      <div class="header-left">
        <div class="icon-div" @click="changeCollapse">
          <el-icon><Fold /></el-icon>
        </div>
        <div class="logo-title">
          <span class="app-name">备倍佳</span>
          <span class="app-subtitle">AI备课系统</span>
        </div>
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentParentMenu">{{ currentParentMenu }}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentChildMenu && currentChildMenu !== currentParentMenu">{{ currentChildMenu }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
      <div class="header-right">
        <div class="search-input">
          <el-input 
            v-model="search" 
            placeholder="搜索..." 
            :prefix-icon="Search"
            size="small"
            clearable
          ></el-input>
        </div>
        <div class="icon-div" @click="full">
          <el-icon><FullScreen /></el-icon>
        </div>
        <div class="icon-div">
          <el-badge :value="3" :max="99" type="danger">
            <el-icon><Bell /></el-icon>
          </el-badge>
        </div>
        <div class="icon-div">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="32" src="/src/assets/image/lock-back.jpg" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
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
        <div class="user-info">
          <div class="user-name">李老师</div>
          <div class="user-role">教师</div>
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
  FullScreen, 
  Bell, 
  Key, 
  Lock, 
  SwitchButton,
  Search
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
    '/teaching-design/plan': '教案生成',
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
    '/resource-lib/community': '资源社区',
    '/resource-lib/concept': '概念先决识别'
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
  if (command === "password") {
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
  padding: 0 20px;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-title {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  line-height: 1.2;
}

.app-name {
  font-size: 16px;
  font-weight: bold;
  color: #4a8ccf; /* 更淡的蓝色 */
}

.app-subtitle {
  font-size: 12px;
  color: #8c8c8c;
}

.breadcrumb {
  margin-left: 20px;
  font-size: 14px;
  border-left: 1px solid #e0e0e0;
  padding-left: 20px;
}

.icon-div {
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  color: #606266;
  transition: all 0.3s;
}

.icon-div:hover {
  background-color: #f0f7ff;
  color: #4a8ccf; /* 更淡的蓝色 */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 220px;
  margin-right: 10px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border-radius: 20px;
}

.user-info {
  margin-left: 8px;
  line-height: 1.2;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-role {
  font-size: 12px;
  color: #8c8c8c;
}

:deep(.el-dropdown-menu__item.logout-item) {
  color: #f56c6c;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 5px;
}
</style>