<template>
  <div class="config-view">
    <h2>Configuración del parqueadero</h2>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <form v-else @submit.prevent="handleSave" class="config-form">
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.name" required />
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input v-model="form.address" required />
      </div>
      <div class="form-group">
        <label>Capacidad total</label>
        <input v-model.number="form.capacity" type="number" min="1" required />
      </div>
      <div v-if="saveError" class="error-msg">{{ saveError }}</div>
      <div v-if="saveSuccess" class="success-msg">Configuración guardada exitosamente</div>
      <button type="submit" class="btn submit-btn" :disabled="saving">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getParkingLot, updateParkingLot } from '@/api/config'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const form = reactive({ name: '', address: '', capacity: 0 })
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const saveError = ref(null)
const saveSuccess = ref(false)

async function fetchConfig() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const res = await getParkingLot(parkingLotId)
    form.name = res.data.name || ''
    form.address = res.data.address || ''
    form.capacity = res.data.capacity || 0
  } catch (e) {
    error.value = e.message || 'Error al cargar configuración'
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saveError.value = null
  saveSuccess.value = false
  saving.value = true
  try {
    await updateParkingLot(parkingLotId, { ...form })
    saveSuccess.value = true
  } catch (e) {
    saveError.value = e.message || 'Error al guardar configuración'
  } finally {
    saving.value = false
  }
}

onMounted(fetchConfig)
</script>

<style scoped>
.config-view {
  padding: 1rem;
}
h2 {
  margin-bottom: 1rem;
}
.config-form {
  max-width: 500px;
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
.success-msg {
  color: #27ae60;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #eafaf1;
  border-radius: 4px;
}
</style>
