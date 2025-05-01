<template>
    <el-aside :width="isCollapse ? '64px' : '220px'" class="main-aside">
        <div class="logo-container" :class="{ 'logo-collapsed': isCollapse }">
            <img src="@/assets/image/logo.png" alt="Logo" class="logo-img" v-if="!isCollapse" />
            <img src="@/assets/image/logo.png" alt="Logo" class="logo-img-small" v-else />
            <div class="logo-wrapper" v-if="!isCollapse">
                <span class="app-title">备倍佳</span>
                <span class="app-subtitle">AI备课平台</span>
            </div>
        </div>
        <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical"
            :collapse="isCollapse"
            :collapse-transition="false"
            :unique-opened="true"
            background-color="#e8f0f9"
            text-color="#333333"
            active-text-color="#ffffff"
            router>
            <el-menu-item index="/home" class="menu-item">
                <el-icon><HomeFilled /></el-icon>
                <span>首页</span>
            </el-menu-item>
            
            <el-menu-item index="/teaching-design/syllabus" class="menu-item">
                <el-icon><Document /></el-icon>
                <span>教学大纲设计</span>
            </el-menu-item>
            
            <el-menu-item index="/teaching-design/plan" class="menu-item">
                <el-icon><EditPen /></el-icon>
                <span>教案生成</span>
            </el-menu-item>
            
            <el-menu-item index="/teaching-design/interaction" class="menu-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>互动环节设计</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-gen/ppt" class="menu-item">
                <el-icon><PictureFilled /></el-icon>
                <span>PPT生成</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-gen/graphic" class="menu-item">
                <el-icon><Picture /></el-icon>
                <span>图文生成</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-gen/question" class="menu-item">
                <el-icon><QuestionFilled /></el-icon>
                <span>智能出题</span>
            </el-menu-item>
            
            <el-menu-item index="/analysis/student-board" class="menu-item">
                <el-icon><Histogram /></el-icon>
                <span>学生数据看板</span>
            </el-menu-item>
            
            <el-menu-item index="/analysis/cognition" class="menu-item">
                <el-icon><DataLine /></el-icon>
                <span>认知诊断</span>
            </el-menu-item>
            
            <el-menu-item index="/analysis/knowledge-track" class="menu-item">
                <el-icon><TrendCharts /></el-icon>
                <span>知识追踪</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-lib/graph" class="menu-item">
                <el-icon><Share /></el-icon>
                <span>知识图谱</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-lib/community" class="menu-item">
                <el-icon><UserFilled /></el-icon>
                <span>资源社区</span>
            </el-menu-item>
            
            <el-menu-item index="/resource-lib/concept" class="menu-item">
                <el-icon><Connection /></el-icon>
                <span>概念先决识别</span>
            </el-menu-item>
            
            <el-menu-item index="/personalized" class="menu-item">
                <el-icon><MagicStick /></el-icon>
                <span>一键个性化备课</span>
            </el-menu-item>
            
            <el-menu-item index="/oj" class="menu-item">
                <el-icon><Monitor /></el-icon>
                <span>代码OJ</span>
            </el-menu-item>
            
            <el-menu-item index="/history" class="menu-item">
                <el-icon><Notebook /></el-icon>
                <span>输出历史</span>
            </el-menu-item>
            
            <el-menu-item index="/cooperation" class="menu-item">
                <el-icon><Service /></el-icon>
                <span>协作空间</span>
            </el-menu-item>
            
            <el-menu-item index="/profile" class="menu-item">
                <el-icon><User /></el-icon>
                <span>个人中心</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { 
    HomeFilled, 
    Document, 
    EditPen, 
    ChatDotRound, 
    PictureFilled,
    Picture,
    QuestionFilled,
    Histogram,
    DataLine,
    TrendCharts,
    Share,
    UserFilled,
    Connection,
    MagicStick,
    Monitor,
    Notebook,
    Service,
    User
} from '@element-plus/icons-vue'

// 接收折叠状态作为props
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const menuStore = useMenuStore()

// 获取菜单数据
const displayMenus = computed(() => menuStore.displayMenus)

