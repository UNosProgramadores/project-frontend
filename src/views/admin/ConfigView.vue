<template>
  <div class="config-view">
    <h2>Configuración del parqueadero</h2>
    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <form v-else @submit.prevent="handleSave" class="config-form">
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="form.name" required />
        <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input v-model="form.address" required />
        <span v-if="fieldErrors.address" class="field-error">{{ fieldErrors.address }}</span>
      </div>
      <div class="form-group">
        <label>Hora de apertura</label>
        <input v-model="form.openingTime" type="time" required />
        <span v-if="fieldErrors.openingTime" class="field-error">{{ fieldErrors.openingTime }}</span>
      </div>
      <div class="form-group">
        <label>Hora de cierre</label>
        <input v-model="form.closingTime" type="time" required />
        <span v-if="fieldErrors.closingTime" class="field-error">{{ fieldErrors.closingTime }}</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Filas</label>
          <input v-model.number="form.rows" type="number" min="1" max="100" required />
          <span v-if="fieldErrors.rows" class="field-error">{{ fieldErrors.rows }}</span>
        </div>
        <div class="form-group">
          <label>Columnas</label>
          <input v-model.number="form.columns" type="number" min="1" max="100" required />
          <span v-if="fieldErrors.columns" class="field-error">{{ fieldErrors.columns }}</span>
        </div>
      </div>
      <div v-if="sizeChanged" class="warning-msg">
        ⚠ Al cambiar el tamaño se regenerará el mapa de celdas. Las celdas existentes con vehículos activos podrían verse afectadas.
      </div>
      <div class="form-group">
        <label>
          <input v-model="form.autoAssignment" type="checkbox" />
          Asignación automática de celdas
        </label>
      </div>
      <div class="form-group">
        <label>
          <input v-model="form.discountsEnabled" type="checkbox" />
          Descuentos habilitados
        </label>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getParkingLot, updateParkingLot } from '@/api/config'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const form = reactive({ name: '', address: '', openingTime: '', closingTime: '', rows: 1, columns: 1, autoAssignment: false, discountsEnabled: false })
const originalSize = reactive({ rows: 1, columns: 1 })
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const saveError = ref(null)
const saveSuccess = ref(false)
const fieldErrors = ref({})

const sizeChanged = computed(() => {
  return form.rows !== originalSize.rows || form.columns !== originalSize.columns
})

function toTimeInput(val) {
  if (!val) return ''
  return val.length > 5 ? val.slice(0, 5) : val
}

async function fetchConfig() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const res = await getParkingLot(parkingLotId)
    const d = res.data
    form.name = d.name || ''
    form.address = d.address || ''
    form.openingTime = toTimeInput(d.openingTime)
    form.closingTime = toTimeInput(d.closingTime)
    form.rows = d.rows ?? 1
    form.columns = d.columns ?? 1
    form.autoAssignment = d.autoAssignment ?? false
    form.discountsEnabled = d.discountsEnabled ?? false
    originalSize.rows = form.rows
    originalSize.columns = form.columns
  } catch (e) {
    error.value = e.message || 'Error al cargar configuración'
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  saveError.value = null
  saveSuccess.value = false
  fieldErrors.value = {}
  saving.value = true
  try {
    await updateParkingLot(parkingLotId, { ...form })
    originalSize.rows = form.rows
    originalSize.columns = form.columns
    saveSuccess.value = true
  } catch (e) {
    saveError.value = e.message || 'Error al guardar configuración'
    if (e.fieldErrors?.length) {
      const map = {}
      e.fieldErrors.forEach(fe => { map[fe.field] = fe.message })
      fieldErrors.value = map
    }
  } finally {
    saving.value = false
  }
}

onMounted(fetchConfig)
</script>

<style scoped>
.config-view { padding: 1rem; }
h2 { margin-bottom: 1rem; }
.config-form { max-width: 500px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.form-group input[type="checkbox"] { width: auto; margin-right: 0.5rem; }
.form-group input[type="time"] { width: auto; }
.form-row { display: flex; gap: 1rem; }
.form-row .form-group { flex: 1; }
.field-error { color: #e74c3c; font-size: 0.8rem; display: block; margin-top: 0.25rem; }
.warning-msg { color: #e67e22; background: #fef3e2; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.85rem; }
.submit-btn { padding: 0.5rem 1.5rem; background: #42b883; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.status-msg { color: #666; font-style: italic; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; }
.success-msg { color: #27ae60; margin-bottom: 0.5rem; padding: 0.5rem; background: #eafaf1; border-radius: 4px; }
</style>
