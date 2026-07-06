import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api/auth'

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

function buildUserFromToken(token) {
  const payload = decodeToken(token)
  if (!payload) return null
  return {
    username: payload.sub,
    role: payload.role,
    userId: payload.userId,
    parkingLotId: payload.parkingLotId ?? null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role ?? null)

  function setSession(newToken) {
    token.value = newToken
    user.value = buildUserFromToken(newToken)
    localStorage.setItem('parking_auth_token', newToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem('parking_auth_token')
  }

  const saved = localStorage.getItem('parking_auth_token')
  if (saved) {
    const u = buildUserFromToken(saved)
    if (u) {
      token.value = saved
      user.value = u
    }
  }

  async function login(username, password) {
    const res = await apiLogin(username, password)
    setSession(res.data.token)
  }

  async function register(payload) {
    const res = await apiRegister(payload)
    setSession(res.data.token)
  }

  function logout() {
    clearSession()
  }

  return { token, user, isAuthenticated, role, login, register, logout }
})
