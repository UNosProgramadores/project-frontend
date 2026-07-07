<template>
  <div class="entry-exit-view">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="activeTab === 'inside'" class="tab-content">
      <div v-if="loading.entries" class="status-msg">Cargando...</div>
      <div v-else-if="error.entries" class="error-msg">{{ error.entries }}</div>
      <div v-else-if="activeEntries.length === 0" class="status-msg">No hay vehículos dentro</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Identificación</th>
            <th>Celda</th>
            <th>Ingreso</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in activeEntries" :key="entry.entryRecordId">
            <td>{{ vehicleTypeLabel(entry.vehicleType) }}</td>
            <td>{{ entry.plate || entry.bikeRegistration }}</td>
            <td>{{ entry.cellCode }}</td>
            <td>{{ formatDateTime(entry.entryTime) }}</td>
            <td>
              <button class="btn action-btn" @click="goToExit(entry)">Registrar salida</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'entry'" class="tab-content">
      <div v-if="loading.entryTypes" class="status-msg">Cargando tipos de vehículo...</div>
      <form v-else @submit.prevent="handleEntry" class="entry-form">
        <div class="form-group">
          <label>Tipo de vehículo</label>
          <select v-model="entryForm.vehicleTypeId" required>
            <option value="" disabled>Seleccione tipo</option>
            <option v-for="vt in vehicleTypes" :key="vt.id" :value="vt.id">
              {{ vehicleTypeLabel(vt.name) }}
            </option>
          </select>
        </div>

        <div v-if="selectedTypeRequiresPlate !== null" class="form-group">
          <label>{{ selectedTypeRequiresPlate ? 'Placa' : 'Registro de bicicleta' }}</label>
          <input
            v-model="entryForm[selectedTypeRequiresPlate ? 'plate' : 'bikeRegistration']"
            :placeholder="selectedTypeRequiresPlate ? 'ABC-123' : 'Bike-001'"
            required
          />
        </div>

        <div v-if="error.entrySubmit" class="error-msg">{{ error.entrySubmit }}</div>
        <div v-if="entryFieldErrors.length" class="field-errors">
          <p v-for="fe in entryFieldErrors" :key="fe.field" class="field-error">{{ fe.message }}</p>
        </div>

        <button type="submit" class="btn submit-btn" :disabled="loading.entrySubmit">
          {{ loading.entrySubmit ? 'Registrando...' : 'Registrar ingreso' }}
        </button>
      </form>

      <div v-if="entrySuccess" class="success-msg">
        Ingreso registrado con éxito.
        <span v-if="entrySuccessCell">Celda asignada: {{ entrySuccessCell }}</span>
      </div>
    </div>

    <div v-if="activeTab === 'exit'" class="tab-content">
      <form @submit.prevent="handleExit" class="exit-form">
        <div class="form-group">
          <label>Placa / Registro bicicleta</label>
          <input v-model="exitForm.identifier" placeholder="ABC-123 o Bike-001" required />
        </div>

        <div class="form-group">
          <label>Método de pago</label>
          <select v-model="exitForm.paymentMethod" required>
            <option value="" disabled>Seleccione método</option>
            <option v-for="pm in paymentMethods" :key="pm.value" :value="pm.value">
              {{ pm.label }}
            </option>
          </select>
        </div>

        <div v-if="error.exitSubmit" class="error-msg">{{ error.exitSubmit }}</div>
        <div v-if="exitFieldErrors.length" class="field-errors">
          <p v-for="fe in exitFieldErrors" :key="fe.field" class="field-error">{{ fe.message }}</p>
        </div>

        <button type="submit" class="btn submit-btn" :disabled="loading.exitSubmit">
          {{ loading.exitSubmit ? 'Registrando...' : 'Registrar salida' }}
        </button>
      </form>

      <div v-if="exitResult" class="exit-summary">
        <h3>Resumen de cobro</h3>
        <div class="summary-grid">
          <div><strong>Tipo:</strong> {{ vehicleTypeLabel(exitResult.vehicleType) }}</div>
          <div><strong>Placa:</strong> {{ exitResult.plate || exitResult.bikeRegistration }}</div>
          <div><strong>Celda:</strong> {{ exitResult.cellCode }}</div>
          <div><strong>Ingreso:</strong> {{ formatDateTime(exitResult.entryTime) }}</div>
          <div><strong>Salida:</strong> {{ formatDateTime(exitResult.exitTime) }}</div>
          <div><strong>Duración:</strong> {{ exitResult.duration }} min</div>
          <div><strong>Subtotal:</strong> ${{ exitResult.subtotal }}</div>
          <div><strong>Descuento %:</strong> {{ exitResult.discountPercentage }}%</div>
          <div><strong>Descuento $:</strong> ${{ exitResult.discountAmount }}</div>
          <div><strong>Total pagado:</strong> ${{ exitResult.totalPaid }}</div>
          <div><strong>Método de pago:</strong> {{ paymentMethodLabel(exitResult.paymentMethod) }}</div>
          <div><strong>Factura #:</strong> {{ exitResult.invoiceId }}</div>
        </div>
        <button class="btn invoice-btn" @click="router.push(`/staff/invoices?id=${exitResult.invoiceId}`)">
          Ver factura
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getVehicleTypes } from '@/api/vehicleTypes'
import { getActiveEntries, registerEntry, registerExit } from '@/api/entryRecords'

const authStore = useAuthStore()
const router = useRouter()
const parkingLotId = computed(() => authStore.user?.parkingLotId)

