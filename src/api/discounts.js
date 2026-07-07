import http from './http'

export const getDiscounts = (parkingLotId) => http.get(`/parking-lots/${parkingLotId}/discounts/config`)

export const createDiscount = (parkingLotId, data) =>
  http.post(`/parking-lots/${parkingLotId}/discounts/config`, data)

export const updateDiscount = (parkingLotId, discountId, data) =>
  http.put(`/parking-lots/${parkingLotId}/discounts/config/${discountId}`, data)

export const deleteDiscount = (parkingLotId, discountId) =>
  http.delete(`/parking-lots/${parkingLotId}/discounts/config/${discountId}`)

export const toggleDiscountsEnabled = (parkingLotId) =>
  http.patch(`/parking-lots/${parkingLotId}/discounts/toggle`)
