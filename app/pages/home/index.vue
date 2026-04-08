<script setup lang="ts">
import { systemConfigFetchApis } from '~/apis/system/system-config';
import { animate, stagger } from 'animejs';
import MasterInfo from './components/master-info/index.vue';
import WebsiteStats from './components/website-stats/index.vue';
import LatestActivity from './components/latest-activity/index.vue';
import LatestArticle from './components/latest-article/index.vue';
import HotArticle from './components/hot-article/index.vue';
import CategoryNav from './components/category-nav/index.vue';
import HotTags from './components/hot-tags/index.vue';
import RecommendArticle from './components/recommend-article/index.vue';

// 滚动动画
const { observeElements, scaleInConfig, fadeInLeftConfig, fadeInRightConfig } = useScrollAnimation();

// header 展开状态
const homeHeader = ref(null);
const isExpanded = ref(false);

// 加载标题
const { data: titleConfig } = await systemConfigFetchApis().fetchOne({ params: { key: 'home-title' } });
const title = computed(() => titleConfig.value?.value ?? '夏至未至');

// 加载 motto
const { data: mottoConfig } = await systemConfigFetchApis().fetchOne({ params: { key: 'home-motto' } });
let mottoList: string[] = [];
const currentMottoIndex = ref(0);
const currentMotto = ref(mottoList[currentMottoIndex.value]);

if (mottoConfig.value && mottoConfig.value.value) {
  mottoList = JSON.parse(mottoConfig.value.value) as string[];
  currentMotto.value = mottoList[0];
}

/**
 * 更新 motto
 */
function updateMotto() {
  currentMottoIndex.value++;
  if (currentMottoIndex.value >= mottoList.length) {
    currentMottoIndex.value = 0;
  }
  currentMotto.value = mottoList[currentMottoIndex.value];
}

/**
 * 标题动画
 */
function homeTitleAnime() {
  return animate('.header-title', {
    translateY: [
      { to: 10, duration: 600 },
      { to: -10, duration: 600 },
    ],
    ease: 'easeInOutSine',
    delay: (_, i) => i * 100,
  });
}

/**
 * 标题点击事件
 */
function homeTitleClick() {
  toggleExpand();
}

/**
 * 展开/收起
 */
function toggleExpand() {
  if (!homeHeader.value) {
    return;
  }
  isExpanded.value = !isExpanded.value;
  const distanceToViewportTop = calculateElTopToViewportDistance(homeHeader.value);
  const start = distanceToViewportTop * 0.4;
  const end = distanceToViewportTop;
  if (isExpanded.value) {
    // 展开动画
    animate(homeHeader.value, {
      height: [`${start}px`, `${end}px`],
      ease: 'easeInOutQuad',
      duration: 1000,
    });
    document.body.addEventListener('wheel', preventScroll, { passive: false });
    document.body.addEventListener('touchmove', preventScroll, { passive: false });
  } else {
    // 收起动画
    animate(homeHeader.value, {
      height: [`${end}px`, `${start}px`],
      ease: 'easeInOutQuad',
      duration: 1000,
    });
    document.body.removeEventListener('wheel', preventScroll);
    document.body.removeEventListener('touchmove', preventScroll);
  }
}

/***
 * 阻止滚动
 *
 * @param event 滚轮事件
 */
function preventScroll(event: Event) {
  event.preventDefault();
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
  // 使用setTimeout确保所有子组件都已渲染
  nextTick(() => {
    requestAnimationFrame(() => {
      const configs = [
        {
          selector: '#left-sidebar-col > .fade-children > *',
          config: fadeInLeftConfig,
        },
        {
          selector: '#right-sidebar-col > .fade-children > *',
          config: fadeInRightConfig,
        },
        {
          selector: '#main-col > .fade-children > *',
          config: scaleInConfig,
        },
      ];

      configs.forEach(({ selector, config }) => {
        const elements = document.querySelectorAll(selector);

        if (!elements.length) return;

        observeElements(selector, {
          ...config,
          delay: stagger(100),
        });
      });
    });
  });
}

