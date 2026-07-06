import { createRouter, createWebHistory } from 'vue-router'

import publicRoutes from './routes/public.routes'
import adminRoutes from './routes/admin.routes'
import staffRoutes from './routes/staff.routes'
import customerRoutes from './routes/customer.routes'

import registerGuards from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...publicRoutes,
    ...adminRoutes,
    ...staffRoutes,
    ...customerRoutes,
    { path: '/unauthorized', name: 'unauthorized', component: () => import('@/views/UnauthorizedView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') }
  ]
})

registerGuards(router)

export default router
