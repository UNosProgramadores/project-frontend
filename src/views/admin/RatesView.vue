<template>
  <div class="rates-view">
    <div class="header">
      <h2>Tarifas</h2>
      <button class="btn add-btn" @click="openCreate">Agregar tarifa</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else>
      <h3 class="section-title">Tarifas activas</h3>
      <table v-if="activeRates.length" class="data-table">
        <thead>
          <tr>
            <th>Tipo vehículo</th>
            <th>Tipo tarifa</th>
            <th>Costo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in activeRates" :key="rate.id">
            <td>{{ vehicleTypeLabel(rate.vehicleType?.name) }}</td>
            <td>{{ rateTypeLabel(rate.rateType) }}</td>
            <td>${{ Number(rate.cost).toFixed(2) }}</td>
            <td>
              <button class="btn edit-btn" @click="openEdit(rate)">Editar</button>
              <button class="btn delete-btn" @click="handleDelete(rate.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="status-msg">No hay tarifas activas</div>

      <h3 class="section-title" style="margin-top: 2rem;">Tarifas inactivas</h3>
      <table v-if="inactiveRates.length" class="data-table">
        <thead>
          <tr>
            <th>Tipo vehículo</th>
            <th>Tipo tarifa</th>
            <th>Costo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rate in inactiveRates" :key="rate.id">
            <td>{{ vehicleTypeLabel(rate.vehicleType?.name) }}</td>
            <td>{{ rateTypeLabel(rate.rateType) }}</td>
            <td>${{ Number(rate.cost).toFixed(2) }}</td>
            <td>
              <button class="btn delete-btn" @click="handleDelete(rate.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="status-msg">No hay tarifas inactivas</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h3>{{ editing ? 'Editar tarifa' : 'Nueva tarifa' }}</h3>
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Tipo vehículo</label>
            <select v-model="form.vehicleTypeId" required>
              <option value="" disabled>Seleccione tipo</option>
              <option v-for="vt in vehicleTypes" :key="vt.id" :value="vt.id">
                {{ vehicleTypeLabel(vt.name) }}
              </option>
            </select>
            <span v-if="fieldErrors.vehicleTypeId" class="field-error">{{ fieldErrors.vehicleTypeId }}</span>
          </div>
          <div class="form-group">
            <label>Tipo tarifa</label>
            <select v-model="form.rateType" required>
              <option value="" disabled>Seleccione tipo</option>
              <option value="per_minute">Por minuto</option>
              <option value="flat">Tarifa plena</option>
            </select>
            <span v-if="fieldErrors.rateType" class="field-error">{{ fieldErrors.rateType }}</span>
          </div>
          <div class="form-group">
            <label>Costo</label>
            <input v-model.number="form.cost" type="number" min="0" step="0.01" required />
            <span v-if="fieldErrors.cost" class="field-error">{{ fieldErrors.cost }}</span>
          </div>
          <div class="form-group">
            <label>
              <input v-model="form.active" type="checkbox" />
              Activa
            </label>
          </div>
          <div v-if="formError" class="error-msg">{{ formError }}</div>
          <div class="modal-actions">
            <button type="submit" class="btn submit-btn" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
            <button type="button" class="btn cancel-btn" @click="closeForm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getVehicleTypes } from '@/api/vehicleTypes'
import { getRates, createRate, updateRate, deleteRate } from '@/api/rates'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const rates = ref([])
const vehicleTypes = ref([])
const loading = ref(true)
const error = ref(null)
const showForm = ref(false)
const editing = ref(false)
const saving = ref(false)
const formError = ref(null)
const editId = ref(null)
const fieldErrors = ref({})

const form = reactive({ vehicleTypeId: '', rateType: '', cost: 0, active: true })

const activeRates = computed(() => rates.value.filter(r => r.active))
const inactiveRates = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)
  return rates.value.filter(r => {
    if (r.active) return false
    if (!r.endDate) return false
    return new Date(r.endDate) >= cutoff
  })
})

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
}

function rateTypeLabel(type) {
  return type === 'per_minute' ? 'Por minuto' : type === 'flat' ? 'Tarifa plena' : type
}

async function fetchRates() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const res = await getRates(parkingLotId)
    rates.value = res.data
  } catch (e) {
    error.value = e.message || 'Error al cargar tarifas'
  } finally {
    loading.value = false
  }
}

async function fetchVehicleTypes() {
  try {
    const res = await getVehicleTypes()
    vehicleTypes.value = res.data
  } catch {
    vehicleTypes.value = []
  }
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.vehicleTypeId = ''
  form.rateType = ''
  form.cost = 0
  form.active = true
  formError.value = null
  fieldErrors.value = {}
  showForm.value = true
}

function openEdit(rate) {
  editing.value = true
  editId.value = rate.id
  form.vehicleTypeId = rate.vehicleType?.id || ''
  form.rateType = rate.rateType || ''
  form.cost = rate.cost || 0
  form.active = rate.active !== false
  formError.value = null
  fieldErrors.value = {}
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSave() {
  formError.value = null
  fieldErrors.value = {}
  saving.value = true
  try {
    if (editing.value) {
      await updateRate(parkingLotId, editId.value, { ...form })
    } else {
      await createRate(parkingLotId, { ...form })
    }
    closeForm()
    await fetchRates()
  } catch (e) {
    formError.value = e.message || 'Error al guardar tarifa'
    if (e.fieldErrors?.length) {
      const map = {}
      e.fieldErrors.forEach(fe => { map[fe.field] = fe.message })
      fieldErrors.value = map
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar esta tarifa?')) return
  try {
    await deleteRate(parkingLotId, id)
    await fetchRates()
  } catch (e) {
    error.value = e.message || 'Error al eliminar tarifa'
  }
}

onMounted(() => {
  fetchRates()
  fetchVehicleTypes()
})
</script>

<style scoped>
.rates-view { padding: 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
h2 { margin: 0; }
.section-title { font-size: 1rem; margin-bottom: 0.5rem; color: var(--color-text-muted, #555); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
.data-table th { background: #f0f0f0; }
.status-msg { color: #666; font-style: italic; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; }
.field-error { color: #e74c3c; font-size: 0.8rem; display: block; margin-top: 0.25rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; padding: 1.5rem; border-radius: 8px; min-width: 400px; max-width: 500px; }
.modal h3 { margin-top: 0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; }
.form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.form-group input[type="checkbox"] { width: auto; margin-right: 0.5rem; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.add-btn { background: #42b883; color: #fff; }
.edit-btn { background: #3498db; color: #fff; font-size: 0.85rem; padding: 0.25rem 0.75rem; margin-right: 0.25rem; }
.delete-btn { background: #e74c3c; color: #fff; font-size: 0.85rem; padding: 0.25rem 0.75rem; }
.submit-btn { background: #42b883; color: #fff; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cancel-btn { background: #95a5a6; color: #fff; }
</style>
