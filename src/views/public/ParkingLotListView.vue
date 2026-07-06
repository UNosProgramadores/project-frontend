<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllParkingLots } from '@/api/parkingLots'

const router = useRouter()

const lots = ref([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const res = await getAllParkingLots()
    lots.value = res.data
  } catch (err) {
    errorMessage.value = err.message || 'Error al cargar los parqueaderos'
  } finally {
    loading.value = false
  }
})

function goToMap(id) {
  router.push({ name: 'parking-map', params: { parkingLotId: id } })
}
</script>

<template>
  <div class="parking-list">
    <h2>Parqueaderos disponibles</h2>

    <div v-if="loading" class="status">Cargando...</div>
    <div v-else-if="errorMessage" class="status error">{{ errorMessage }}</div>
    <div v-else-if="lots.length === 0" class="status">No hay parqueaderos registrados</div>

    <div v-else class="cards">
      <div
        v-for="lot in lots"
        :key="lot.id"
        class="card"
        @click="goToMap(lot.id)"
      >
        <h3>{{ lot.name }}</h3>
        <p>{{ lot.address }}</p>
        <p v-if="lot.openingTime && lot.closingTime" class="hours">
          {{ lot.openingTime }} – {{ lot.closingTime }}
        </p>
        <p v-if="lot.discountsEnabled" class="badge">Descuentos disponibles</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.parking-list { max-width: 720px; margin: 0 auto; padding: 1rem; }
.cards { display: flex; flex-direction: column; gap: 1rem; }
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.card h3 { margin: 0 0 0.25rem; }
.card p { margin: 0.25rem 0; color: #555; }
.hours { font-size: 0.9em; color: #777; }
.badge {
  display: inline-block;
  background: #e7f3ff;
  color: #0066cc;
  font-size: 0.8em;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}
.status { padding: 2rem 0; text-align: center; color: #777; }
.error { color: #c00; }
</style>
