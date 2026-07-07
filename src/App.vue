<script setup>
import AppTopBar from '@/components/layout/AppTopBar.vue'
</script>

<template>
  <AppTopBar />
  <main class="main-content">
    <router-view />
  </main>
</template>

<style>
body {
  margin: 0;
}
.main-content {
  padding-top: 64px;
}
</style>
