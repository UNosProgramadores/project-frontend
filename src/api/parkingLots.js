import http from './http'

export function getAllParkingLots() {
  return http.get('/parking-lots')
}

// ponytail: implement when the map view is built
export function getParkingLotMap(id) {
  return http.get(`/parking-lots/${id}/map`)
}
