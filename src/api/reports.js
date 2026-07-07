import http from './http'

export const getReport = (parkingLotId, params = {}) =>
  http.get(`/parking-lots/${parkingLotId}/reports`, { params })