onMounted(() => {
  initScrollAnimations();
});

onBeforeRouteLeave(() => {
  document.body.removeEventListener('wheel', preventScroll);
  document.body.removeEventListener('touchmove', preventScroll);
});
</script>

<template>
  <div class="w-full">
    <div
      id="home-header"
      ref="homeHeader"
      class="venus-center flex-col relative h-[40dvh] overflow-hidden"
    >
      <div
        class="cursor-pointer text-[#FFFFFFFF] text-[4dvh] font-extrabold mb-5"
        @mouseenter="homeTitleAnime"
        @click="homeTitleClick"
      >
        <span
          v-for="(char, index) of title"
          :key="char + index"
          class="header-title inline-block text-shadow-[2px_2px_4px_rgb(0_0_0/_0.6)]"
        >{{ char }}</span>
      </div>
      <div class="h-[6dvh] text-[#DCDCDCFF] bg-black/50 rounded-xl px-2.5 text-[2dvh] font-semibold flex items-center overflow-hidden">
        <Motto
          v-slot="scope"
          :motto="currentMotto"
          @update-motto="updateMotto"
        >
          <p>
            {{ scope.content }}<span class="border-l-2 border-l-[rgba(255,255,255,0.5)] border-solid ml-0.5 animate-[hideToShow_1.2s_infinite]" />
          </p>
        </Motto>
      </div>

      <div
        id="banner-wave-1"
        class="banner-wave banner-wave--1 absolute inset-x-0 bottom-0 h-[8dvh]"
      />
      <div
        id="banner-wave-2"
        class="banner-wave banner-wave--2 absolute inset-x-0 bottom-0 h-[10dvh]"
      />
    </div>

    <div class="max-w-full min-h-[calc(100dvh-40dvh)] box-border bg-white px-6 py-6 md:px-8 lg:px-12 xl:px-30">
      <div
        class="mx-auto justify-content grid w-full grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] lg:grid-cols-[minmax(240px,5fr)_minmax(0,12fr)_minmax(240px,5fr)] xl:grid-cols-[minmax(220px,4fr)_minmax(0,12fr)_minmax(220px,4fr)]"
      >
        <!-- 左侧栏 -->
        <div
          id="left-sidebar-col"
          class="lg:sticky lg:top-2 lg:h-fit lg:self-start"
        >
          <div class="fade-children custom-scrollbar lg:max-h-screen lg:overflow-y-auto lg:p-1.25">
            <MasterInfo />
            <WebsiteStats />
            <LatestActivity />
          </div>
        </div>

        <!-- 中间主内容区 -->
        <div id="main-col">
          <div class="fade-children w-full lg:p-1.25">
            <LatestArticle />
            <HotArticle />
          </div>
        </div>

        <!-- 右侧栏 -->
        <div id="right-sidebar-col">
          <div class="fade-children custom-scrollbar lg:max-h-screen lg:overflow-y-auto lg:p-1.25">
            <CategoryNav />
            <HotTags />
            <RecommendArticle />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.banner-wave {
  pointer-events: none;
  overflow: hidden;
}

.banner-wave::before {
  content: '';
  position: absolute;
  inset: 0;
  left: calc(-1 * var(--wave-width));
  right: calc(-1 * var(--wave-width));
  background-image: var(--wave-image);
  background-size: auto 100%;
  animation: gradientBG var(--wave-duration) linear infinite;
  will-change: transform;
}

.banner-wave--1 {
  --wave-image: url('@/assets/image/bannerWave1.png');
  --wave-width: 997px;
  --wave-duration: 100s;
}

.banner-wave--2 {
  --wave-image: url('@/assets/image/bannerWave2.png');
  --wave-width: 1009px;
  --wave-duration: 120s;
}
</style>
