<template>
  <div class="invoices-view">
    <div v-if="invoiceDetail" class="detail-section">
      <button class="btn back-btn" @click="goBackToList">← Volver a facturas</button>
      <h2>Factura #{{ invoiceDetail.id }}</h2>
      <div v-if="loading.detail" class="status-msg">Cargando...</div>
      <div v-else-if="error.detail" class="error-msg">{{ error.detail }}</div>
      <div v-else class="detail-grid">
        <div class="detail-card">
          <div><strong>Placa/Serial:</strong> {{ invoiceDetail.plate || invoiceDetail.bikeRegistration }}</div>
          <div><strong>Tipo vehículo:</strong> {{ vehicleTypeLabel(invoiceDetail.vehicleType) }}</div>
          <div><strong>Celda:</strong> {{ invoiceDetail.cellCode }}</div>
          <div><strong>Ingreso:</strong> {{ formatDateTime(invoiceDetail.entryTime) }}</div>
          <div><strong>Salida:</strong> {{ formatDateTime(invoiceDetail.exitTime) }}</div>
          <div><strong>Duración:</strong> {{ invoiceDetail.duration }} min</div>
          <div><strong>Tarifa:</strong> {{ rateTypeLabel(invoiceDetail.rateType) }} (${{ invoiceDetail.rateValue }}) — {{ vehicleTypeLabel(invoiceDetail.vehicleType) }}</div>
          <div><strong>Subtotal:</strong> ${{ invoiceDetail.subtotal }}</div>
          <div><strong>Descuento:</strong> ${{ invoiceDetail.discountAmount }}</div>
          <div><strong>Total pagado:</strong> ${{ invoiceDetail.totalPaid }}</div>
          <div><strong>Método de pago:</strong> {{ paymentMethodLabel(invoiceDetail.paymentMethod) }}</div>
        </div>
      </div>
    </div>

    <div v-else class="list-section">
      <h2>Facturas</h2>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Fecha inicio</label>
          <input v-model="filters.startDate" type="date" class="filter-input" />
        </div>
        <div class="filter-group">
          <label>Fecha fin</label>
          <input v-model="filters.endDate" type="date" class="filter-input" />
        </div>
        <div class="filter-group">
          <label>Método de pago</label>
          <select v-model="filters.paymentMethod" class="filter-input">
            <option value="">Todos</option>
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Total desde</label>
          <input v-model="filters.minTotal" type="number" min="0" step="0.01" class="filter-input" />
        </div>
        <div class="filter-group">
          <label>Total hasta</label>
          <input v-model="filters.maxTotal" type="number" min="0" step="0.01" class="filter-input" />
        </div>
        <div class="filter-actions">
          <button class="btn filter-btn" @click="applyFilters">Aplicar</button>
          <button class="btn clear-btn" @click="clearFilters">Limpiar</button>
        </div>
      </div>

      <div v-if="loading.list" class="status-msg">Cargando...</div>
      <div v-else-if="error.list" class="error-msg">{{ error.list }}</div>
      <div v-else-if="invoices.length === 0" class="status-msg">No hay facturas registradas</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th># Factura</th>
            <th>Placa/Serial</th>
            <th>Tipo</th>
            <th>Ingreso</th>
            <th>Salida</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td>{{ inv.id }}</td>
            <td>{{ inv.plate || inv.bikeRegistration }}</td>
            <td>{{ vehicleTypeLabel(inv.vehicleType) }}</td>
            <td>{{ formatDateTime(inv.entryTime) }}</td>
            <td>{{ formatDateTime(inv.exitTime) }}</td>
            <td>${{ inv.totalPaid }}</td>
            <td>
              <button class="btn view-btn" @click="viewInvoice(inv.id)">Ver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getInvoices, getInvoiceById } from '@/api/invoices'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const invoices = ref([])
const invoiceDetail = ref(null)
const loading = reactive({ list: false, detail: false })
const error = reactive({ list: null, detail: null })

