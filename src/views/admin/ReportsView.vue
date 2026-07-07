<template>
  <div class="reports-view">
    <h2>Reportes</h2>

    <div class="filters">
      <div class="form-group">
        <label>Período</label>
        <select v-model="filters.period">
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </select>
      </div>
      <div class="form-group">
        <label>Fecha de referencia</label>
        <input v-model="filters.date" type="date" />
      </div>
      <button class="btn filter-btn" @click="fetchReport">Consultar</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="report" class="report-content">
      <div class="period-info">
        Reporte de {{ periodLabel }} — {{ report.referenceDate }}
        <span v-if="report.startDate && report.endDate">
          ({{ report.startDate }} al {{ report.endDate }})
        </span>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <span class="card-value">${{ Number(report.totalRevenue).toFixed(2) }}</span>
          <span class="card-label">Ingresos totales</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ report.totalEntries }}</span>
          <span class="card-label">Ingresos de vehículos</span>
        </div>
        <div class="summary-card">
          <span class="card-value">{{ report.totalExits }}</span>
          <span class="card-label">Salidas de vehículos</span>
        </div>
      </div>

      <div class="breakdown-section">
        <div class="breakdown">
          <h3>Ingresos por tipo de vehículo</h3>
          <table v-if="report.entriesByVehicleType?.length" class="data-table">
            <thead>
              <tr><th>Tipo</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in report.entriesByVehicleType" :key="item.vehicleType">
                <td>{{ vehicleTypeLabel(item.vehicleType) }}</td>
                <td>{{ item.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="status-msg">Sin datos</div>
        </div>
        <div class="breakdown">
          <h3>Salidas por tipo de vehículo</h3>
          <table v-if="report.exitsByVehicleType?.length" class="data-table">
            <thead>
              <tr><th>Tipo</th><th>Cantidad</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in report.exitsByVehicleType" :key="item.vehicleType">
                <td>{{ vehicleTypeLabel(item.vehicleType) }}</td>
                <td>{{ item.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="status-msg">Sin datos</div>
        </div>
      </div>
    </div>
    <div v-else class="status-msg">Seleccione un período y presione Consultar</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getReport } from '@/api/reports'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const report = ref(null)
const loading = ref(false)
const error = ref(null)

const filters = reactive({
  period: 'day',
  date: new Date().toISOString().slice(0, 10)
})

const periodLabel = computed(() => {
  const map = { day: 'día', week: 'semana', month: 'mes' }
  return map[filters.period] || filters.period
})

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
}

async function fetchReport() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const params = { period: filters.period }
    if (filters.date) params.date = filters.date
    const res = await getReport(parkingLotId, params)
    report.value = res.data
  } catch (e) {
    error.value = e.message || 'Error al cargar reportes'
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)
</script>

<style scoped>
.reports-view { padding: 1rem; }
h2 { margin-bottom: 1rem; }
.filters { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; }
.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.85rem; }
.form-group input, .form-group select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
.filter-btn { padding: 0.5rem 1.5rem; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.period-info { margin-bottom: 1rem; font-style: italic; color: #555; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.summary-card { background: #f8f8f8; border: 1px solid #ddd; border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; align-items: center; text-align: center; }
.card-value { font-size: 1.5rem; font-weight: 700; color: #2c3e50; }
.card-label { font-size: 0.85rem; color: #666; margin-top: 0.25rem; }
.breakdown-section { display: flex; gap: 2rem; flex-wrap: wrap; }
.breakdown { flex: 1; min-width: 250px; }
.breakdown h3 { margin-bottom: 0.5rem; font-size: 1rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.4rem 0.5rem; text-align: left; }
.data-table th { background: #f0f0f0; }
.status-msg { color: #666; font-style: italic; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
</style>
