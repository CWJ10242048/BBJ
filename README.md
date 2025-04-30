# 备倍佳 AI 备课系统

## 项目说明
本项目是一个基于 AI 的智能备课系统，旨在帮助教师提高备课效率和质量。系统提供教学设计自动化、教学资源生成、学情分析等功能。

## 目录结构说明

### frontend/ - 前端项目目录
- src/ - 源代码目录
  - assets/ - 静态资源文件（图片、样式等）
  - components/ - Vue 组件
    - layout/ - 布局相关组件
      - header.vue - 页面头部组件
  - router/ - 路由配置
  - stores/ - Pinia 状态管理
  - views/ - 页面视图组件
- public/ - 公共资源目录
- e2e/ - 端到端测试目录
- node_modules/ - 依赖包目录

### 配置文件说明
- package.json - 项目依赖配置
- vite.config.ts - Vite 构建工具配置
- tsconfig.json - TypeScript 配置
- eslint.config.ts - ESLint 代码规范配置
- .prettierrc.json - Prettier 代码格式化配置

## 主要功能模块
1. 教学设计自动化
2. 教学资源生成
3. 学情分析
4. 资源库管理
5. 个性化备课
6. 代码 OJ
7. 协作空间

## 技术栈
- 前端：Vue 3 + TypeScript + Vite
- UI 框架：Element Plus
- 状态管理：Pinia
- 路由：Vue Router
- 测试：Vitest + Playwright 

## 启动项目
首先要启动后端，我用的JDK版本是11。用maven然后运行项目即可，然后再启动前端。

cd 进入frontend，然后npm run dev