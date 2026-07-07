import http from './http'

export const getDiscounts = (parkingLotId) => http.get(`/parking-lots/${parkingLotId}/discounts`)

export const createDiscount = (parkingLotId, data) =>
  http.post(`/parking-lots/${parkingLotId}/discounts`, data)

export const updateDiscount = (parkingLotId, discountId, data) =>
  http.put(`/parking-lots/${parkingLotId}/discounts/${discountId}`, data)

export const deleteDiscount = (parkingLotId, discountId) =>
  http.delete(`/parking-lots/${parkingLotId}/discounts/${discountId}`)
