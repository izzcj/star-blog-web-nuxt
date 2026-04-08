<script setup lang="ts">
import { venusSelectProps } from './props';
import { useLoadDataOptions } from '~/composables/use-data-options';

const props = defineProps({
  ...venusSelectProps,
});

const model = defineModel<string | number | boolean | string[] | number[] | null>();

const optionType = computed(() => props.optionType);
const optionKey = computed(() => props.optionKey);
const { data: options } = useLoadDataOptions(optionType, optionKey);

// 将 DataOption 转换为 USelect 需要的格式
const selectItems = computed(() => {
  return (options.value || []).map((option: any) => {
    if ('options' in option && Array.isArray(option.options)) {
      return {
        label: option.label,
        type: 'label' as const,
        children: option.options.map((item: any) => ({
          label: item.label,
          value: item.value,
          disabled: item.disabled,
        })),
      };
    }
    return {
      label: option.label,
      value: option.value,
      disabled: option.disabled,
    };
  });
});
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="selectItems"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :multiple="props.multiple"
    :clear="props.clearable"
    :highlight="false"
    value-key="value"
    class="min-w-37.5"
  />
</template>
