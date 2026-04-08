<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'DateTimeConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const emit = defineEmits<{
  (e: 'update:value', value?: any): void
}>();

const model = useVModel(props, 'value', emit);
</script>

<template>
  <UInput
    v-model="model"
    type="datetime-local"
    class="min-w-56"
    @update:model-value="model = formatDateTime($event as string)"
  />
</template>
