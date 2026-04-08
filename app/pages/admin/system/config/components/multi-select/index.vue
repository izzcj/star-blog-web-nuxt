<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'MultiSelectConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<string[]>('value');

const { label, dataSourceType, dataSourceConfig } = props;
</script>

<template>
  <VenusSelect
    v-model="model"
    :option-type="dataSourceType"
    :option-key="dataSourceConfig"
    :placeholder="`请选择${label}`"
    :multiple="true"
  />
</template>
