import http from './http'

export function claimVehicle(payload) {
  return http.post('/vehicles/claim', payload)
}

export function getMyVehicles() {
  return http.get('/customers/me/vehicles')
}
