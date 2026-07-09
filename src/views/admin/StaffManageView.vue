<template>
  <div class="staff-view">
    <div class="section">
      <h2>Trabajadores registrados</h2>
      <div v-if="staffLoading" class="status-msg">Cargando...</div>
      <div v-else-if="staffError" class="error-msg">{{ staffError }}</div>
      <div v-else-if="staffList.length === 0" class="status-msg">No hay trabajadores registrados en este parqueadero</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Documento</th>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in staffList" :key="s.id">
            <td>{{ s.id }}</td>
            <td>{{ s.document }}</td>
            <td>{{ s.name }}</td>
            <td>{{ s.username }}</td>
            <td>{{ s.phone || '—' }}</td>
            <td>
              <span v-if="!s.active" class="badge badge-inactive">Inactivo</span>
              <span v-else-if="s.blocked" class="badge badge-blocked">Bloqueado ({{ s.failedAttempts }}/5)</span>
              <span v-else class="badge badge-active">Activo</span>
            </td>
            <td>
              <button v-if="s.blocked" class="btn unlock-btn-sm" @click="handleUnlock(s.id)">Desbloquear</button>
              <span v-else class="text-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Registrar trabajador</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-row">
          <div class="form-group">
            <label>Documento / Cédula</label>
            <input v-model="regForm.document" type="text" required />
            <span v-if="regFieldErrors.document" class="field-error">{{ regFieldErrors.document }}</span>
          </div>
          <div class="form-group">
            <label>Nombre completo</label>
            <input v-model="regForm.name" type="text" required />
            <span v-if="regFieldErrors.name" class="field-error">{{ regFieldErrors.name }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Teléfono (opcional)</label>
            <input v-model="regForm.phone" type="text" />
          </div>
          <div class="form-group">
            <label>Nombre de usuario</label>
            <input v-model="regForm.username" type="text" required />
            <span v-if="regFieldErrors.username" class="field-error">{{ regFieldErrors.username }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Contraseña</label>
            <input v-model="regForm.password" type="password" required />
            <span v-if="regFieldErrors.password" class="field-error">{{ regFieldErrors.password }}</span>
          </div>
          <div class="form-group">
            <label>Parqueadero ID</label>
            <input :value="parkingLotId" type="number" disabled class="input-disabled" />
          </div>
        </div>
        <div v-if="regError" class="error-msg">{{ regError }}</div>
        <div v-if="regSuccess" class="success-msg">{{ regSuccess }}</div>
        <button type="submit" class="btn submit-btn" :disabled="regSaving">
          {{ regSaving ? 'Registrando...' : 'Registrar trabajador' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getStaff, registerStaff, unlockStaff } from '@/api/staff'

const authStore = useAuthStore()
const parkingLotId = authStore.user?.parkingLotId

const staffList = ref([])
const staffLoading = ref(true)
const staffError = ref(null)

async function fetchStaff() {
  if (!parkingLotId) return
  staffLoading.value = true
  staffError.value = null
  try {
    const res = await getStaff(parkingLotId)
    staffList.value = res.data
  } catch (e) {
    staffError.value = e.message || 'Error al cargar trabajadores'
  } finally {
    staffLoading.value = false
  }
}

const regForm = reactive({
  document: '',
  name: '',
  phone: '',
  username: '',
  password: ''
})
const regFieldErrors = ref({})
const regError = ref(null)
const regSuccess = ref(null)
const regSaving = ref(false)

async function handleRegister() {
  regError.value = null
  regSuccess.value = null
  regFieldErrors.value = {}
  if (!parkingLotId) {
    regError.value = 'No tienes un parqueadero asignado'
    return
  }
  regSaving.value = true
  try {
    await registerStaff({
      document: regForm.document,
      name: regForm.name,
      phone: regForm.phone || null,
      username: regForm.username,
      password: regForm.password,
      parkingLotId
    })
    regSuccess.value = 'Trabajador registrado exitosamente'
    regForm.document = ''
    regForm.name = ''
    regForm.phone = ''
    regForm.username = ''
    regForm.password = ''
    await fetchStaff()
  } catch (e) {
    regError.value = e.message || 'Error al registrar trabajador'
    if (e.fieldErrors?.length) {
      const map = {}
      e.fieldErrors.forEach(fe => { map[fe.field] = fe.message })
      regFieldErrors.value = map
    }
  } finally {
    regSaving.value = false
  }
}

const unlockSaving = ref(false)

async function handleUnlock(userId) {
  unlockSaving.value = true
  try {
    await unlockStaff(userId)
    await fetchStaff()
  } catch (e) {
    staffError.value = e.message || 'Error al desbloquear usuario'
  } finally {
    unlockSaving.value = false
  }
}

onMounted(fetchStaff)
</script>

<style scoped>
.staff-view { padding: 1rem; display: flex; flex-direction: column; gap: 2rem; }
.section { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; }
h2 { margin: 0 0 1rem; font-size: 1.1rem; color: #333; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
.form-row .form-group { flex: 1; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.85rem; }
.form-group input, .form-group select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.input-disabled { background: #e9ecef; color: #6c757d; cursor: not-allowed; }
.data-table { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; font-size: 0.85rem; }
.data-table th { background: #f0f0f0; }
.field-error { color: #e74c3c; font-size: 0.8rem; display: block; margin-top: 0.25rem; }
.error-msg { color: #e74c3c; margin-bottom: 0.5rem; font-size: 0.9rem; }
.success-msg { color: #27ae60; margin-bottom: 0.5rem; font-size: 0.9rem; }
.status-msg { color: #666; font-style: italic; font-size: 0.9rem; }
.text-muted { color: #999; font-size: 0.8rem; }
.badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
.badge-active { background: #d4edda; color: #155724; }
.badge-blocked { background: #f8d7da; color: #721c24; }
.badge-inactive { background: #fff3cd; color: #856404; }
.btn { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.submit-btn { background: #42b883; color: #fff; margin-top: 0.5rem; }
.unlock-btn-sm { background: #e67e22; color: #fff; font-size: 0.8rem; padding: 0.25rem 0.6rem; }
</style>
