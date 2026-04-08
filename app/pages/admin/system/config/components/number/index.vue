<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'NumberConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<number>('value');

const { label } = props;
</script>

<template>
  <UInputNumber
    v-model="model"
    :placeholder="`请输入${label}`"
  />
</template>