const filters = reactive({ startDate: '', endDate: '', paymentMethod: '', minTotal: '', maxTotal: '' })
const appliedFilters = reactive({ startDate: '', endDate: '', paymentMethod: '', minTotal: '', maxTotal: '' })

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
}

function paymentMethodLabel(value) {
  const map = { CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia' }
  return map[value] || value
}

function rateTypeLabel(value) {
  const map = { per_minute: 'Por minuto', flat: 'Tarifa plana' }
  return map[value] || value
}

function formatDateTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

function buildFilterParams() {
  const params = {}
  if (appliedFilters.startDate) params.startDate = appliedFilters.startDate
  if (appliedFilters.endDate) params.endDate = appliedFilters.endDate
  if (appliedFilters.paymentMethod) params.paymentMethod = appliedFilters.paymentMethod
  if (appliedFilters.minTotal !== '' && appliedFilters.minTotal !== null) params.minTotal = appliedFilters.minTotal
  if (appliedFilters.maxTotal !== '' && appliedFilters.maxTotal !== null) params.maxTotal = appliedFilters.maxTotal
  return params
}

function applyFilters() {
  appliedFilters.startDate = filters.startDate
  appliedFilters.endDate = filters.endDate
  appliedFilters.paymentMethod = filters.paymentMethod
  appliedFilters.minTotal = filters.minTotal
  appliedFilters.maxTotal = filters.maxTotal
  fetchInvoices()
}

function clearFilters() {
  filters.startDate = ''
  filters.endDate = ''
  filters.paymentMethod = ''
  filters.minTotal = ''
  filters.maxTotal = ''
  appliedFilters.startDate = ''
  appliedFilters.endDate = ''
  appliedFilters.paymentMethod = ''
  appliedFilters.minTotal = ''
  appliedFilters.maxTotal = ''
  fetchInvoices()
}

async function fetchInvoices() {
  if (!parkingLotId) return
  loading.list = true
  error.list = null
  try {
    const res = await getInvoices(parkingLotId, buildFilterParams())
    invoices.value = res.data
  } catch (e) {
    error.list = e.message || 'Error al cargar facturas'
  } finally {
    loading.list = false
  }
}

async function fetchInvoiceDetail(id) {
  loading.detail = true
  error.detail = null
  try {
    const res = await getInvoiceById(id)
    invoiceDetail.value = res.data
  } catch (e) {
    error.detail = e.message || 'Error al cargar la factura'
  } finally {
    loading.detail = false
  }
}

function viewInvoice(id) {
  router.push(`/staff/invoices?id=${id}`)
}

function goBackToList() {
  invoiceDetail.value = null
  router.push('/staff/invoices')
}

watch(() => route.query.id, (id) => {
  if (id) {
    invoiceDetail.value = null
    fetchInvoiceDetail(id)
  } else {
    invoiceDetail.value = null
    fetchInvoices()
  }
})

onMounted(() => {
  const invoiceId = route.query.id
  if (invoiceId) {
    fetchInvoiceDetail(invoiceId)
  } else {
    fetchInvoices()
  }
})
</script>

<style scoped>
.invoices-view {
  padding: 1rem;
}
h2 {
  margin-bottom: 1rem;
}
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}
.filter-input {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  background: var(--color-bg);
  min-width: 130px;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
}
.filter-btn {
  padding: 0.45rem 1rem;
  background: var(--color-primary-700);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}
.filter-btn:hover {
  background: var(--color-primary-600);
}
.clear-btn {
  padding: 0.45rem 1rem;
  background: #95a5a6;
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
}
.clear-btn:hover {
  background: #7f8c8d;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
.data-table th {
  background: #f0f0f0;
}
.status-msg {
  color: #666;
  font-style: italic;
}
.error-msg {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}
.detail-card {
  max-width: 500px;
  padding: 1rem;
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.detail-card div {
  margin-bottom: 0.5rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.back-btn {
  background: #95a5a6;
  color: #fff;
  margin-bottom: 1rem;
}
.view-btn {
  background: #3498db;
  color: #fff;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
}
</style>
