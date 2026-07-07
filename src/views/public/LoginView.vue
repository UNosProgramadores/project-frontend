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
  <form @submit.prevent="handleSubmit">
    <h2>Iniciar sesión</h2>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <label>
      Usuario
      <input v-model="username" type="text" required />
    </label>

    <label>
      Contraseña
      <input v-model="password" type="password" required />
    </label>

    <button type="submit" :disabled="loading">
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </button>
  </form>
</template>

<style scoped>
.error { color: red; }
</style>
