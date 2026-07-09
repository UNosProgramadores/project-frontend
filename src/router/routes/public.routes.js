import LoginView from '@/views/public/LoginView.vue'
import RegisterView from '@/views/public/RegisterView.vue'
import ParkingLotListView from '@/views/public/ParkingLotListView.vue'

export default [
  { path: '/', name: 'home', component: ParkingLotListView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  {
    path: '/map/:parkingLotId',
    name: 'parking-map',
    component: () => import('@/views/public/ParkingMapView.vue')
  }
]
