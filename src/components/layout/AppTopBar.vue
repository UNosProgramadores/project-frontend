<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import logoIcon from '@/assets/logo-icon.png'

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
      <img :src="logoIcon" alt="ParKing" class="topbar-logo" />
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
  height: var(--topbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  background: var(--color-primary-950);
  color: var(--color-text-inverse);
  z-index: 1000;
  box-shadow: var(--shadow-sm);
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--color-text-inverse);
}

.topbar-logo {
  height: 34px;
  width: auto;
  display: block;
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
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.topbar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-inverse);
}

.topbar-link--primary {
  background: var(--color-accent-500);
  color: var(--color-primary-950);
}

.topbar-link--primary:hover {
  background: var(--color-accent-600);
}

.topbar-link--logout {
  color: #ffb4a8;
}

.topbar-link--logout:hover {
  background: rgba(224, 71, 58, 0.18);
  color: #ffb4a8;
}

.topbar-user {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--color-text-inverse);
}

.topbar-role {
  display: inline-block;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.14);
  color: var(--color-text-inverse);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 500;
}
</style>
