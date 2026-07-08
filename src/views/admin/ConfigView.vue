<template>
  <div class="config-view">
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'general' }"
        @click="activeTab = 'general'"
      >General</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'map' }"
        @click="switchToMapTab"
      >Mapa</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>

    <!-- TAB 1: GENERAL -->
    <form
      v-else-if="activeTab === 'general' && !error"
      @submit.prevent="handleSave"
      class="config-form"
    >
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

      <div v-if="saveError" class="error-msg">{{ saveError }}</div>
      <div v-if="saveSuccess" class="success-msg">Configuración guardada exitosamente</div>
      <button type="submit" class="btn submit-btn" :disabled="saving">
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </form>

    <!-- TAB 2: MAPA -->
    <div v-else-if="activeTab === 'map' && !error" class="map-tab">
      <div class="map-controls">
        <div class="top-controls">
          <div class="size-controls">
            <div class="form-group">
              <label>Filas</label>
              <input v-model.number="form.rows" type="number" min="1" max="100" required />
            </div>
            <div class="form-group">
              <label>Columnas</label>
              <input v-model.number="form.columns" type="number" min="1" max="100" required />
            </div>
            <button class="btn action-btn" :disabled="resizing" @click="handleResize">
              {{ resizing ? 'Redimensionando...' : 'Redimensionar' }}
            </button>
          </div>
          <div v-if="selectedCellIds.length" class="batch-inline">
            <span class="batch-count">{{ selectedCellIds.length }} celda(s)</span>
            <select v-model="batchCellType" class="batch-select">
              <option value="parking">Parqueo</option>
              <option value="transit">Tránsito</option>
            </select>
            <select v-if="batchCellType === 'parking'" v-model="batchVehicleTypeId" class="batch-select">
              <option value="" disabled>Tipo vehículo</option>
              <option v-for="vt in vehicleTypes" :key="vt.id" :value="vt.id">{{ vtLabel(vt.name) }}</option>
            </select>
            <button class="btn batch-btn" :disabled="batchSaving || (batchCellType === 'parking' && !batchVehicleTypeId)" @click="applyBatch">
              {{ batchSaving ? 'Aplicando...' : 'Aplicar' }}
            </button>
            <button class="btn batch-btn cancel" @click="clearSelection">Limpiar</button>
          </div>
        </div>
        <div v-if="resizeMsg" class="success-msg">{{ resizeMsg }}</div>
        <div v-if="resizeError" class="error-msg">{{ resizeError }}</div>
        <div v-if="mapError" class="error-msg">{{ mapError }}</div>
        <div class="grid-section">
          <div v-if="mapLoading" class="status-msg">Cargando mapa...</div>
          <ParkingGrid
            v-else
            :rows="mapData.rows"
            :columns="mapData.columns"
            :grid="mapData.grid"
            :editable="true"
            :selectable-ids="selectedCellIds"
            @cell-click="toggleCellSelection"
          />
        </div>
      </div>

      <div class="danger-zone">
        <h3>Zona de peligro</h3>
        <p>Eliminar el parqueadero borrará todas las celdas, tarifas, descuentos y registros asociados.</p>
        <button class="btn danger-btn" :disabled="deleting" @click="handleDelete">
          {{ deleting ? 'Eliminando...' : 'Eliminar parqueadero' }}
        </button>
      </div>
    </div>

    <div v-else-if="error" class="error-msg">{{ error }}</div>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getParkingLot, updateParkingLot, deleteParkingLot } from '@/api/config'
import { getParkingLotMap } from '@/api/parkingLots'
import { getVehicleTypes } from '@/api/vehicleTypes'
import { updateCellType, updateCellVehicleType } from '@/api/cells'
import ParkingGrid from '@/components/map/ParkingGrid.vue'

const authStore = useAuthStore()
const router = useRouter()
const parkingLotId = authStore.user?.parkingLotId

const activeTab = ref('general')
const loading = ref(true)
const error = ref(null)

const form = reactive({ name: '', address: '', openingTime: '', closingTime: '', rows: 1, columns: 1, autoAssignment: false, discountsEnabled: false })
const originalSize = reactive({ rows: 1, columns: 1 })
const saving = ref(false)
const saveError = ref(null)
const saveSuccess = ref(false)
const fieldErrors = ref({})

// Map tab state
const mapData = reactive({ rows: 1, columns: 1, grid: [] })
const mapLoading = ref(false)
const mapError = ref(null)
const resizing = ref(false)
const resizeMsg = ref('')
const resizeError = ref(null)
const deleting = ref(false)

// Batch cell editor state
const selectedCellIds = ref([])
const batchCellType = ref('parking')
const batchVehicleTypeId = ref('')
const batchSaving = ref(false)
const vehicleTypes = ref([])

const timers = ref([])

function flash(ref, value, ms = 5000) {
  ref.value = value
  const t = setTimeout(() => { ref.value = value === true ? false : '' }, ms)
  timers.value.push(t)
}

const vtLabels = { car: 'Carro', motorcycle: 'Moto', bicycle: 'Bicicleta' }
const vtLabel = (name) => vtLabels[name] || name

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

