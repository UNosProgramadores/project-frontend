<script setup>
import CellTile from './CellTile.vue'

defineProps({
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  grid: { type: Array, required: true }
})
</script>

<template>
  <div
    class="grid"
    :style="{
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`
    }"
  >
    <template v-for="(row, rIdx) in grid" :key="rIdx">
      <CellTile
        v-for="(cell, cIdx) in row"
        :key="`${rIdx}-${cIdx}`"
        :cell="cell"
      />
    </template>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 3px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
