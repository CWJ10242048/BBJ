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
        <!-- 消息通知 Popover -->
        <el-popover
          placement="bottom-end"
          :width="300"
          trigger="click"
        >
          <template #reference>
            <div class="icon-div notification">
              <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" type="danger">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </div>
          </template>
          <div class="notification-popover">
            <div class="popover-header">
              <span>通知</span>
              <el-button type="text" size="small" @click="markAllRead">全部已读</el-button>
            </div>
            <el-scrollbar height="250px">
              <div v-if="notifications.length === 0" class="no-notifications">
                暂无新通知
              </div>
              <div v-else>
                <div v-for="item in notifications" :key="item.id" class="notification-item" :class="{ 'is-read': item.read }" @click="handleNotificationClick(item)">
                  <div class="notification-title">{{ item.title }}</div>
                  <div class="notification-time">{{ item.time }}</div>
                </div>
              </div>
            </el-scrollbar>
            <div class="popover-footer">
              <el-button type="text" size="small" @click="viewAllNotifications">查看全部</el-button>
            </div>
          </div>
        </el-popover>
        
        <div class="user-profile">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="avatar-container">
              <el-avatar :size="36" :src="lockBackImg" />
              <span class="username">{{ displayName }}</span>
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

    <!-- 全部通知对话框 -->
    <el-dialog
      v-model="allNotificationsDialogVisible"
      title="全部通知"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
      class="all-notifications-dialog"
    >
      <div class="dialog-content">
        <el-scrollbar height="400px">
          <div v-if="notifications.length === 0" class="no-notifications-dialog">
            当前没有通知
          </div>
          <div v-else class="notification-list-dialog">
            <div v-for="item in notifications" :key="item.id" class="notification-item-dialog" :class="{ 'is-read': item.read }">
              <div class="notification-content-dialog">
                <div class="notification-title-dialog">{{ item.title }}</div>
                <div class="notification-time-dialog">{{ item.time }}</div>
              </div>
              <el-button v-if="!item.read" type="text" size="small" @click="markSingleRead(item)">标为已读</el-button>
            </div>
          </div>
        </el-scrollbar>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="markAllReadInDialog">全部标记为已读</el-button>
          <el-button type="primary" @click="allNotificationsDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { useAppStore } from '@/stores/app'
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
import lockBackImg from '@/assets/image/lock-back.jpg'

// 定义emit
const emit = defineEmits(['toggle-collapse'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()
const appStore = useAppStore()
const search = ref("")
const collapse = ref(false)
const allNotificationsDialogVisible = ref(false)

// 模拟通知数据
const notifications = ref([
  {
    id: 1,
    title: '系统更新：新增学情分析功能',
    time: '2025-04-15',
    read: false
  },
  {
    id: 2,
    title: '教育部关于加强中小学课堂教学改革的通知',
    time: '2025-04-10',
    read: false
  },
  {
    id: 3,
    title: '本周教研活动安排',
    time: '2025-04-08',
    read: true
  },
  {
    id: 4,
    title: '智能备课系统使用指南已发布',
    time: '2025-04-05',
    read: true
  }
])

// 计算未读通知数量
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// 获取用户信息
const user = computed(() => userStore.user)

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
    '/resource-gen/lesson-plan': '教案生成',
    '/resource-gen/ppt': 'PPT生成',
    '/resource-gen/graphic': '资源生成',
    '/resource-gen/exercise': '习题生成',
    '/user-manage': '用户管理',
    
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
    if (user.value?.role === 'admin') {
      router.push("/admin/profile")
    } else {
      router.push("/profile")
    }
  } else if (command === "password") {
    router.push({ path: '/profile', hash: '#security' })
  } else if (command === "lock") {
    appStore.toggleLock(true)
  } else if (command === "logout") {
    userStore.setToken("")
    userStore.setUser("")
    router.push("/login")
  }
}

// 处理通知点击
function handleNotificationClick(item) {
  item.read = true
  // 实际应用中可能需要跳转到通知详情页
  console.log('Clicked notification:', item)
}

// 标记全部已读
function markAllRead() {
  notifications.value.forEach(item => item.read = true)
}

// 查看全部通知
function viewAllNotifications() {
  allNotificationsDialogVisible.value = true
}

