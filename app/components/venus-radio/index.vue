<script setup lang="ts">
import { venusRadioProps } from './props';
import { useLoadDataOptions } from '~/composables/use-data-options';

const props = defineProps({
  ...venusRadioProps,
});

const model = defineModel<string | number | boolean | null>();

const optionType = computed(() => props.optionType);
const optionKey = computed(() => props.optionKey);
const { data: options } = useLoadDataOptions(optionType, optionKey);

const radioItems = computed(() => {
  return (options.value || []).map((option: any) => ({
    label: option.label,
    value: option.value,
    disabled: option.disabled || props.disabled,
  }));
});

// 自动选中第一个选项
watch(radioItems, (items) => {
  if (props.autoFirst && model.value == null && items.length > 0) {
    model.value = items[0]?.value;
  }
}, { immediate: true });
</script>

<template>
  <URadioGroup
    v-model="model"
    :items="radioItems"
    :disabled="props.disabled"
  />
</template>
