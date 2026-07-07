<template>
  <div class="discounts-view">
    <div class="header-row">
      <div class="header">
        <h2>Descuentos</h2>
        <button class="btn add-btn" @click="openCreate">Agregar descuento</button>
      </div>
      <div class="toggle-section">
        <span class="toggle-label">Descuentos en parqueadero:</span>
        <button class="btn toggle-btn" :class="{ active: discountsEnabled }" @click="handleToggle">
          {{ discountsEnabled ? 'Activado' : 'Desactivado' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="discounts.length === 0" class="status-msg">No hay configuraciones de descuento</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>% Descuento</th>
          <th>Factura mínima</th>
          <th>Visitas mínimas</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Activo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="dc in discounts" :key="dc.id">
          <td>{{ dc.discountPercentage }}%</td>
          <td>{{ dc.minExternalInvoice ? '$' + dc.minExternalInvoice : '—' }}</td>
          <td>{{ dc.minVisits ?? '—' }}</td>
          <td>{{ formatDate(dc.startDate) }}</td>
          <td>{{ formatDate(dc.endDate) || 'Indefinido' }}</td>
          <td>{{ dc.active ? 'Sí' : 'No' }}</td>
          <td>
            <button class="btn edit-btn" @click="openEdit(dc)">Editar</button>
            <button class="btn delete-btn" @click="handleDelete(dc.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h3>{{ editing ? 'Editar descuento' : 'Nueva configuración de descuento' }}</h3>
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Porcentaje de descuento (%)</label>
            <input v-model.number="form.discountPercentage" type="number" min="0" max="100" step="0.01" required />
            <span v-if="fieldErrors.discountPercentage" class="field-error">{{ fieldErrors.discountPercentage }}</span>
          </div>
          <div class="form-group">
            <label>Monto mínimo de factura externa (opcional)</label>
            <input v-model.number="form.minExternalInvoice" type="number" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label>Visitas mínimas (opcional)</label>
            <input v-model.number="form.minVisits" type="number" min="0" step="1" />
          </div>
          <div class="form-group">
            <label>Fecha de inicio</label>
            <input v-model="form.startDate" type="date" />
          </div>
          <div class="form-group">
            <label>Fecha de fin (opcional)</label>
            <input v-model="form.endDate" type="date" />
          </div>
          <div class="form-group">
            <label>
              <input v-model="form.active" type="checkbox" />
              Activo
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
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount, toggleDiscountsEnabled } from '@/api/discounts'
import { getParkingLot } from '@/api/config'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const discounts = ref([])
const loading = ref(true)
const error = ref(null)
const showForm = ref(false)
const editing = ref(false)
const saving = ref(false)
const formError = ref(null)
const editId = ref(null)
const fieldErrors = ref({})
const discountsEnabled = ref(false)

const form = reactive({
  discountPercentage: 0,
  minExternalInvoice: null,
  minVisits: null,
  startDate: '',
  endDate: '',
  active: true
})

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleDateString()
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

async function fetchDiscounts() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const [disRes, lotRes] = await Promise.all([
      getDiscounts(parkingLotId),
      getParkingLot(parkingLotId)
    ])
    discounts.value = disRes.data
    discountsEnabled.value = lotRes.data.discountsEnabled
  } catch (e) {
    error.value = e.message || 'Error al cargar descuentos'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.discountPercentage = 0
  form.minExternalInvoice = null
  form.minVisits = null
  form.startDate = todayStr()
  form.endDate = ''
  form.active = true
  formError.value = null
  fieldErrors.value = {}
  showForm.value = true
}

function openEdit(dc) {
  editing.value = true
  editId.value = dc.id
  form.discountPercentage = dc.discountPercentage
  form.minExternalInvoice = dc.minExternalInvoice
  form.minVisits = dc.minVisits
  form.startDate = dc.startDate ? dc.startDate.slice(0, 10) : todayStr()
  form.endDate = dc.endDate ? dc.endDate.slice(0, 10) : ''
  form.active = dc.active !== false
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
    const payload = {
      discountPercentage: form.discountPercentage,
      minExternalInvoice: form.minExternalInvoice || null,
      minVisits: form.minVisits || null,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      active: form.active
    }
    if (editing.value) {
      await updateDiscount(parkingLotId, editId.value, payload)
    } else {
      await createDiscount(parkingLotId, payload)
    }
    closeForm()
    await fetchDiscounts()
  } catch (e) {
    formError.value = e.message || 'Error al guardar descuento'
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
  if (!confirm('¿Eliminar esta configuración de descuento?')) return
  try {
    await deleteDiscount(parkingLotId, id)
    await fetchDiscounts()
  } catch (e) {
    error.value = e.message || 'Error al eliminar descuento'
  }
}

async function handleToggle() {
  try {
    const res = await toggleDiscountsEnabled(parkingLotId)
    discountsEnabled.value = res.data.discountsEnabled
  } catch (e) {
    error.value = e.message || 'Error al cambiar estado de descuentos'
  }
}

onMounted(fetchDiscounts)
</script>

<style scoped>
.discounts-view { padding: 1rem; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
.header { display: flex; justify-content: space-between; align-items: center; flex: 1; }
h2 { margin: 0; }
.toggle-section { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.toggle-label { font-weight: 600; font-size: 0.85rem; }
.toggle-btn { padding: 0.4rem 1rem; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 0.85rem; background: #e74c3c; color: #fff; }
.toggle-btn.active { background: #42b883; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
.data-table th { background: #f0f0f0; }
.status-msg { color: #666; font-style: italic; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; }
.field-error { color: #e74c3c; font-size: 0.8rem; display: block; margin-top: 0.25rem; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; padding: 1.5rem; border-radius: 8px; min-width: 420px; max-width: 520px; }
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
