import http from './http'

export const getParkingLot = (id) => http.get(`/parking-lots/${id}`)

export const updateParkingLot = (id, data) => http.put(`/parking-lots/${id}`, data)
