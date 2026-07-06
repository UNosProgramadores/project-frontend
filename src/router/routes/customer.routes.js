export default [
  {
    path: '/customer/vehicles',
    name: 'customer-vehicles',
    component: () => import('@/views/customer/VehiclesView.vue'),
    meta: { requiresAuth: true, roles: ['customer'] }
  }
]
