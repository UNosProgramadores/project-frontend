import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use(config => {
  const token = localStorage.getItem('parking_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

function normalizeError(data, status) {
  return {
    message: data?.error || 'Error inesperado',
    status: data?.status ?? status ?? 0,
    fieldErrors: (data?.errors || []).map(e => ({
      field: e.field,
      message: e.message
    }))
  }
}

http.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const apiError = normalizeError(error.response.data, error.response.status)
      if (error.response.status === 401) {
        import('@/stores/auth').then(({ useAuthStore }) => {
          const authStore = useAuthStore()
          authStore.logout()
          // ponytail: router.push('/login') goes here when the router guard layer exists
        })
      }
      return Promise.reject(apiError)
    }
    return Promise.reject({
      message: 'Error de conexión',
      status: 0,
      fieldErrors: []
    })
  }
)

export default http
