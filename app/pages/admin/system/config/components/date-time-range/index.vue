<script setup lang="ts">
defineOptions({
  name: 'DateTimeRangeConfigItem',
});

const model = defineModel<string[]>('value');

const begin = computed({
  get: () => model.value?.[0] || '',
  set: (val: string) => {
    const arr = [...(model.value || [])];
    arr[0] = val;
    model.value = arr;
  },
});

const end = computed({
  get: () => model.value?.[1] || '',
  set: (val: string) => {
    const arr = [...(model.value || [])];
    arr[1] = val;
    model.value = arr;
  },
});
</script>

<template>
  <div>
    <UInput
      v-model="begin"
      type="datetime-local"
      class="min-w-56"
      @update:model-value="begin = formatDateTime($event as string)"
    />

    <UInput
      v-model="end"
      type="datetime-local"
      class="min-w-56"
      @update:model-value="end = formatDateTime($event as string)"
    />
  </div>
</template>
