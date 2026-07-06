import LoginView from '@/views/public/LoginView.vue'
import RegisterView from '@/views/public/RegisterView.vue'
import ParkingMapView from '@/views/public/ParkingMapView.vue'

export default [
  { path: '/', name: 'map', component: ParkingMapView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView }
]
