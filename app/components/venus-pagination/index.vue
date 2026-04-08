<script setup>
import { venusPaginationProps } from './props.ts';

// ===== props =====
const props = defineProps({
  ...venusPaginationProps,
});

// ===== emits =====
const emit = defineEmits([
  'update:page',
  'update:pageSize',
  'change',
]);

const page = computed({
  get: () => props.page,
  set: (val) => {
    emit('update:page', val);
    emit('change', { page: val, pageSize: props.pageSize });
  },
});

const pageSize = computed({
  get: () => props.pageSize,
  set: (val) => {
    emit('update:pageSize', val);
    emit('change', { page: 1, pageSize: val });
    // 重置页码
    emit('update:page', 1);
  },
});
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <!-- 左侧：每页条数 -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-500">每页</span>

      <USelect
        v-model="pageSize"
        :items="props.pageSizeOptions"
        :portal="true"
        class="w-20"
      />

      <span class="text-sm text-gray-500">条</span>
    </div>

    <!-- 右侧：分页 -->
    <UPagination
      v-model:page="page"
      :total="props.total"
      :size="props.size"
      :items-per-page="pageSize"
      active-variant="subtle"
    />
  </div>
</template>
