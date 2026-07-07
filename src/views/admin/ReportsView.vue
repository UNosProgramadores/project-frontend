<template>
  <div class="reports-view">
    <h2>Reportes</h2>

    <div class="filters">
      <div class="form-group">
        <label>Desde</label>
        <input v-model="filters.startDate" type="date" />
      </div>
      <div class="form-group">
        <label>Hasta</label>
        <input v-model="filters.endDate" type="date" />
      </div>
      <button class="btn filter-btn" @click="fetchSummary">Consultar</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="summary" class="summary-grid">
      <div class="summary-card">
        <span class="card-value">{{ summary.totalEntries ?? 0 }}</span>
        <span class="card-label">Ingresos</span>
      </div>
      <div class="summary-card">
        <span class="card-value">{{ summary.totalExits ?? 0 }}</span>
        <span class="card-label">Salidas</span>
      </div>
      <div class="summary-card">
        <span class="card-value">${{ summary.totalRevenue ?? 0 }}</span>
        <span class="card-label">Ingresos totales</span>
      </div>
      <div class="summary-card">
        <span class="card-value">{{ summary.activeVehicles ?? 0 }}</span>
        <span class="card-label">Vehículos dentro</span>
      </div>
      <div class="summary-card">
        <span class="card-value">{{ summary.occupancyPercentage ?? 0 }}%</span>
        <span class="card-label">Ocupación</span>
      </div>
      <div class="summary-card">
        <span class="card-value">{{ summary.avgDuration ?? 0 }} min</span>
        <span class="card-label">Duración promedio</span>
      </div>
    </div>
    <div v-else class="status-msg">Seleccione un rango de fechas y presione Consultar</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getReportSummary } from '@/api/reports'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const summary = ref(null)
const loading = ref(false)
const error = ref(null)

const filters = reactive({
  startDate: '',
  endDate: ''
})

async function fetchSummary() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const params = {}
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    const res = await getReportSummary(parkingLotId, params)
    summary.value = res.data
  } catch (e) {
    error.value = e.message || 'Error al cargar reportes'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSummary)
</script>

<style scoped>
.reports-view {
  padding: 1rem;
}
h2 {
  margin-bottom: 1rem;
}
.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 0.85rem;
}
.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.filter-btn {
  padding: 0.5rem 1.5rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.summary-card {
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.card-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}
.card-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}
.status-msg {
  color: #666;
  font-style: italic;
}
.error-msg {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}
</style>