async function fetchMap() {
  if (!parkingLotId) return
  mapLoading.value = true
  try {
    const res = await getParkingLotMap(parkingLotId)
    mapData.rows = res.data.rows
    mapData.columns = res.data.columns
    mapData.grid = res.data.grid
  } catch (e) {
    flash(mapError, e.message || 'Error al cargar el mapa')
  } finally {
    mapLoading.value = false
  }
}

async function fetchVehicleTypes() {
  try {
    const res = await getVehicleTypes()
    vehicleTypes.value = res.data
  } catch {
    // non-critical, dropdown just empty
  }
}

function switchToMapTab() {
  activeTab.value = 'map'
  resizeMsg.value = ''
  fetchMap()
}

async function handleResize() {
  resizing.value = true
  resizeMsg.value = ''
  try {
    await updateParkingLot(parkingLotId, {
      name: form.name,
      address: form.address,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      rows: form.rows,
      columns: form.columns,
      autoAssignment: form.autoAssignment,
      discountsEnabled: form.discountsEnabled
    })
    originalSize.rows = form.rows
    originalSize.columns = form.columns
    flash(resizeMsg, 'Tamaño actualizado')
    await fetchMap()
  } catch (e) {
    resizeMsg.value = ''
    flash(resizeError, e.message || 'Error al redimensionar')
  } finally {
    resizing.value = false
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
    flash(saveSuccess, true)
  } catch (e) {
    flash(saveError, e.message || 'Error al guardar configuración')
    if (e.fieldErrors?.length) {
      const map = {}
      e.fieldErrors.forEach(fe => { map[fe.field] = fe.message })
      fieldErrors.value = map
    }
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm('¿Estás seguro de eliminar este parqueadero? Esta acción no se puede deshacer.')) return
  deleting.value = true
  try {
    await deleteParkingLot(parkingLotId)
    router.push('/admin/dashboard')
  } catch (e) {
    error.value = e.message || 'Error al eliminar parqueadero'
  } finally {
    deleting.value = false
  }
}

function toggleCellSelection(cell) {
  const idx = selectedCellIds.value.indexOf(cell.id)
  if (idx >= 0) {
    selectedCellIds.value.splice(idx, 1)
  } else {
    selectedCellIds.value.push(cell.id)
  }
}

function clearSelection() {
  selectedCellIds.value = []
}

async function applyBatch() {
  if (!selectedCellIds.value.length) return
  batchSaving.value = true
  try {
    for (const cellId of selectedCellIds.value) {
      const cell = mapData.grid.flat().find(c => c && c.id === cellId)
      if (!cell) continue
      if (batchCellType.value !== cell.cellType) {
        await updateCellType(parkingLotId, cellId, batchCellType.value)
      }
      if (batchCellType.value === 'parking' && batchVehicleTypeId.value && batchVehicleTypeId.value !== cell.vehicleTypeId) {
        await updateCellVehicleType(parkingLotId, cellId, batchVehicleTypeId.value)
      }
    }
    clearSelection()
    await fetchMap()
  } catch (e) {
    alert('Error al aplicar cambios: ' + (e.message || 'desconocido'))
  } finally {
    batchSaving.value = false
  }
}

onMounted(() => {
  fetchConfig()
  fetchVehicleTypes()
})

onUnmounted(() => {
  timers.value.forEach(clearTimeout)
})
</script>

<style scoped>
.config-view { padding: 1rem; }

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}
.tab-btn {
  padding: 0.6rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}
.tab-btn.active {
  color: #42b883;
  border-bottom-color: #42b883;
}
.tab-btn:hover { color: #333; }

.config-form { max-width: 500px; }
.map-tab { max-width: 700px; }
.map-controls { margin-bottom: 2rem; }

.size-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.size-controls .form-group { margin-bottom: 0; }
.size-controls .form-group input { width: 80px; }

.action-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.grid-section { margin-top: 1rem; }

.danger-zone {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #e74c3c;
  border-radius: 6px;
}
.danger-zone h3 { color: #e74c3c; margin-bottom: 0.5rem; }
.danger-zone p { font-size: 0.85rem; color: #666; margin-bottom: 0.75rem; }

.danger-btn {
  padding: 0.5rem 1.5rem;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.danger-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Top controls row */
.top-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.batch-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
}
.batch-count {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-primary-700);
  white-space: nowrap;
}
.batch-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}
.batch-btn {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  background: var(--color-primary-700);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
}
.batch-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.batch-btn.cancel {
  background: #95a5a6;
}
.batch-btn.cancel:hover { background: #7f8c8d; }
.cancel-btn {
  padding: 0.5rem 1.5rem;
  background: #95a5a6;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.cancel-btn:hover { background: #7f8c8d; }
.submit-btn {
  padding: 0.5rem 1.5rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; }
.form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.form-group input[type="checkbox"] { width: auto; margin-right: 0.5rem; }
.form-group input[type="time"] { width: auto; }
.field-error { color: #e74c3c; font-size: 0.8rem; display: block; margin-top: 0.25rem; }
.status-msg { color: #666; font-style: italic; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; padding: 0.5rem; background: #fdecea; border-radius: 4px; }
.success-msg { color: #27ae60; margin-bottom: 0.5rem; padding: 0.5rem; background: #eafaf1; border-radius: 4px; }
</style>
