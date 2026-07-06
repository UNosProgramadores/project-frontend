import http from './http'

export function getAllParkingLots() {
  return http.get('/parking-lots')
}

export function getParkingLotMap(id) {
  return http.get(`/parking-lots/${id}/map`)
}
