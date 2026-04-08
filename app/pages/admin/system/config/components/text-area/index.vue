<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'TextAreaConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<string>('value');

const { label } = props;
</script>

<template>
  <UTextarea
    v-model="model"
    :rows="4"
    :placeholder="`请输入${label}`"
  />
</template>
