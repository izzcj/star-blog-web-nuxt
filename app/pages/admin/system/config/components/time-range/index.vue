<script setup lang="ts">
defineOptions({
  name: 'TimeRangeConfigItem',
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
      type="time"
      class="min-w-56"
    />

    <UInput
      v-model="end"
      type="time"
      class="min-w-56"
    />
  </div>
</template>
