export default [
  {
    path: '/admin/config',
    name: 'admin-config',
    component: () => import('@/views/admin/ConfigView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/rates',
    name: 'admin-rates',
    component: () => import('@/views/admin/RatesView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/discounts',
    name: 'admin-discounts',
    component: () => import('@/views/admin/DiscountsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/staff',
    name: 'admin-staff',
    component: () => import('@/views/admin/StaffManageView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/reports',
    name: 'admin-reports',
    component: () => import('@/views/admin/ReportsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  }
]
