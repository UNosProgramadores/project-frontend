<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const defaultRoutes = {
  admin: '/admin/config',
  staff: '/staff/entry-exit',
  customer: '/customer/vehicles'
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    router.push(defaultRoutes[authStore.role] || '/')
  } catch (err) {
    errorMessage.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="auth-card" @submit.prevent="handleSubmit">
    <h2>Iniciar sesión</h2>

    <p v-if="errorMessage" class="form-alert form-alert--error">{{ errorMessage }}</p>

    <div class="field">
      <label for="login-username">Usuario</label>
      <input id="login-username" v-model="username" type="text" class="form-input" required />
    </div>

    <div class="field">
      <label for="login-password">Contraseña</label>
      <input id="login-password" v-model="password" type="password" class="form-input" required />
    </div>

    <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>
