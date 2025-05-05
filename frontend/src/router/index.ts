import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: () => import('@/views/others/login.vue')
    },
    // 教师系统路由
    {
      path: '/teacher',
      component: () => import('@/layouts/TeacherLayout.vue'),
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/TeacherDashboard.vue')
        },
        // ... 其他教师系统路由
      ]
    },
    // 管理员系统路由
    {
      path: '/admin',
      component: () => import('@/views/sys/learn_front_mange-master/src/views/layout/index.vue'),
      children: [
        {
          path: '',
          redirect: '/admin/function'
        },
        {
          path: 'function',
          component: () => import('@/views/sys/learn_front_mange-master/src/views/system/function/index.vue')
        },
        {
          path: 'user',
          component: () => import('@/views/sys/learn_front_mange-master/src/views/system/user/index.vue')
        },
        {
          path: 'notice',
          component: () => import('@/views/sys/learn_front_mange-master/src/views/system/notice/index.vue')
        },
        {
          path: 'resource',
          component: () => import('@/views/sys/learn_front_mange-master/src/views/system/resource/index.vue')
        },
        {
          path: 'profile',
          component: () => import('@/views/sys/learn_front_mange-master/src/views/system/profile/index.vue')
        }
      ]
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
              component: () => import('@/views/TeachingDesign/Interaction.vue')
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
  const userStore = useUserStore()
  const isAuthenticated = userStore.token
  const userRole = userStore.user?.role

  if (to.path === '/login') {
    next()
    return
  }

  if (!isAuthenticated) {
    next('/login')
    return
  }

  // 检查角色权限
  if (to.path.startsWith('/admin') && userRole !== 'admin') {
    next('/teacher/dashboard')
    return
  }

  if (to.path.startsWith('/teacher') && userRole !== 'teacher') {
    next('/admin/dashboard')
    return
  }

  next()
})

export default router
