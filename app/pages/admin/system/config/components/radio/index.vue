<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'RadioConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<string | number | boolean>('value');

const { dataSourceType, dataSourceConfig } = props;
</script>

<template>
  <VenusRadio
    v-model="model"
    :option-type="dataSourceType"
    :option-key="dataSourceConfig"
  />
</template>
