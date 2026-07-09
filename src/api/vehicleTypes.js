import http from './http'

export function getVehicleTypes() {
  return http.get('/vehicle-types')
}
