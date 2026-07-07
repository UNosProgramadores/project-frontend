<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const roleLabels = { admin: 'Admin', staff: 'Staff', customer: 'Cliente' }

function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <router-link to="/" class="topbar-brand">
      <span class="topbar-logo">P</span>
      <span class="topbar-title">ParKing</span>
    </router-link>

    <nav class="topbar-nav">
      <template v-if="!authStore.isAuthenticated">
        <router-link to="/login" class="topbar-link">Iniciar sesión</router-link>
        <router-link to="/register" class="topbar-link topbar-link--primary">Registrarse</router-link>
      </template>
      <template v-else>
        <span class="topbar-user">{{ authStore.user.username }}</span>
        <span class="topbar-role">{{ roleLabels[authStore.user.role] || authStore.user.role }}</span>
        <button class="topbar-link topbar-link--logout" @click="handleLogout">Cerrar sesión</button>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  background: #1a1a2e;
  color: #eee;
  z-index: 1000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: #eee;
}

.topbar-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e94560;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
}

.topbar-title {
  font-weight: 600;
  font-size: 1.15rem;
  letter-spacing: 0.02em;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-link {
  color: #ccc;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.topbar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.topbar-link--primary {
  background: #e94560;
  color: #fff;
}

.topbar-link--primary:hover {
  background: #d63851;
}

.topbar-link--logout {
  color: #f4878c;
}

.topbar-link--logout:hover {
  background: rgba(233, 69, 96, 0.15);
  color: #f4878c;
}

.topbar-user {
  font-weight: 500;
  font-size: 0.9rem;
}

.topbar-role {
  display: inline-block;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.12);
  color: #ccc;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 500;
}
</style>
