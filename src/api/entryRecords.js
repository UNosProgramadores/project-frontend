import http from './http'

export function getActiveEntries(parkingLotId) {
  return http.get(`/parking-lots/${parkingLotId}/active-entries`)
}

export function registerEntry(parkingLotId, payload) {
  return http.post(`/parking-lots/${parkingLotId}/entry`, payload)
}

export function registerExit(parkingLotId, payload) {
  return http.post(`/parking-lots/${parkingLotId}/exit`, payload)
}
