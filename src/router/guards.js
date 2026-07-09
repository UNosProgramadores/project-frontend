import { useAuthStore } from '@/stores/auth'

const defaultRoutes = {
  admin: '/admin/config',
  staff: '/staff/entry-exit',
  customer: '/customer/vehicles'
}

export default function registerGuards(router) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return next({ name: 'login' })
    }

    if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
      return next({ name: 'unauthorized' })
    }

    if (auth.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
      const fallback = defaultRoutes[auth.role] || '/'
      return next(fallback)
    }

    next()
  })
}
