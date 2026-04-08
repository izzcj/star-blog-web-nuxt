<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'CheckboxConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const model = defineModel<string[]>('value');

const { dataSourceType, dataSourceConfig } = props;
</script>

<template>
  <VenusCheckbox
    v-model="model"
    :option-type="dataSourceType"
    :option-key="dataSourceConfig"
  />
</template>
