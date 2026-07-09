<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const role = computed(() => authStore.role)

const adminLinks = [
  { to: '/admin/config', label: 'Configuración' },
  { to: '/admin/rates', label: 'Tarifas' },
  { to: '/admin/discounts', label: 'Descuentos' },
  { to: '/admin/staff', label: 'Personal' },
  { to: '/admin/reports', label: 'Reportes' },
  { to: '/staff/entry-exit', label: 'Entrada/Salida' },
  { to: '/staff/invoices', label: 'Facturas' },
]

const staffLinks = [
  { to: '/staff/entry-exit', label: 'Entrada/Salida' },
  { to: '/staff/invoices', label: 'Facturas' },
]

const customerLinks = [
  { to: '/customer/vehicles', label: 'Mis Vehículos' },
]

const links = computed(() => {
  if (role.value === 'admin') return adminLinks
  if (role.value === 'staff') return staffLinks
  if (role.value === 'customer') return customerLinks
  return []
})
</script>

<template>
  <aside v-if="authStore.isAuthenticated" class="sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="sidebar-link"
      >
        {{ link.label }}
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--color-primary-900);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: sticky;
  top: var(--topbar-height);
  height: calc(100vh - var(--topbar-height));
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.sidebar-link {
  display: block;
  padding: 0.7rem 1.25rem;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.9rem;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-inverse);
}

.sidebar-link.router-link-active {
  background: rgba(28, 110, 164, 0.25);
  border-left-color: var(--color-primary-700);
  color: var(--color-text-inverse);
  font-weight: 500;
}
</style>
