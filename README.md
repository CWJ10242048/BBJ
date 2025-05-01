# 备倍佳 AI 备课系统

## 项目说明
本项目是一个基于 AI 的智能备课系统，旨在帮助教师提高备课效率和质量。系统提供教学设计自动化、教学资源生成、学情分析等功能。

## 目录结构说明

### frontend/ - 前端项目目录
- src/ - 源代码目录
  - assets/ - 静态资源文件（图片、样式等）
  - components/ - Vue 组件
  - router/ - 路由配置
  - stores/ - Pinia 状态管理
  - views/ - 页面视图组件
- public/ - 公共资源目录
- e2e/ - 端到端测试目录
- node_modules/ - 依赖包目录
- vscode/ - VS Code 配置
- logo/ - 项目标志资源
- .editorconfig - 编辑器配置
- .prettierrc.json - Prettier 代码格式化配置
- .eslint.config.ts - ESLint 代码规范配置
- index.html - 入口 HTML 文件
- package.json - 项目依赖配置
- playwright.config.ts - Playwright 测试配置
- tsconfig.app.json - TypeScript 应用配置
- tsconfig.json - TypeScript 基础配置
- tsconfig.node.json - TypeScript Node 配置
- tsconfig.vitest.json - TypeScript Vitest 配置
- vite.config.ts - Vite 构建工具配置
- vitest.config.ts - Vitest 测试配置
- vue.config.js - Vue 配置

### backend/ - 后端项目目录 [bbj]
- src/ - 源代码目录
  - main/ - 主要代码
    - java/ - Java 源代码
      - com/ - 包结构
        - bbj/ - 项目主包
          - config/ - 配置类
          - controller/ - 控制器
          - entity/ - 实体类
          - repository/ - 数据访问层
          - BbjApplication - 应用入口类
    - resources/ - 资源文件
      - application.properties - 应用配置文件
- target/ - 编译输出目录
- bbj.iml - IntelliJ IDEA 模块文件
- pom.xml - Maven 项目配置

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
- 后端：Spring Boot + JDK 11
- 构建工具：Maven

## 启动项目
1. **启动后端**
  - 确保使用 JDK 11
  - 使用 Maven 构建并运行项目：`mvn spring-boot:run`
  - 或在 IDE 中直接运行 BbjApplication 类

2. **启动前端**
  - 进入 frontend 目录：`cd frontend`
  - 安装依赖：`npm install`
  - 启动开发服务器：`npm run dev`