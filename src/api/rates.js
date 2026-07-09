import http from './http'

export const getRates = (parkingLotId) => http.get(`/parking-lots/${parkingLotId}/rates`)

export const createRate = (parkingLotId, data) => http.post(`/parking-lots/${parkingLotId}/rates`, data)

export const updateRate = (parkingLotId, rateId, data) =>
  http.put(`/parking-lots/${parkingLotId}/rates/${rateId}`, data)

export const deleteRate = (parkingLotId, rateId) =>
  http.delete(`/parking-lots/${parkingLotId}/rates/${rateId}`)