// 在对话框中标记单个通知为已读
function markSingleRead(item) {
  item.read = true
}

// 在对话框中标记全部为已读
function markAllReadInDialog() {
  markAllRead()
}

// 用户名显示逻辑
const displayName = computed(() => {
  if (user.value?.role === 'admin') {
    return 'admin'
  }
  if (user.value?.role === 'teacher') {
    return '李老师'
  }
  return user.value?.username || '教师'
})
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
  padding: 0 20px; /* 保持左右边距 */
  box-sizing: border-box;
  height: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 500px; /* 稍微减小最大宽度 */
  background-color: #f0f2f5; /* 浅灰色背景 */
  border-radius: 20px; /* 圆角 */
  padding: 4px 4px 4px 15px; /* 内边距调整，左侧多一点给图标 */
  box-sizing: border-box;
  height: 40px; /* 增加整体高度 */
  transition: box-shadow 0.3s ease, background-color 0.3s ease; /* 添加过渡效果 */
}

.search-container:hover {
  background-color: #e9ecef; /* 悬停时稍变深 */
}

.search-container:focus-within {
  background-color: #fff; /* 输入时变白 */
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); /* 输入时添加蓝色外发光 */
}

.search-input {
  flex: 1;
  height: 100%; /* 填充容器高度 */
}

/* 深入修改 Element Plus 输入框内部样式 */
.search-input :deep(.el-input__wrapper) {
  background-color: transparent !important; /* 使背景透明 */
  box-shadow: none !important; /* 移除默认阴影 */
  border-radius: 0; /* 移除内部圆角 */
  padding: 0 10px 0 0; /* 移除内部左右边距，右侧留一点 */
  height: 100%; /* 填充容器高度 */
  font-size: 14px; /* 调整字体大小 */
}

/* 如果需要调整图标位置 */
.search-input :deep(.el-input__prefix) {
  /* 可能需要微调 */
}

.search-input :deep(.el-input__inner) {
  color: #303133; /* 输入文字颜色 */
}

.search-btn {
  border-radius: 16px; /* 按钮圆角，比容器略小 */
  height: 32px; /* 按钮高度 */
  padding: 0 20px; /* 按钮内边距 */
  border: none; /* 移除按钮边框 */
  margin-left: 5px; /* 和输入框稍微隔开 */
  /* 可以考虑更柔和的颜色 */
  /* background-color: #5a9cf8; */
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

/* 通知 Popover 样式 */
.notification-popover {
  display: flex;
  flex-direction: column;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}

.popover-header span {
  font-weight: 500;
}

.no-notifications {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 13px;
}

.notification-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.is-read {
  color: #909399;
}

.notification-item.is-read .notification-title {
  font-weight: normal;
}

.notification-title {
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 4px;
  font-weight: 500;
  white-space: normal;
  word-break: break-all;
}

.notification-time {
  font-size: 12px;
  color: #b0b3b8;
}

.popover-footer {
  text-align: center;
  padding: 8px 12px;
  border-top: 1px solid #ebeef5;
}

/* 调整 el-scrollbar 的内边距 */
:deep(.el-scrollbar__view) {
  padding: 0 !important; /* 清除 el-scrollbar 可能的默认内边距 */
}

/* 全部通知对话框样式 */
.all-notifications-dialog :deep(.el-dialog__body) {
  padding: 0; /* 去除 body 的内边距，由内部的 scrollbar 控制 */
}

.dialog-content {
  /* 可以添加一些内边距，如果需要的话 */
}

.no-notifications-dialog {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
  font-size: 14px;
}

.notification-list-dialog {
  padding: 10px 0;
}

.notification-item-dialog {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s;
}

.notification-item-dialog:hover {
  background-color: #f5f7fa;
}

.notification-item-dialog.is-read {
  color: #909399;
}

.notification-item-dialog.is-read .notification-title-dialog {
  font-weight: normal;
  color: #909399;
}

.notification-content-dialog {
  flex: 1;
  margin-right: 15px;
}

.notification-title-dialog {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 5px;
  font-weight: 500;
  color: #303133;
  white-space: normal;
  word-break: break-word;
}

.notification-time-dialog {
  font-size: 12px;
  color: #b0b3b8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>