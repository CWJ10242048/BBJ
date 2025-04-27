import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/teaching-design'
    },
    {
      path: '/teaching-design',
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
      path: '/resource-gen',
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
      path: '/analysis',
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
      path: '/resource-lib',
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
      path: '/personalized',
      component: () => import('../views/Personalized.vue')
    },
    {
      path: '/oj',
      component: () => import('../views/OJ.vue')
    },
    {
      path: '/history',
      component: () => import('../views/History.vue')
    },
    {
      path: '/cooperation',
      component: () => import('../views/Cooperation.vue')
    },
    {
      path: '/profile',
      component: () => import('../views/Profile.vue')
    }
  ]
})

export default router
