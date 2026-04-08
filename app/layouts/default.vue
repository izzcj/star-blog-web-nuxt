<script setup lang="ts">
import { systemConfigFetchApis } from '~/apis/system/system-config';

const appStatusStore = useAppStatusStore();
const visibilityHeight = ref(200);

const { data: webBgConfig } = await systemConfigFetchApis().fetchOne({
  params: { key: 'web-bg' },
});

const webBg = computed(() => (webBgConfig.value?.value as string | undefined) ?? '');

let loadTimer: ReturnType<typeof setTimeout> | null = null;
let bgLoadFallbackTimer: ReturnType<typeof setTimeout> | null = null;
let currentLoadToken = 0;

/**
 * 完成加载
 */
function finishLoading() {
  if (appStatusStore.resourceLoadStatus) {
    return;
  }

  if (loadTimer) {
    clearTimeout(loadTimer);
  }

  loadTimer = setTimeout(() => {
    appStatusStore.setResourceLoadStatus(true);
    loadTimer = null;
  }, 1500);
}

/**
 * 重置加载状态
 */
function resetLoading() {
  appStatusStore.setResourceLoadStatus(false);
}

/**
 * 清理背景加载兜底定时器
 */
function clearBgLoadFallbackTimer() {
  if (!bgLoadFallbackTimer) {
    return;
  }

  clearTimeout(bgLoadFallbackTimer);
  bgLoadFallbackTimer = null;
}

/**
 * 主动预加载背景图，避免从其他布局返回时漏掉组件的 load/error 事件
 */
function preloadBackground(src: string) {
  if (!import.meta.client) {
    finishLoading();
    return;
  }

  const loadToken = ++currentLoadToken;
  const image = new Image();

  const resolveLoad = () => {
    if (loadToken !== currentLoadToken) {
      return;
    }

    clearBgLoadFallbackTimer();
    finishLoading();
  };

  clearBgLoadFallbackTimer();
  bgLoadFallbackTimer = setTimeout(resolveLoad, 2500);

  image.onload = resolveLoad;
  image.onerror = resolveLoad;
  image.src = src;

  if (image.complete) {
    resolveLoad();
  }
}

/**
 * 更新可视高度
 */
function updateVisibilityHeight() {
  visibilityHeight.value = window.innerHeight * 0.4;
}

watch(webBg, (value) => {
  resetLoading();

  if (!value) {
    finishLoading();
    return;
  }

  preloadBackground(value);
}, { immediate: true });

onMounted(() => {
  updateVisibilityHeight();
  window.addEventListener('resize', updateVisibilityHeight);
});

onBeforeUnmount(() => {
  if (loadTimer) {
    clearTimeout(loadTimer);
  }

  clearBgLoadFallbackTimer();
  window.removeEventListener('resize', updateVisibilityHeight);
});
</script>

<template>
  <div class="relative min-h-dvh w-full">
    <Loading />

    <VenusImage
      v-if="webBg"
      :src="webBg"
      class="fixed! inset-0 -z-10 h-dvh w-dvw object-cover pointer-events-none"
      fit="cover"
      alt="网站背景图"
    />

    <LayoutDefaultHeader />

    <UMain class="relative">
      <slot />
    </UMain>

    <VenusBackTop
      :bottom="100"
      :visibility-height="visibilityHeight"
    />

    <USeparator class="h-px" />

    <LayoutDefaultFooter />
  </div>
</template>
