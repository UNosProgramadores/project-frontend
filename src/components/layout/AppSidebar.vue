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
  width: 220px;
  min-width: 220px;
  background: #16213e;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.sidebar-link {
  display: block;
  padding: 0.7rem 1.25rem;
  color: #ccc;
  text-decoration: none;
  font-size: 0.9rem;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.sidebar-link.router-link-active {
  background: rgba(233, 69, 96, 0.12);
  border-left-color: #e94560;
  color: #fff;
  font-weight: 500;
}
</style>
