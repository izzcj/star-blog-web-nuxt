<script setup lang="ts">
defineOptions({
  name: 'DateRangeConfigItem',
});

const inputDate = useTemplateRef('inputDate');

const model = defineModel<string[]>('value');

const dateRange = computed({
  get() {
    if (model.value?.length === 2) {
      return {
        start: undefined,
        end: undefined,
      };
    }
    return { start: undefined, end: undefined };
  },
  set(val) {
    if (val?.start && val?.end) {
      model.value = [
        formatDate(val.start),
        formatDate(val.end),
      ];
    } else {
      model.value = [];
    }
  },
});
</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="dateRange"
    range
  >
    <template #trailing>
      <UPopover :reference="inputDate?.inputsRef[0]?.$el">
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          icon="lucide:calendar"
          aria-label="Select a date range"
          class="px-0"
        />

        <template #content>
          <UCalendar
            v-model="dateRange"
            class="p-2"
            :number-of-months="2"
            range
          />
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>
