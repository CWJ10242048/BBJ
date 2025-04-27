<template>
    <el-aside :width="isCollapse ? '64px' : '220px'">
        <div class="back-icon" :style="{width: isCollapse ? '63px' : '219px'}">
            <span class="logo-text" :class="isCollapse? 'xiaoshi':''">
                <span style="background:#FFFFFF;color:#000000">&nbsp;AI备课&nbsp;</span>
                <span> 备倍佳</span>
            </span>
        </div>
        <el-menu
            @select="handleSelect"
            :collapse="isCollapse"
            :collapse-transition="false"
            class="el-menu-vertical"
            :unique-opened="true"
            background-color="#E0E6EF"
            :text-color="textColor"
            :default-active="activeMenu"
            active-text-color="#409EFF">
            <!-- 首页 -->
            <el-menu-item index="/home">
                <i class="el-icon-house"></i>
                <span slot="title">首页</span>
            </el-menu-item>
            <!-- 其余菜单 -->
            <template v-for="(item, index) in displayMenus" :key="index">
                <el-submenu v-if="item.menuType === 0" :index="item.menuName">
                    <template #title>
                        <i :class="item.icon"></i>
                        <span>{{ item.menuName }}</span>
                    </template>
                    <el-menu-item
                        v-for="(child, cidx) in item.child"
                        :key="cidx"
                        :index="child.routeUrl"
                    >
                        <i :class="child.icon"></i>
                        <span>{{ child.menuName }}</span>
                    </el-menu-item>
                </el-submenu>
                <el-menu-item v-else :index="item.routeUrl">
                    <i :class="item.icon"></i>
                    <span>{{ item.menuName }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </el-aside>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/stores/menu'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const menuStore = useMenuStore()
const isCollapse = ref(false)
const textColor = ref("#22304A")
const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => route.path)
const displayMenus = computed(() => menuStore.displayMenus)

function handleSelect(key: string) {
    router.push({ path: key })
}

onMounted(() => {
    if (window && window.$bus) {
        window.$bus.$on('collapse', res => {
            isCollapse.value = res
        })
    }
})
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
    }
    .el-menu-item i, .el-submenu__title i {
        color: $menu-text !important;
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