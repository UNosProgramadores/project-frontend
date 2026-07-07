<template>
  <div class="rates-view">
    <div class="header">
      <h2>Tarifas</h2>
      <button class="btn add-btn" @click="openCreate">Agregar tarifa</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="rates.length === 0" class="status-msg">No hay tarifas configuradas</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Tipo vehículo</th>
          <th>Tarifa por hora</th>
          <th>Tarifa por día</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="rate in rates" :key="rate.id">
          <td>{{ vehicleTypeLabel(rate.vehicleType) }}</td>
          <td>${{ rate.hourlyRate }}</td>
          <td>${{ rate.dailyRate }}</td>
          <td>
            <button class="btn edit-btn" @click="openEdit(rate)">Editar</button>
            <button class="btn delete-btn" @click="handleDelete(rate.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h3>{{ editing ? 'Editar tarifa' : 'Nueva tarifa' }}</h3>
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Tipo vehículo</label>
            <select v-model="form.vehicleTypeId" :disabled="editing" required>
              <option value="" disabled>Seleccione tipo</option>
              <option v-for="vt in vehicleTypes" :key="vt.id" :value="vt.id">
                {{ vehicleTypeLabel(vt.name) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Tarifa por hora</label>
            <input v-model.number="form.hourlyRate" type="number" min="0" step="0.01" required />
          </div>
          <div class="form-group">
            <label>Tarifa por día</label>
            <input v-model.number="form.dailyRate" type="number" min="0" step="0.01" required />
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
import { ref, reactive, onMounted } from 'vue'
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

const form = reactive({ vehicleTypeId: '', hourlyRate: 0, dailyRate: 0 })

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
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
  form.hourlyRate = 0
  form.dailyRate = 0
  formError.value = null
  showForm.value = true
}

function openEdit(rate) {
  editing.value = true
  editId.value = rate.id
  form.vehicleTypeId = rate.vehicleTypeId || ''
  form.hourlyRate = rate.hourlyRate
  form.dailyRate = rate.dailyRate
  formError.value = null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
}

async function handleSave() {
  formError.value = null
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
.rates-view {
  padding: 1rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
h2 {
  margin: 0;
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
}
.modal h3 {
  margin-top: 0;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}
.add-btn {
  background: #42b883;
  color: #fff;
}
.edit-btn {
  background: #3498db;
  color: #fff;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  margin-right: 0.25rem;
}
.delete-btn {
  background: #e74c3c;
  color: #fff;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
}
.submit-btn {
  background: #42b883;
  color: #fff;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cancel-btn {
  background: #95a5a6;
  color: #fff;
}
</style>
