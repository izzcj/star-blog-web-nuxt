<script setup lang="ts">
import type { DefineComponent } from 'vue';
import { configItemProps } from './base-props';

const props = defineProps({
  ...configItemProps,
});

const emit = defineEmits<{
  (e: 'update:value', value?: any): void
}>();

const componentName = upperFirst(camelCase(props.type));

const configItemModules: Recordable<Recordable<DefineComponent>> = import.meta.glob('./*/index.vue', {
  eager: true,
});

const componentMap = keys(configItemModules).reduce((map, key) => {
  for (const value of values(configItemModules[key])) {
    if (value.name) {
      map.set(value.name, value);
    }
  }

  return map;
}, new Map<string, DefineComponent>());

const component = componentMap.get(`${componentName}ConfigItem`) as Component;

const modelValue = computed({
  get: () => props.value,
  set: (val) => emit('update:value', val),
});
</script>

<template>
  <component
    :is="component"
    v-if="component"
    v-bind="props"
    v-model:value="modelValue"
  />
  <div
    v-else
    class="text-red-500 p-2 border border-dashed border-gray-300"
  >
    未知的配置项类型: {{ props.type }}
  </div>
</template>
