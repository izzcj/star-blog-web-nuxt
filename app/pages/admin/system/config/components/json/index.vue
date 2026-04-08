<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

defineOptions({
  name: 'JsonConfigItem',
});

const model = defineModel<string>('value');
const AsyncMonacoEditor = defineAsyncComponent(() => import('~/components/venus-monaco-editor/index.vue'));
</script>

<template>
  <AsyncMonacoEditor
    v-model="model"
    :height="300"
    language="json"
  />
</template>