// 当前激活的菜单
const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
// 蓝白配色方案 - 更淡的颜色
$primary-blue: #4a8ccf;  // 淡蓝色主色调，原先是#1e62c0
$light-blue: #6ba4e2;    // 更淡的浅蓝色高亮，原先是#3c84e6
$darker-blue: #3a78b5;   // 更淡的深蓝色，原先是#164785
$white: #ffffff;         // 白色文字
$hover-bg: #5998da;      // 更淡的悬停背景色，原先是#2a6fd1
$bg-color: #e8f0f9;      // 浅蓝色背景色

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
    height: 60px;
    background-color: $bg-color;
    justify-content: flex-start;
    align-items: center;
    transition: width 0.3s;
    padding: 0 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    width: 100%;
    box-sizing: border-box;
}

.logo-collapsed {
    justify-content: center;
    padding: 0;
}

.logo-img {
    height: 36px;
    width: 36px;
    margin-right: 10px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.logo-img-small {
    height: 36px;
    width: 36px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
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
    line-height: 1.2;
}

.app-subtitle {
    font-size: 12px;
    color: #666;
    line-height: 1.2;
}

.el-menu {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: none !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    font-weight: 500 !important;
    padding: 10px 10px 0 10px;
    background-color: $bg-color !important;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;  /* Firefox */
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;  /* Firefox */
}

.el-menu::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.el-menu::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.el-menu::-webkit-scrollbar-track {
    background: transparent;
}

:deep(.el-menu-item), 
:deep(.el-sub-menu__title) {
    height: 40px !important;
    line-height: 40px !important;
    color: #333 !important;
    margin: 2px 0;
    padding-left: 20px !important;
    border-radius: 8px;
    background-color: transparent !important;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.6) !important;
        color: $primary-blue !important;
    }
}

:deep(.el-menu-item.is-active) {
    background-color: $primary-blue !important;
    color: $white !important;
    position: relative;
    border-radius: 8px;
    
    &::before {
        content: none;
    }
}

.menu-item {
    margin-bottom: 4px;
}

.menu-item:last-child {
    margin-bottom: 0;
}

:deep(.el-menu--inline) {
    background-color: transparent !important;
    padding-left: 10px;
}

:deep(.el-menu--inline .el-menu-item) {
    min-width: auto;
    background-color: transparent !important;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.6) !important;
        color: $primary-blue !important;
    }
    
    &.is-active {
        background-color: $primary-blue !important;
        color: $white !important;
    }
}

:deep(.el-sub-menu__title) {
    padding-left: 20px !important;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: #333 !important;
}

:deep(.el-icon) {
    color: #333 !important;
    margin-right: 10px !important;
}

:deep(.el-menu-item.is-active .el-icon) {
    color: $white !important;
}

// 折叠时图标居中
.el-menu--collapse :deep(.el-sub-menu__title), 
.el-menu--collapse :deep(.el-menu-item) {
    padding: 0 !important;
    text-align: center;
    justify-content: center;
    margin-left: 0 !important;
    
    .el-icon {
        margin: 0 !important;
    }
    
    span {
        display: none;
    }
}

// 修复折叠时子菜单图标不居中问题
.el-menu--collapse :deep(.el-sub-menu) {
    & > .el-sub-menu__title {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 !important;
        
        & > * {
            margin: 0 !important;
        }
        
        .el-sub-menu__icon-arrow {
            display: none;
        }
    }
}

// 确保图标垂直居中对齐
:deep(.el-menu-item), 
:deep(.el-sub-menu__title) {
    display: flex;
    align-items: center;
}

// 确保折叠模式下el-icon垂直居中
.el-menu--collapse {
    padding-top: 5px;
}

// 在折叠时，图标居中显示的样式
.el-menu--collapse :deep(.el-menu-item),
.el-menu--collapse :deep(.el-sub-menu) {
    text-align: center;
        position: relative;
        
        .el-icon {
        position: relative;
        left: 0;
        transform: none;
        margin: 0;
    }
}

// 折叠时标题处理
.el-menu--collapse + .logo-container {
    .logo-wrapper {
        margin-left: 0;
        align-items: center;
    }
    
    .app-subtitle {
        display: none;
    }
}

.el-menu--collapse :deep(.el-sub-menu__title) {
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    
    & > * {
        margin: 0;
    }
    
    .el-sub-menu__icon-arrow {
        display: none;
    }
}
</style>