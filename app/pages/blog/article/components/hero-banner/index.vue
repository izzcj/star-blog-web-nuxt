<script setup lang="ts">
import { systemConfigFetchApis } from '~/apis/system/system-config';

const props = withDefaults(defineProps<Props>(), {
  totalArticles: 0,
});

interface Props {
  totalArticles?: number
}

const bannerImage = ref<string>('');
const loading = ref(false);
const mouseInside = ref(false);
const parallax = ref();
const container = ref(null);
const titleVisible = ref(false);

const imageStyle = computed(() => {
  if (!mouseInside.value || !parallax.value) {
    return { transform: 'translate3d(0, 0, 0) scale(1.1)' };
  }
  const x = parallax.value.tilt * 100;
  const y = parallax.value.roll * 100;
  return { transform: `translate3d(${x}px, ${y}px, 0) scale(1.2)` };
});

function onMouseEnter() {
  mouseInside.value = true;
  if (!parallax.value) {
    parallax.value = useParallax(container);
  }
}

function onMouseLeave() {
  mouseInside.value = false;
}

loading.value = true;
try {
  const res = await systemConfigFetchApis().fetchOne({ params: { key: 'hero-banner-cover' } });
  if (res.data.value) {
    bannerImage.value = res.data.value.value as string;
  }
} catch (error) {
  console.error('加载横幅图片配置失败:', error);
} finally {
  loading.value = false;
  // 延迟触发标题动画
  setTimeout(() => {
    titleVisible.value = true;
  }, 100);
}
</script>

<template>
  <!-- 加载骨架 -->
  <div
    v-if="loading"
    class="relative h-80 md:h-105 lg:h-130 w-full rounded-2xl md:rounded-3xl overflow-hidden"
  >
    <div class="absolute inset-0 animate-shimmer-mint" />
    <!-- 骨架内容区 -->
    <div class="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
      <div class="space-y-3">
        <div class="h-4 w-24 animate-skeleton rounded-full" />
        <div class="h-9 w-3/5 animate-skeleton rounded-xl" />
        <div class="h-5 w-2/5 animate-skeleton rounded-lg" />
      </div>
    </div>
  </div>

  <!-- 横幅展示 -->
  <div
    v-else-if="!loading && bannerImage"
    ref="container"
    class="relative h-80 md:h-105 lg:h-130 w-full rounded-2xl md:rounded-3xl overflow-hidden cursor-default contain-layout"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 背景图片（视差层） -->
    <div
      class="absolute inset-0 transition-transform duration-700 ease-out"
      :style="imageStyle"
    >
      <VenusImage
        :src="bannerImage"
        alt="Hero Banner"
        class="w-full h-full img-optimize"
      />
    </div>

    <!-- 渐变遮罩层 -->
    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

    <!-- 左侧边缘微光 -->
    <div class="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-transparent via-mint-400/40 to-transparent" />

    <!-- 内容叠加层 -->
    <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
      <!-- 装饰标签 -->
      <div
        class="mb-4 transition-all duration-700 delay-0"
        :class="titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium read-badge">
          <span class="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
          技术博客
        </span>
      </div>

      <!-- 博客标题 -->
      <h1
        class="text-white font-bold leading-tight tracking-tight transition-all duration-700 delay-80 text-shadow-banner text-3xl md:text-4xl lg:text-5xl"
        :class="[
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        ]"
      >
        探索 · 分享 · 成长
      </h1>

      <!-- 描述文字 -->
      <p
        class="mt-2 text-white/75 text-sm md:text-base transition-all duration-700 delay-160"
        :class="titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        记录技术旅程，分享编程心得
      </p>

      <!-- 统计数据 -->
      <div
        class="mt-6 flex items-center gap-3 md:gap-4 transition-all duration-700 delay-240"
        :class="titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl read-badge text-sm">
          <UIcon
            name="lucide:file-text"
            color="#5eead4"
          />
          <span class="text-white/90 font-medium">{{ props.totalArticles > 0 ? `${props.totalArticles} 篇文章` : '探索文章' }}</span>
        </div>
      </div>
    </div>

    <!-- 右下角装饰圆点 -->
    <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex gap-2 opacity-60">
      <div class="w-2 h-2 rounded-full bg-mint-400" />
      <div class="w-2 h-2 rounded-full bg-white/60" />
      <div class="w-2 h-2 rounded-full bg-white/40" />
    </div>
  </div>

  <!-- 无图时的极光渐变横幅 -->
  <div
    v-else-if="!loading && !bannerImage"
    class="relative h-80 md:h-105 lg:h-130 w-full rounded-2xl md:rounded-3xl overflow-hidden"
  >
    <!-- 极光渐变背景 -->
    <div class="absolute inset-0 banner-aurora-gradient" />
    <!-- 光晕装饰 -->
    <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl glow-radial-mint" />
    <div class="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl glow-radial-lime" />

    <div class="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium read-badge w-fit mb-4">
        <span class="w-1.5 h-1.5 rounded-full bg-mint-300 animate-pulse" />
        技术博客
      </span>
      <h1 class="text-white font-bold text-3xl md:text-4xl lg:text-5xl leading-tight tracking-tight text-shadow-banner-light">
        探索 · 分享 · 成长
      </h1>
      <p class="mt-2 text-white/75 text-sm md:text-base">
        记录技术旅程，分享编程心得
      </p>
      <div class="mt-6 flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl read-badge text-sm">
          <UIcon
            name="lucide:file-text"
            color="#5eead4"
          />
          <span class="text-white/90 font-medium">探索文章</span>
        </div>
      </div>
    </div>

    <!-- 装饰圆点 -->
    <div class="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex gap-2 opacity-60">
      <div class="w-2 h-2 rounded-full bg-mint-300" />
      <div class="w-2 h-2 rounded-full bg-white/60" />
      <div class="w-2 h-2 rounded-full bg-white/40" />
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
