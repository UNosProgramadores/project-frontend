<template>
  <div class="discounts-view">
    <div class="header">
      <h2>Descuentos</h2>
      <button class="btn add-btn" @click="openCreate">Agregar descuento</button>
    </div>

    <div v-if="loading" class="status-msg">Cargando...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <div v-else-if="discounts.length === 0" class="status-msg">No hay descuentos configurados</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Porcentaje</th>
          <th>Activo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="discount in discounts" :key="discount.id">
          <td>{{ discount.name }}</td>
          <td>{{ discount.description }}</td>
          <td>{{ discount.percentage }}%</td>
          <td>{{ discount.active ? 'Sí' : 'No' }}</td>
          <td>
            <button class="btn edit-btn" @click="openEdit(discount)">Editar</button>
            <button class="btn delete-btn" @click="handleDelete(discount.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h3>{{ editing ? 'Editar descuento' : 'Nuevo descuento' }}</h3>
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Porcentaje de descuento</label>
            <input v-model.number="form.percentage" type="number" min="0" max="100" step="0.01" required />
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
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/api/discounts'

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

const form = reactive({ name: '', description: '', percentage: 0, active: true })

async function fetchDiscounts() {
  if (!parkingLotId) return
  loading.value = true
  error.value = null
  try {
    const res = await getDiscounts(parkingLotId)
    discounts.value = res.data
  } catch (e) {
    error.value = e.message || 'Error al cargar descuentos'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  editId.value = null
  form.name = ''
  form.description = ''
  form.percentage = 0
  form.active = true
  formError.value = null
  showForm.value = true
}

function openEdit(discount) {
  editing.value = true
  editId.value = discount.id
  form.name = discount.name
  form.description = discount.description || ''
  form.percentage = discount.percentage
  form.active = discount.active
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
      await updateDiscount(parkingLotId, editId.value, { ...form })
    } else {
      await createDiscount(parkingLotId, { ...form })
    }
    closeForm()
    await fetchDiscounts()
  } catch (e) {
    formError.value = e.message || 'Error al guardar descuento'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar este descuento?')) return
  try {
    await deleteDiscount(parkingLotId, id)
    await fetchDiscounts()
  } catch (e) {
    error.value = e.message || 'Error al eliminar descuento'
  }
}

onMounted(fetchDiscounts)
</script>

<style scoped>
.discounts-view {
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
.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
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
