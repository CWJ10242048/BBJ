import { defineStore } from 'pinia'

interface MenuItem {
  menuName: string;
  routeUrl?: string;
  icon?: string;
  menuType: number;
  child?: MenuItem[];
  [key: string]: any;
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    activeMenuArrary: [] as MenuItem[],
    displayMenus: [
      // 教学设计自动化
      {
        menuName: '教学设计自动化',
        icon: 'el-icon-s-operation',
        menuType: 0,
        child: [
          { menuName: '教学大纲设计', routeUrl: '/teaching-design/syllabus', icon: 'el-icon-document', menuType: 1 },
          { menuName: '教案生成', routeUrl: '/teaching-design/plan', icon: 'el-icon-edit', menuType: 1 },
          { menuName: '互动环节设计', routeUrl: '/teaching-design/interaction', icon: 'el-icon-chat-dot-round', menuType: 1 }
        ]
      },
      // 教学资源生成
      {
        menuName: '教学资源生成',
        icon: 'el-icon-folder',
        menuType: 0,
        child: [
          { menuName: 'PPT生成', routeUrl: '/resource-gen/ppt', icon: 'el-icon-files', menuType: 1 },
          { menuName: '资源生成', routeUrl: '/resource-gen/graphic', icon: 'el-icon-picture', menuType: 1 },
          { menuName: '智能出题', routeUrl: '/resource-gen/question', icon: 'el-icon-edit-outline', menuType: 1 }
        ]
      },
      // 学情分析
      {
        menuName: '学情分析',
        icon: 'el-icon-data-analysis',
        menuType: 0,
        child: [
          { menuName: '学生数据看板', routeUrl: '/analysis/student-board', icon: 'el-icon-pie-chart', menuType: 1 },
          { menuName: '认知诊断', routeUrl: '/analysis/cognition', icon: 'el-icon-connection', menuType: 1 },
          { menuName: '知识追踪', routeUrl: '/analysis/knowledge-track', icon: 'el-icon-aim', menuType: 1 }
        ]
      },
      // 资源库
      {
        menuName: '资源库',
        icon: 'el-icon-collection',
        menuType: 0,
        child: [
          { menuName: '知识图谱', routeUrl: '/resource-lib/graph', icon: 'el-icon-share', menuType: 1 },
          { menuName: '资源社区', routeUrl: '/resource-lib/community', icon: 'el-icon-user', menuType: 1 }
        ]
      },
      // 其它一级菜单
      { menuName: '一键个性化备课', routeUrl: '/personalized', icon: 'el-icon-edit', menuType: 1 },
      { menuName: '代码OJ', routeUrl: '/oj', icon: 'el-icon-cpu', menuType: 1 },
      { menuName: '输出历史', routeUrl: '/history', icon: 'el-icon-data-board', menuType: 1 },
      { menuName: '协作空间', routeUrl: '/cooperation', icon: 'el-icon-connection', menuType: 1 },
      { menuName: '个人中心', routeUrl: '/profile', icon: 'el-icon-user', menuType: 1 }
    ] as MenuItem[]
  }),
  actions: {
    setActiveMenu(url: string) {
      // 这里只做简单赋值，实际可根据业务调整
      // 你可以根据需要扩展
    },
    addActiveMenu(param: MenuItem) {
      if (!this.activeMenuArrary.find((item) => item.routeUrl === param.routeUrl)) {
        this.activeMenuArrary.push(param)
      }
    },
    setDisplayMenus(menus: MenuItem[]) {
      this.displayMenus = menus
    }
  }
}) 