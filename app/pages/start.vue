<script setup lang="ts">
import { animate } from 'animejs';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import CommonRouterPath from '@/enums/common-router-path';
import { systemConfigFetchApis } from '~/apis/system/system-config';

definePageMeta({
  layout: 'none',
});

// ---- 状态 ----
const { data: startBgConfig } = await systemConfigFetchApis().fetchOne({
  params: { key: 'start-page-bg' },
});

const bgUrl = computed(() => (startBgConfig.value?.value as string | undefined) ?? '');
const searchText = ref('');
const isFocused = ref(false);
const searchEngine = ref<'google' | 'bing' | 'baidu'>('baidu');
const searchInputRef = ref<HTMLInputElement | null>(null);

// ---- 实时时钟 ----
const now = ref(new Date());
const timeStr = computed(() => format(now.value, 'HH:mm:ss'));
const dateStr = computed(() => format(now.value, 'M月d日 EEEE', { locale: zhCN }));

useIntervalFn(() => {
  now.value = new Date();
}, 1000);

// ---- 搜索引擎配置 ----
const engines = [
  { key: 'baidu', label: '百度', url: 'https://www.baidu.com/s?wd=' },
  { key: 'google', label: 'Google', url: 'https://www.google.com/search?q=' },
  { key: 'bing', label: 'Bing', url: 'https://www.bing.com/search?q=' },
] as const;

const currentEngine = computed(() => engines.find(e => e.key === searchEngine.value)!);

/**
 * 处理搜索
 */
function handleSearch() {
  const query = searchText.value.trim();
  if (!query) {
    return;
  }
  window.open(currentEngine.value.url + encodeURIComponent(query), '_blank');
}

/**
 * 处理键盘事件
 *
 * @param e 键盘事件
 */
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSearch();
  }
}

/**
 * 搜索框聚焦事件
 */
function onFocus() {
  isFocused.value = true;
  animate('.search-wrapper', {
    scale: [1, 1.05],
    duration: 350,
    ease: 'easeOutCubic',
  });
  animate('.bg-wrapper', {
    scale: [1, 1.08],
    duration: 350,
    ease: 'easeOutCubic',
  });
}

/**
 * 搜索框失焦事件
 */
function onBlur() {
  isFocused.value = false;
  animate('.search-wrapper', {
    scale: [1.05, 1],
    duration: 350,
    ease: 'easeOutCubic',
  });
  animate('.bg-wrapper', {
    scale: [1.08, 1],
    duration: 350,
    ease: 'easeOutCubic',
  });
}

/**
 * 入场动画
 */
function playEntrance() {
  animate('.clock-display', {
    opacity: [0, 1],
    translateY: [30, 0],
    duration: 800,
    ease: 'easeOutExpo',
  });
  animate('.search-card', {
    opacity: [0, 1],
    translateY: [40, 0],
    duration: 800,
    delay: 150,
    ease: 'easeOutExpo',
  });
  animate('.hint-text', {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 800,
    delay: 350,
    ease: 'easeOutExpo',
  });
}

onMounted(() => {
  nextTick(playEntrance);
});
</script>

