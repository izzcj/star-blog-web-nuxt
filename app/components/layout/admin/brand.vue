<script setup lang="ts">
const props = defineProps<{
  collapsed?: boolean
}>();

const runtimeConfig = useRuntimeConfig();

const title = computed(() => {
  return runtimeConfig.public.appTitle?.trim() || 'Star Blog';
});
</script>

<template>
  <NuxtLink
    to="/admin"
    class="flex items-center rounded-xl transition hover:bg-primary/8"
    :class="props.collapsed ? 'justify-center p-1' : 'gap-3 overflow-hidden px-2 py-2'"
  >
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
      <UIcon
        name="lucide:layout-dashboard"
        class="h-5 w-5"
      />
    </div>

    <div
      v-if="!props.collapsed"
      class="min-w-0"
    >
      <p class="truncate text-sm font-semibold text-highlighted">
        {{ title }}
      </p>
      <p class="truncate text-xs text-muted">
        管理后台
      </p>
    </div>
  </NuxtLink>
</template>
