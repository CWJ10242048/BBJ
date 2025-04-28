<template>
    <el-aside :width="isCollapse ? '64px' : '220px'">
        <div class="back-icon" :style="{width: isCollapse ? '63px' : '219px'}">
            <span class="logo-text" :class="isCollapse? 'xiaoshi':''">
                <span style="background:#FFFFFF;color:#000000">&nbsp;AI备课&nbsp;</span>
                <span> 备倍佳</span>
            </span>
        </div>
        <el-menu
            :default-active="activeMenu"
            class="el-menu-vertical"
            :collapse="isCollapse"
            :collapse-transition="false"
            :unique-opened="true"
            background-color="#E0E6EF"
            :text-color="textColor"
            active-text-color="#409EFF"
            router>
            <template v-for="menu in displayMenus" :key="menu.menuName">
                <!-- 有子菜单的情况 -->
                <el-sub-menu v-if="menu.child && menu.child.length" :index="menu.menuName">
                    <template #title>
                        <i :class="menu.icon"></i>
                        <span>{{ menu.menuName }}</span>
                    </template>
                    <el-menu-item
                        v-for="subMenu in menu.child"
                        :key="subMenu.routeUrl"
                        :index="subMenu.routeUrl"
                    >
                        <i :class="subMenu.icon"></i>
                        <span>{{ subMenu.menuName }}</span>
                    </el-menu-item>
                </el-sub-menu>
                <!-- 无子菜单的情况 -->
                <el-menu-item v-else :index="menu.routeUrl">
                    <i :class="menu.icon"></i>
                    <span>{{ menu.menuName }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </el-aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const menuStore = useMenuStore()

// 获取菜单数据
const displayMenus = computed(() => menuStore.displayMenus)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 是否折叠
const isCollapse = ref(false)
const textColor = ref("#22304A")
</script>

<style scoped lang="scss">
$main-bg: #D3DBE6;
$menu-bg: #E0E6EF;
$menu-bg-active: #B7C4D5;
$menu-text: #22304A;
$menu-active: #1765AD;

.el-aside {
    background-color: $main-bg;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.back-icon {
    display: flex;
    height: 80px;
    background-color: $main-bg;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid #A9B7C9;
}

.logo {
    width: 40px;
    height: 40px;
}

.logo-text {
    padding-left: 6px;
    color: $menu-text;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    letter-spacing: 0.5px;
}

.el-menu {
    height: calc(100vh - 80px);
    overflow-x: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
    font-weight: 500 !important;
    background-color: $menu-bg !important;
    border-right: none !important;
}

.el-menu::-webkit-scrollbar,.el-aside::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

.el-menu-item, .el-submenu__title {
    height: 45px !important;
    line-height: 45px !important;
    color: $menu-text !important;
    background-color: $menu-bg !important;
    transition: background 0.2s, color 0.2s, border-radius 0.2s;
    border-radius: 16px;
    margin: 6px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.el-menu-item i, .el-submenu__title i {
    color: $menu-text !important;
    margin-right: 0 !important;
}

.el-menu-item span, .el-submenu__title span {
    text-align: center;
    flex: 1;
}

.el-menu-vertical:deep(.el-menu-item:hover),
.el-menu-vertical:deep(.el-menu-item.is-active),
:deep(.el-submenu__title:hover),
.el-submenu:deep(.el-menu-item.is-active) {
    color: #fff !important;
    background-color: #7d8fff !important;
    border-radius: 16px !important;
    border-right: none !important;
    box-shadow: 0 2px 8px 0 rgba(125, 143, 255, 0.08);
    margin: 6px 12px;
}

.el-menu-item.is-active i,
.el-menu-item:hover i {
    color: #fff !important;
}

:deep(.el-submenu__title),
:deep(.el-menu--inline),
:deep(.el-menu--inline) .el-menu-item,
:deep(.el-submenu .el-menu),
:deep(.el-submenu .el-menu-item),
:deep(.el-submenu .el-submenu__title) {
    background-color: $menu-bg !important;
    color: $menu-text !important;
}

:deep(.el-menu--inline) .el-menu-item:hover,
:deep(.el-menu--inline) .el-menu-item.is-active,
:deep(.el-submenu .el-menu-item.is-active),
:deep(.el-submenu .el-menu-item:hover),
:deep(.el-submenu__title.is-active),
:deep(.el-submenu__title:hover) {
    background-color: $menu-bg-active !important;
    color: $menu-active !important;
}

.el-menu:not(:last-child) {
    border-bottom: 1px solid #A9B7C9;
}

/* 强制圆角和高亮 */
:deep(.el-menu-item),
:deep(.el-submenu__title) {
    border-radius: 16px !important;
    margin: 6px 12px !important;
    transition: background 0.2s, color 0.2s, border-radius 0.2s !important;
}

:deep(.el-menu-item.is-active),
:deep(.el-menu-item:hover),
:deep(.el-submenu__title.is-active),
:deep(.el-submenu__title:hover) {
    background: #7d8fff !important;
    color: #fff !important;
    border-radius: 16px !important;
    box-shadow: 0 2px 8px 0 rgba(125, 143, 255, 0.08) !important;
    border-right: none !important;
    margin: 6px 12px !important;
}

:deep(.el-menu-item.is-active i),
:deep(.el-menu-item:hover i),
:deep(.el-submenu__title.is-active i),
:deep(.el-submenu__title:hover i) {
    color: #fff !important;
}
</style>