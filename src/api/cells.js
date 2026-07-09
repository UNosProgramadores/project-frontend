import http from './http'

export const updateCellType = (parkingLotId, cellId, cellType) =>
  http.patch(`/parking-lots/${parkingLotId}/cells/${cellId}/type`, { cellType })

export const updateCellVehicleType = (parkingLotId, cellId, vehicleTypeId) =>
  http.patch(`/parking-lots/${parkingLotId}/cells/${cellId}/vehicle-type`, { vehicleTypeId })
