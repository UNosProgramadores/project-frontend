<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, default: null },
  editable: { type: Boolean, default: false },
  selectable: { type: Boolean, default: false }
})

const emit = defineEmits(['cell-click'])

const icons = { car: '🚗', motorcycle: '🏍️', bicycle: '🚲' }

const colors = computed(() => {
  if (!props.cell || props.cell.cellType === 'transit') return {}
  const vt = props.cell.vehicleTypeName
  const occupied = props.cell.status === 'occupied'
  const palette = {
    car:        { suave: '#e3f2fd', medio: '#90caf9' },
    motorcycle: { suave: '#e8f5e9', medio: '#a5d6a7' },
    bicycle:    { suave: '#fff3e0', medio: '#ffcc80' }
  }
  const p = palette[vt]
  return p
    ? { bg: occupied ? p.medio : p.suave, text: '#333' }
    : { bg: '#f5f5f5', text: '#333' }
})
</script>

<template>
  <div v-if="!cell" class="cell empty" />

  <div
    v-else
    class="cell"
    :class="[
      cell.cellType === 'transit' ? 'transit' : 'parking',
      cell.status === 'occupied' ? 'occupied' : '',
      cell.reservedForStaff ? 'staff' : '',
      editable || selectable ? 'clickable' : '',
      selectable ? 'selectable' : ''
    ]"
    :style="cell.cellType !== 'transit' ? { background: colors.bg, color: colors.text } : {}"
    :title="`${cell.code}${cell.reservedForStaff ? ' (staff)' : ''}`"
    @click="(editable || selectable) && emit('cell-click', cell)"
  >
    <span class="icon">{{ cell.status === 'occupied' ? (icons[cell.vehicleTypeName] || '') : (cell.vehicleTypeName || '—') }}</span>
    <span class="code" :style="cell.cellType !== 'transit' ? { color: colors.text } : {}">{{ cell.code }}</span>
    <span v-if="cell.reservedForStaff" class="staff-badge">S</span>
  </div>
</template>

<style scoped>
.cell {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  position: relative;
  min-width: 0;
  overflow: hidden;
  box-sizing: border-box;
  gap: 1px;
}
.cell.empty {
  background: transparent;
  border: none;
}
.cell.parking {
  border: 1px solid #888;
}
.cell.parking.occupied {
  border-color: #111;
}
.cell.transit {
  background: #e0e0e0;
  border: 1px dashed #9e9e9e;
}
.cell.staff {
  border-width: 2px;
  border-color: #f57f17;
}
.cell.clickable {
  cursor: pointer;
}
.cell.clickable:hover {
  box-shadow: 0 0 0 2px #3498db;
}
.cell.selectable {
  box-shadow: 0 0 0 2px #27ae60;
}
.cell.selectable:hover {
  box-shadow: 0 0 0 3px #1e8449;
}
.code {
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1;
}
.staff-badge {
  position: absolute;
  top: 1px;
  right: 1px;
  background: #f57f17;
  color: #fff;
  border-radius: 2px;
  font-size: 0.5rem;
  padding: 0 2px;
  line-height: 1.2;
}
</style>
