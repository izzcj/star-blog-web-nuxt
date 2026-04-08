<script setup lang="ts">
defineOptions({
  name: 'ImageConfigItem',
});

const model = defineModel<string>('value');
</script>

<template>
  <VenusUpload v-model:value="model" />
</template>
