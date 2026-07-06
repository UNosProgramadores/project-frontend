<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getParkingLotMap } from '@/api/parkingLots'
import ParkingGrid from '@/components/map/ParkingGrid.vue'

const route = useRoute()
const router = useRouter()

const parkingLotName = ref('')
const rows = ref(0)
const columns = ref(0)
const grid = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  const id = route.params.parkingLotId
  try {
    const res = await getParkingLotMap(id)
    const data = res.data
    parkingLotName.value = data.parkingLotName
    rows.value = data.rows
    columns.value = data.columns
    grid.value = data.grid
  } catch (err) {
    errorMessage.value = err.message || 'Error al cargar el mapa'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="map-view">
    <button class="back-link" @click="router.push({ name: 'home' })">
      ← Volver a la lista
    </button>

    <h2 v-if="!loading && !errorMessage">{{ parkingLotName }}</h2>

    <div v-if="loading" class="status">Cargando mapa...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <ParkingGrid v-else :rows="rows" :columns="columns" :grid="grid" />
  </div>
</template>

<style scoped>
.map-view { max-width: 720px; margin: 0 auto; padding: 1rem; }
.back-link {
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 0.5rem;
}
.back-link:hover { text-decoration: underline; }
.status { padding: 2rem 0; text-align: center; color: #777; }
.error { color: #c00; }
</style>