<template>
  <!-- 起始页根容器 -->
  <div class="fixed inset-0 flex items-center justify-center overflow-hidden">
    <!-- 背景图层：无图时显示深色底，图片加载后淡入 -->
    <div class="bg-wrapper absolute inset-0 z-0 bg-[#0f1117] overflow-hidden">
      <Transition
        enter-active-class="transition-opacity duration-700 ease-in motion-reduce:duration-150"
        enter-from-class="opacity-0"
      >
        <VenusImage
          v-if="bgUrl"
          :src="bgUrl"
          fit="cover"
          alt="起始页背景"
          class="size-full img-optimize"
        />
      </Transition>
    </div>

    <!-- 模糊蒙版：聚焦时淡入 -->
    <Transition
      enter-active-class="transition-opacity duration-[450ms] ease-in-out motion-reduce:duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-[450ms] ease-in-out motion-reduce:duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isFocused"
        class="absolute inset-0 backdrop-blur-md bg-black/35 z-1"
      />
    </Transition>

    <!-- 雪花背景 -->
    <SnowfallBg
      class="absolute inset-0 w-full h-full pointer-events-none z-20"
      :min-radius="0.2"
      :quantity="200"
      :max-radius="5"
      :speed="0.5"
    />

    <!-- 中央内容 -->
    <div class="relative z-10 flex flex-col items-center gap-4 w-full px-4">
      <!-- 实时时钟 -->
      <div class="clock-display flex flex-col items-center select-none mb-2">
        <time
          class="text-white/90 text-7xl font-extralight tracking-widest tabular-nums
          drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]
          max-[480px]:text-5xl"
          :datetime="now.toISOString()"
        >
          {{ timeStr }}
        </time>
        <span
          class="text-white/50 text-base font-light tracking-wide mt-1
          max-[480px]:text-sm"
        >
          {{ dateStr }}
        </span>
      </div>

      <!-- 搜索卡片（玻璃态） -->
      <div
        class="search-card w-full max-w-170 bg-white/10 backdrop-blur-[20px] border border-white/20
        rounded-[20px] pt-5 px-6 pb-6 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.12)_inset]
        max-[480px]:pt-4 max-[480px]:px-4 max-[480px]:pb-5 max-[480px]:rounded-2xl"
      >
        <!-- 搜索引擎选项卡 -->
        <div class="flex gap-1.5 mb-4">
          <button
            v-for="e of engines"
            :key="e.key"
            class="px-3.5 py-1.25 rounded-full border text-[13px] cursor-pointer transition-[background,color,border-color] duration-200"
            :class="searchEngine === e.key
              ? 'bg-white/22 border-white/45 text-white font-semibold'
              : 'bg-transparent border-white/15 text-white/55 hover:bg-white/12 hover:text-white/90'"
            @click="searchEngine = e.key as typeof searchEngine"
          >
            {{ e.label }}
          </button>
        </div>

        <!-- 搜索框包装器（anime.js scale 动画目标） -->
        <div class="search-wrapper will-change-transform origin-center">
          <div
            class="flex items-center gap-2.5 rounded-[14px] px-3.5 h-14 border-[1.5px] transition-[background,border-color,box-shadow]
            duration-300 motion-reduce:transition-none max-[480px]:h-12.5 max-[480px]:px-3"
            :class="isFocused
              ? 'bg-white/20 border-white/55 shadow-[0_0_0_3px_rgba(255,255,255,0.10),0_4px_20px_rgba(0,0,0,0.25)]'
              : 'bg-white/12 border-white/20'"
          >
            <!-- 搜索图标 -->
            <svg
              class="w-5 h-5 text-white/60 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke-linecap="round"
              />
            </svg>

            <!-- 输入框 -->
            <input
              ref="searchInputRef"
              v-model="searchText"
              class="flex-1 bg-transparent border-none outline-none text-white text-base tracking-[0.01em]
              caret-white/80 placeholder:text-white/38 max-[480px]:text-[15px]"
              type="text"
              :placeholder="`使用 ${currentEngine.label} 搜索…`"
              autocomplete="off"
              @focus="onFocus"
              @blur="onBlur"
              @keydown="handleKeydown"
            >

            <!-- 清除按钮 -->
            <button
              v-if="searchText"
              class="flex items-center justify-center w-7 h-7 bg-white/10 rounded-full cursor-pointer
              text-white/60 shrink-0 transition-[background,color] duration-200 hover:bg-white/22 hover:text-white"
              aria-label="清除"
              @click="searchText = ''; searchInputRef?.focus()"
            >
              <svg
                class="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <!-- 搜索按钮 -->
            <button
              class="flex items-center justify-center w-9 h-9 bg-white/18 rounded-[10px] cursor-pointer
              text-white shrink-0 transition-[background,transform] duration-200 hover:bg-white/32
              hover:translate-x-0.5 active:translate-x-0 active:scale-95"
              aria-label="搜索"
              @click="handleSearch"
            >
              <svg
                class="w-4.5 h-4.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 提示文字 -->
      <p class="hint-text text-white/38 text-[13px] text-center select-none">
        按 Enter 或点击箭头开始搜索
      </p>

      <!-- 进入首页按钮 -->
      <button
        class="hint-text mt-2 px-5 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm
        text-white/70 text-sm cursor-pointer transition-[background,color,border-color] duration-200
        hover:bg-white/22 hover:text-white hover:border-white/40"
        @click="navigateTo(CommonRouterPath.HOME)"
      >
        进入首页
      </button>
    </div>
  </div>
</template>
