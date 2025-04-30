import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/others/login.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/',
      component: () => import('@/components/layout/MainLayout.vue'),
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/Home.vue'),
          meta: {
            title: '首页',
            requiresAuth: false
          }
        },
        {
          path: 'index',
          name: 'Index',
          component: () => import('@/views/index.vue'),
          meta: {
            requiresAuth: true
          }
        },
        {
          path: 'teaching-design',
          component: () => import('../views/TeachingDesign/index.vue'),
          children: [
            {
              path: '',
              redirect: 'syllabus'
            },
            {
              path: 'syllabus',
              component: () => import('../views/TeachingDesign/Syllabus.vue')
            },
            {
              path: 'plan',
              component: () => import('../views/TeachingDesign/Plan.vue')
            },
            {
              path: 'interaction',
              component: () => import('../views/TeachingDesign/Interaction.vue')
            }
          ]
        },
        {
          path: 'resource-gen',
          component: () => import('../views/ResourceGen/index.vue'),
          children: [
            {
              path: '',
              redirect: 'ppt'
            },
            {
              path: 'ppt',
              component: () => import('../views/ResourceGen/PPT.vue')
            },
            {
              path: 'graphic',
              component: () => import('../views/ResourceGen/Graphic.vue')
            },
            {
              path: 'question',
              component: () => import('../views/ResourceGen/Question.vue')
            }
          ]
        },
        {
          path: 'analysis',
          component: () => import('../views/Analysis/index.vue'),
          children: [
            {
              path: '',
              redirect: 'student-board'
            },
            {
              path: 'student-board',
              component: () => import('../views/Analysis/StudentBoard.vue')
            },
            {
              path: 'cognition',
              component: () => import('../views/Analysis/Cognition.vue')
            },
            {
              path: 'knowledge-track',
              component: () => import('../views/Analysis/KnowledgeTrack.vue')
            }
          ]
        },
        {
          path: 'resource-lib',
          component: () => import('../views/ResourceLib/index.vue'),
          children: [
            {
              path: '',
              redirect: 'graph'
            },
            {
              path: 'graph',
              component: () => import('../views/ResourceLib/Graph.vue')
            },
            {
              path: 'community',
              component: () => import('../views/ResourceLib/Community.vue')
            },
            {
              path: 'concept',
              component: () => import('../views/ResourceLib/Concept.vue')
            }
          ]
        },
        {
          path: 'personalized',
          component: () => import('../views/Personalized.vue')
        },
        {
          path: 'oj',
          component: () => import('../views/OJ/index.vue'),
          children: [
            {
              path: '',
              redirect: '/oj/problem-list'
            },
            {
              path: 'problem-list',
              component: () => import('../views/OJ/ProblemList.vue')
            },
            {
              path: 'problem/:id',
              component: () => import('../views/OJ/ProblemDetail.vue')
            },
            {
              path: 'submissions',
              component: () => import('../views/OJ/Submissions.vue')
            },
            {
              path: 'leaderboard',
              component: () => import('../views/OJ/Leaderboard.vue')
            }
          ]
        },
        {
          path: 'history',
          component: () => import('../views/History.vue')
        },
        {
          path: 'cooperation',
          component: () => import('../views/Cooperation.vue')
        },
        {
          path: 'profile',
          component: () => import('../views/Profile.vue')
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.path)  // 打印目标路由路径
  const userStore = useUserStore()
  const token = userStore.token

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 备倍佳AI备课系统` : '备倍佳AI备课系统'

  // 如果需要认证且没有token，重定向到登录页
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
