<script setup>
import AppTopBar from '@/components/layout/AppTopBar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <AppTopBar />
  <div class="app-layout">
    <AppSidebar v-if="authStore.isAuthenticated" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg-subtle);
}
.app-layout {
  display: flex;
  min-height: calc(100vh - 56px);
  margin-top: 56px;
}
.main-content {
  flex: 1;
  padding: 1.25rem;
}
</style>
