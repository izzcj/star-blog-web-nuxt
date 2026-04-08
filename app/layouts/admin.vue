<script setup lang="ts">
const appSettingsStore = useAppSettingsStore();

const loading = ref(true);

let loadingTimer: ReturnType<typeof setTimeout> | undefined;

const asideWidth = computed(() => appSettingsStore.asideWidth);

/**
 * 同步设备状态
 */
function syncDeviceState() {
  if (!import.meta.client) {
    return;
  }

  appSettingsStore.syncDeviceState(window.innerWidth);

  if (appSettingsStore.isMobile) {
    appSettingsStore.setAsideCollapse(true);
  }
}

onMounted(() => {
  syncDeviceState();
  window.addEventListener('resize', syncDeviceState);

  loadingTimer = setTimeout(() => {
    loading.value = false;
  }, 350);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncDeviceState);

  if (loadingTimer) {
    clearTimeout(loadingTimer);
  }
});
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
    <Transition
      name="fade"
      mode="out-in"
    >
      <div
        v-if="loading"
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur dark:bg-neutral-950/80"
      >
        <div class="text-center">
          <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary dark:border-neutral-800" />
          <p class="mt-4 text-sm text-muted">
            正在加载管理页面...
          </p>
        </div>
      </div>

      <div
        v-else
        class="flex h-full w-full overflow-hidden"
      >
        <aside
          class="shrink-0 border-r border-default transition-all duration-300"
          :style="{ width: asideWidth }"
        >
          <LayoutAdminAside />
        </aside>

        <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div class="p-3 pb-0">
            <LayoutAdminNavbar />
          </div>

          <main class="hidden-scrollbar min-h-0 flex-1 overflow-auto p-3">
            <slot />
          </main>
        </div>
      </div>
    </Transition>
  </div>
</template>
