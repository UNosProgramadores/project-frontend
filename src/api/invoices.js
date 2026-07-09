import http from './http'

export const getInvoices = (parkingLotId, params = {}) =>
  http.get(`/parking-lots/${parkingLotId}/invoices`, { params })

export const getInvoiceById = (id) =>
  http.get(`/invoices/${id}`)
