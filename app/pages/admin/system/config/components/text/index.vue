<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'TextConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<string>('value');
</script>

<template>
  <UInput
    v-model="model"
    :placeholder="`请输入${props.label}`"
  />
</template>
