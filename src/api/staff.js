import http from './http'

export const getStaff = (parkingLotId) => http.get('/staff', { params: { parkingLotId } })

export const registerStaff = (payload) => http.post('/staff', payload)

export const unlockStaff = (userId) => http.post(`/staff/${userId}/unlock`)
