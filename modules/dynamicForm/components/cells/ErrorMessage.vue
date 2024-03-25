<template>
  <span class="error-message" v-if="message">
    {{ message }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ message?: string }>()
const message = computed<string>(() => props.message || '')
</script>

<style lang="scss">
.error-message {
  font-size: smaller;
  color: var(--red-600);
}
</style>
