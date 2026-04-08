<script setup lang="ts">
import { venusCheckboxProps } from './props';
import { useLoadDataOptions } from '~/composables/use-data-options';

const props = defineProps({
  ...venusCheckboxProps,
});

const model = defineModel<(string | number)[]>({ default: () => [] });

const optionType = computed(() => props.optionType);
const optionKey = computed(() => props.optionKey);
const { data: options } = useLoadDataOptions(optionType, optionKey);

const checkboxItems = computed(() => {
  return (options.value || []).map((option: any) => ({
    label: option.label,
    value: option.value,
    disabled: option.disabled || props.disabled,
  }));
});
</script>

<template>
  <UCheckboxGroup
    v-model="model"
    :items="checkboxItems"
    :disabled="props.disabled"
  />
</template>
