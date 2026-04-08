<script setup lang="ts">
import { configItemProps } from '../base-props';

defineOptions({
  name: 'DateConfigItem',
});

const props = defineProps({
  ...configItemProps,
});

const emit = defineEmits<{
  (e: 'update:value', value?: any): void
}>();

const model = useVModel(props, 'value', emit);
const inputDate = useTemplateRef('inputDate');
</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="model"
  >
    <template #trailing>
      <UPopover :reference="inputDate?.inputsRef[3]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="lucide:calendar"
          aria-label="Select a date"
          class="px-0"
        />
        <template #content>
          <UCalendar
            v-model="model"
            class="p-2"
          />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
