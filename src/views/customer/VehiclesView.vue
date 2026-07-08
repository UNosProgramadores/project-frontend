<template>
  <div class="vehicles-view">
    <div v-if="loading" class="status-msg">Cargando vehículos...</div>
    <div v-else-if="loadError" class="error-msg">{{ loadError }}</div>
    <div v-else class="vehicles-list">
      <h3>Mis vehículos ({{ vehicles.length }})</h3>
      <table v-if="vehicles.length" class="data-table">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Identificación</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicles" :key="v.id">
            <td>{{ vehicleTypeLabel(v.vehicleType?.name) }}</td>
            <td>{{ v.plate || v.bikeRegistration }}</td>
            <td>{{ v.brand || '-' }}</td>
            <td>{{ v.model || '-' }}</td>
            <td>{{ v.color || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="status-msg">Aún no tienes vehículos asociados.</p>
    </div>

    <hr class="divider" />

    <h3>Reclamar vehículo</h3>
    <p class="hint">Si tu vehículo ya ingresó al parqueadero, puedes asociarlo a tu cuenta ingresando su placa o registro de bicicleta.</p>

    <form @submit.prevent="handleClaim" class="claim-form">
      <div class="form-group">
        <label>Placa</label>
        <input v-model="form.plate" placeholder="ABC123" />
      </div>

      <div class="form-group">
        <label>Registro de bicicleta</label>
        <input v-model="form.bikeRegistration" placeholder="AABBCCD" />
      </div>

      <p class="hint-sm">Ingresa la placa o el registro de bicicleta (al menos uno).</p>

      <div v-if="claimError" class="error-msg">{{ claimError }}</div>
      <div v-if="claimFieldErrors.length" class="field-errors">
        <p v-for="fe in claimFieldErrors" :key="fe.field" class="field-error">{{ fe.message }}</p>
      </div>

      <button type="submit" class="btn submit-btn" :disabled="claiming">
        {{ claiming ? 'Reclamando...' : 'Reclamar vehículo' }}
      </button>
    </form>

    <div v-if="claimSuccess" class="success-msg">
      Vehículo reclamado con éxito.
      <span v-if="claimedVehicle">
        {{ claimedVehicle.plate || claimedVehicle.bikeRegistration }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { claimVehicle, getMyVehicles } from '@/api/vehicles'

const vehicles = ref([])
const loading = ref(false)
const loadError = ref(null)

const form = reactive({ plate: '', bikeRegistration: '' })
const claiming = ref(false)
const claimError = ref(null)
const claimFieldErrors = ref([])
const claimSuccess = ref(false)
const claimedVehicle = ref(null)

function vehicleTypeLabel(name) {
  const map = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
  return map[name] || name
}

async function fetchMyVehicles() {
  loading.value = true
  loadError.value = null
  try {
    const res = await getMyVehicles()
    vehicles.value = res.data
  } catch (e) {
    loadError.value = e.message || 'Error al cargar vehículos'
  } finally {
    loading.value = false
  }
}

async function handleClaim() {
  claimError.value = null
  claimFieldErrors.value = []
  claimSuccess.value = false
  claimedVehicle.value = null

  if (!form.plate.trim() && !form.bikeRegistration.trim()) {
    claimError.value = 'Debes ingresar una placa o un registro de bicicleta'
    return
  }

  claiming.value = true
  try {
    const payload = {}
    if (form.plate.trim()) payload.plate = form.plate.trim()
    if (form.bikeRegistration.trim()) payload.bikeRegistration = form.bikeRegistration.trim()
    const res = await claimVehicle(payload)
    claimedVehicle.value = res.data
    claimSuccess.value = true
    form.plate = ''
    form.bikeRegistration = ''
    fetchMyVehicles()
  } catch (e) {
    if (e.fieldErrors && e.fieldErrors.length) {
      claimFieldErrors.value = e.fieldErrors
    } else {
      claimError.value = e.message || 'Error al reclamar vehículo'
    }
  } finally {
    claiming.value = false
  }
}

onMounted(() => {
  fetchMyVehicles()
})
</script>

<style scoped>
.vehicles-view {
  padding: 1rem;
  max-width: 600px;
}
.vehicles-list {
  margin-bottom: 1rem;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}
.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
.data-table th {
  background: #f0f0f0;
}
.divider {
  margin: 1.5rem 0;
  border: none;
  border-top: 1px solid #ddd;
}
.hint {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.hint-sm {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.claim-form {
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.form-group input {
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
  padding: 0.75rem;
  background: #eafaf1;
  border-radius: 4px;
}
</style>
