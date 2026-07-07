import http from './http'

export const getReportSummary = (parkingLotId, params = {}) =>
  http.get(`/parking-lots/${parkingLotId}/reports/summary`, { params })

export const getDailyReport = (parkingLotId, params = {}) =>
  http.get(`/parking-lots/${parkingLotId}/reports/daily`, { params })
