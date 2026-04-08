<script setup lang="ts">
defineOptions({
  name: 'TimeConfigItem',
});

const model = defineModel<string>('value');
</script>

<template>
  <UInput
    v-model="model"
    type="time"
    class="min-w-56"
  />
</template>