const tabs = [
  { key: 'inside', label: 'Vehículos dentro' },
  { key: 'entry', label: 'Registrar ingreso' },
  { key: 'exit', label: 'Registrar salida' }
]

const activeTab = ref('inside')
const activeEntries = ref([])
const vehicleTypes = ref([])
const entrySuccess = ref(false)
const entrySuccessCell = ref(null)
const exitResult = ref(null)

const loading = reactive({ entries: false, entryTypes: false, entrySubmit: false, exitSubmit: false })
const error = reactive({ entries: null, entrySubmit: null, exitSubmit: null })
const entryFieldErrors = ref([])
const exitFieldErrors = ref([])

const entryForm = reactive({ vehicleTypeId: '', plate: '', bikeRegistration: '' })
const exitForm = reactive({ identifier: '', paymentMethod: '' })

const paymentMethods = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'TRANSFER', label: 'Transferencia' }
]

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
}

function paymentMethodLabel(value) {
  const pm = paymentMethods.find(p => p.value === value)
  return pm ? pm.label : value
}

function formatDateTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString()
}

const selectedTypeRequiresPlate = computed(() => {
  if (!entryForm.vehicleTypeId) return null
  const vt = vehicleTypes.value.find(t => t.id === entryForm.vehicleTypeId)
  return vt ? vt.requiresPlate : null
})

watch(activeTab, (tab) => {
  if (tab === 'inside') fetchActiveEntries()
  if (tab === 'entry') { entrySuccess.value = false; entrySuccessCell.value = null }
})

watch(entryForm.vehicleTypeId, () => {
  entryForm.plate = ''
  entryForm.bikeRegistration = ''
})

async function fetchActiveEntries() {
  if (!parkingLotId.value) return
  loading.entries = true
  error.entries = null
  try {
    const res = await getActiveEntries(parkingLotId.value)
    activeEntries.value = res.data
  } catch (e) {
    error.entries = e.message || 'Error al cargar entradas activas'
  } finally {
    loading.entries = false
  }
}

async function fetchVehicleTypes() {
  loading.entryTypes = true
  try {
    const res = await getVehicleTypes()
    vehicleTypes.value = res.data
  } catch (e) {
    console.error('Error al cargar tipos de vehículo', e)
  } finally {
    loading.entryTypes = false
  }
}

function goToExit(entry) {
  exitResult.value = null
  error.exitSubmit = null
  exitFieldErrors.value = []
  exitForm.identifier = entry.plate || entry.bikeRegistration
  exitForm.paymentMethod = ''
  activeTab.value = 'exit'
}

async function handleEntry() {
  if (!parkingLotId.value) return
  entryFieldErrors.value = []
  entrySuccess.value = false
  entrySuccessCell.value = null
  error.entrySubmit = null
  loading.entrySubmit = true

  const payload = { parkingLotId: parkingLotId.value, vehicleTypeId: entryForm.vehicleTypeId }
  if (selectedTypeRequiresPlate.value) {
    payload.plate = entryForm.plate
  } else {
    payload.bikeRegistration = entryForm.bikeRegistration
  }

  try {
    const res = await registerEntry(parkingLotId.value, payload)
    entrySuccess.value = true
    entrySuccessCell.value = res.data?.cell?.code || null
    entryForm.vehicleTypeId = ''
    entryForm.plate = ''
    entryForm.bikeRegistration = ''
    fetchActiveEntries()
  } catch (e) {
    if (e.fieldErrors && e.fieldErrors.length) {
      entryFieldErrors.value = e.fieldErrors
    } else {
      error.entrySubmit = e.message || 'Error al registrar ingreso'
    }
  } finally {
    loading.entrySubmit = false
  }
}

async function handleExit() {
  if (!parkingLotId.value) return
  exitFieldErrors.value = []
  exitResult.value = null
  error.exitSubmit = null
  loading.exitSubmit = true

  const payload = { parkingLotId: parkingLotId.value, paymentMethod: exitForm.paymentMethod }
  const val = exitForm.identifier.trim()
  const isBikePattern = /^bike/i.test(val)
  if (isBikePattern) {
    payload.bikeRegistration = val
  } else {
    payload.plate = val
  }

  try {
    const res = await registerExit(parkingLotId.value, payload)
    exitResult.value = res.data
    exitForm.identifier = ''
    exitForm.paymentMethod = ''
    fetchActiveEntries()
  } catch (e) {
    if (e.fieldErrors && e.fieldErrors.length) {
      exitFieldErrors.value = e.fieldErrors
    } else {
      error.exitSubmit = e.message || 'Error al registrar salida'
    }
  } finally {
    loading.exitSubmit = false
  }
}

onMounted(() => {
  fetchActiveEntries()
  fetchVehicleTypes()
})
</script>

<style scoped>
.entry-exit-view {
  padding: 1rem;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.tab-btn.active {
  background: #42b883;
  color: #fff;
  border-color: #42b883;
}
.tab-content {
  min-height: 200px;
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
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.form-group select, .form-group input {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit-btn {
  padding: 0.5rem 1.5rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.action-btn {
  padding: 0.25rem 0.75rem;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.status-msg {
  color: #666;
  font-style: italic;
}
.error-msg {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}
.field-errors {
  margin-bottom: 0.5rem;
}
.field-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}
.success-msg {
  color: #27ae60;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #eafaf1;
  border-radius: 4px;
}
.exit-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.entry-form, .exit-form {
  max-width: 500px;
}
.invoice-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
