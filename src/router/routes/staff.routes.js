export default [
  {
    path: '/staff/entry-exit',
    name: 'staff-entry-exit',
    component: () => import('@/views/staff/EntryExitView.vue'),
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  },
  {
    path: '/staff/invoices',
    name: 'staff-invoices',
    component: () => import('@/views/staff/InvoicesView.vue'),
    meta: { requiresAuth: true, roles: ['staff', 'admin'] }
  }
]
