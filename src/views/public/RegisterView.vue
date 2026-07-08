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
  <form class="form-card" @submit.prevent="handleSubmit" style="max-width: 480px;">
    <h2>Registrarse</h2>

    <p v-if="successMessage" class="form-alert form-alert--success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

    <div class="field">
      <label for="reg-document">Documento</label>
      <input id="reg-document" v-model="form.document" type="text" class="form-input" required />
      <span v-if="fieldErrors.document" class="field-error">{{ fieldErrors.document }}</span>
    </div>

    <div class="field">
      <label for="reg-name">Nombre</label>
      <input id="reg-name" v-model="form.name" type="text" class="form-input" required />
      <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
    </div>

    <div class="field">
      <label for="reg-phone">Teléfono</label>
      <input id="reg-phone" v-model="form.phone" type="text" class="form-input" />
    </div>

    <div class="field">
      <label for="reg-username">Usuario</label>
      <input id="reg-username" v-model="form.username" type="text" class="form-input" required />
      <span v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</span>
    </div>

    <div class="field">
      <label for="reg-password">Contraseña</label>
      <input id="reg-password" v-model="form.password" type="password" class="form-input" required />
      <span v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</span>
    </div>

    <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
      {{ loading ? 'Registrando...' : 'Registrarse' }}
    </button>
  </form>
</template>
