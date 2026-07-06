<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = ref({ document: '', name: '', phone: '', username: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')
const fieldErrors = ref({})
const successMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  fieldErrors.value = {}
  successMessage.value = ''
  loading.value = true
  try {
    await authStore.register(form.value)
    successMessage.value = 'Registro exitoso'
  } catch (err) {
    errorMessage.value = err.message || 'Error al registrarse'
    if (err.fieldErrors?.length) {
      const map = {}
      err.fieldErrors.forEach(e => { map[e.field] = e.message })
      fieldErrors.value = map
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <h2>Registrarse</h2>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <label>
      Documento
      <input v-model="form.document" type="text" required />
      <span v-if="fieldErrors.document" class="field-error">{{ fieldErrors.document }}</span>
    </label>

    <label>
      Nombre
      <input v-model="form.name" type="text" required />
      <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
    </label>

    <label>
      Teléfono
      <input v-model="form.phone" type="text" />
    </label>

    <label>
      Usuario
      <input v-model="form.username" type="text" required />
      <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
    </label>

    <label>
      Contraseña
      <input v-model="form.password" type="password" required />
      <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
    </label>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Registrando...' : 'Registrarse' }}
    </button>
  </form>
</template>

<style scoped>
.error { color: red; }
.success { color: green; }
.field-error { color: red; font-size: 0.85em; display: block; }
</style>
