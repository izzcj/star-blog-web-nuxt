<script setup lang="ts">
defineOptions({
  name: 'BooleanConfigItem',
});

const model = defineModel<boolean>('value');
</script>

<template>
  <USwitch
    v-model="model"
    class="cursor-pointer"
  />
</template>
