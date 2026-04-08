<script setup lang="ts">
// 目录项接口
interface TocItem {
  id: string
  depth: number
  value: string
}

const props = defineProps<{
  content: string
}>();

// 目录列表
const tocItems = ref<TocItem[]>([]);
// 当前激活的目录项
const activeTocId = ref<string>('');
// IntersectionObserver 实例
let headingObserver: IntersectionObserver | null = null;
// 当前文章标题元素
const headingElements = ref<HTMLElement[]>([]);
// MutationObserver 实例（等待 bytemd 渲染标题）
let mutationObserver: MutationObserver | null = null;
// 阅读进度
const readingProgress = ref(0);
// 目录滚动容器引用
const tocScrollContainer = ref<HTMLElement | null>(null);
// 是否由用户点击触发的滚动（避免点击后被 observer 覆盖）
let isUserClick = false;
let activeHeadingRafId: number | null = null;

const headingTopOffset = 120;
const userClickLockMs = 800;

/**
 * 从 Markdown 内容提取目录
 */
function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = [];
  const withoutCodeBlock = content.replace(/```[\s\S]*?```/g, '');
  const headingRegex = /^(#{1,6})\s+(.*)$/gm;

  let match: RegExpExecArray | null;
  let index = 0;

  for (const line of withoutCodeBlock.split('\n')) {
    if (/^\s*([>\-*+])\s+/.test(line)) {
      continue;
    }

    match = headingRegex.exec(line);
    if (!match) {
      continue;
    }

    toc.push({
      id: `heading-${index++}`,
      depth: match[1]?.length ?? 0,
      value: match[2]?.trim() ?? '',
    });

    headingRegex.lastIndex = 0;
  }

  return toc;
}

/**
 * 跳转到指定标题
 */
function scrollToHeading(id: string) {
  const targetElement = document.getElementById(id);
  if (!targetElement) {
    return;
  }

  isUserClick = true;
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  activeTocId.value = id;
  scrollTocIntoView(id);

  // 平滑滚动结束后恢复 observer 驱动
  setTimeout(() => {
    isUserClick = false;
    queueActiveHeadingSync();
  }, userClickLockMs);
}

/**
 * 将目录列表中的激活项滚动到可视区域
 */
function scrollTocIntoView(id: string) {
  const container = tocScrollContainer.value;
  if (!container) {
    return;
  }

  const activeEl = container.querySelector(`[data-toc-id="${id}"]`) as HTMLElement | null;
  if (!activeEl) {
    return;
  }

  const containerTop = container.scrollTop;
  const containerBottom = containerTop + container.clientHeight;
  const elementTop = activeEl.offsetTop;
  const elementBottom = elementTop + activeEl.offsetHeight;
  const safePadding = 12;

  if (elementTop - safePadding >= containerTop && elementBottom + safePadding <= containerBottom) {
    return;
  }

  const targetTop = elementTop - (container.clientHeight / 2) + (activeEl.offsetHeight / 2);
  container.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: 'smooth',
  });
}

function syncActiveHeading() {
  if (isUserClick || headingElements.value.length === 0) {
    return;
  }

  const passedHeadings = headingElements.value.filter(
    heading => heading.getBoundingClientRect().top <= headingTopOffset,
  );

  const nextActiveHeading = passedHeadings.at(-1) ?? headingElements.value[0];
  const nextActiveId = nextActiveHeading?.id ?? '';

  if (!nextActiveId || nextActiveId === activeTocId.value) {
    return;
  }

  activeTocId.value = nextActiveId;
  scrollTocIntoView(nextActiveId);
}

function queueActiveHeadingSync() {
  if (activeHeadingRafId !== null) {
    cancelAnimationFrame(activeHeadingRafId);
  }

  activeHeadingRafId = window.requestAnimationFrame(() => {
    activeHeadingRafId = null;
    syncActiveHeading();
  });
}

/**
 * 更新阅读进度（基于 window 滚动）
 */
function updateReadingProgress() {
  const articleDetail = document.querySelector('#article-detail');
  const contentWrapper = document.querySelector('.article-content-wrapper');

  if (!articleDetail || !contentWrapper) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;

  const articleRect = articleDetail.getBoundingClientRect();
  const contentRect = contentWrapper.getBoundingClientRect();

  // 文章顶部在文档中的绝对位置
  const articleTopAbs = articleRect.top + scrollTop;
  // 内容底部在文档中的绝对位置
  const contentBottomAbs = contentRect.bottom + scrollTop;

  if (scrollTop + viewportHeight < articleTopAbs) {
    readingProgress.value = 0;
    return;
  }

  if (scrollTop > contentBottomAbs) {
    readingProgress.value = 100;
    return;
  }

  const readStart = articleTopAbs;
  const readEnd = contentBottomAbs - viewportHeight;
  const readDistance = readEnd - readStart;

  if (readDistance <= 0) {
    readingProgress.value = 100;
    return;
  }

  const progress = ((scrollTop - readStart) / readDistance) * 100;
  readingProgress.value = Math.min(Math.max(progress, 0), 100);
}

function handleWindowScroll() {
  updateReadingProgress();
  queueActiveHeadingSync();
}

/**
 * 设置 IntersectionObserver 观察所有标题元素
 */
function observeHeadings() {
  const contentWrapper = document.querySelector('.article-content-wrapper');

  // 清理旧的
  headingObserver?.disconnect();
  headingElements.value = contentWrapper
    ? Array.from(contentWrapper.querySelectorAll('[id^="heading-"]')) as HTMLElement[]
    : [];

  if (headingElements.value.length === 0) {
    return 0;
  }

  headingObserver = new IntersectionObserver(
    () => {
      queueActiveHeadingSync();
    },
    {
      root: null,
      rootMargin: `-${headingTopOffset}px 0px -65% 0px`,
      threshold: [0, 1],
    },
  );

  headingElements.value.forEach(heading => headingObserver!.observe(heading));
  queueActiveHeadingSync();

  return headingElements.value.length;
}

/**
 * 等待 bytemd 渲染完成后再观察标题
 * 使用 MutationObserver 监听 DOM 变化，确保标题已渲染
 */
function waitForHeadingsAndObserve() {
  const contentWrapper = document.querySelector('.article-content-wrapper');
  if (!contentWrapper) {
    return;
  }

  // 先尝试直接观察（可能已经渲染好了）
  if (observeHeadings() > 0) {
    return;
  }

  // 标题还没渲染，用 MutationObserver 等待
  mutationObserver?.disconnect();
  mutationObserver = new MutationObserver(() => {
    const count = observeHeadings();
    if (count > 0) {
      mutationObserver?.disconnect();
      mutationObserver = null;
    }
  });

  mutationObserver.observe(contentWrapper, { childList: true, subtree: true });
}

// 监听内容变化，重新提取目录
watch(() => props.content, () => {
  tocItems.value = extractToc(props.content);
  nextTick(() => {
    waitForHeadingsAndObserve();
  });
}, { immediate: true });

// 挂载后绑定 window 滚动事件
onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true });
  nextTick(() => {
    waitForHeadingsAndObserve();
    handleWindowScroll();
  });
});

// 清理
onUnmounted(() => {
  headingObserver?.disconnect();
  mutationObserver?.disconnect();
  if (activeHeadingRafId !== null) {
    cancelAnimationFrame(activeHeadingRafId);
  }
  window.removeEventListener('scroll', handleWindowScroll);
});
</script>

<template>
  <UCard
    class="sticky top-5 max-h-[calc(100vh-40px)] overflow-hidden border border-gray-100/60 hover:shadow-md transition-all duration-300 rounded-xl"
  >
    <!-- 阅读进度条 -->
    <div
      class="absolute top-0 left-0 h-1 bg-linear-to-r from-blue-500 to-purple-500 transition-all duration-300 z-10 rounded-tl-xl"
      :style="{ width: `${readingProgress}%` }"
    />

    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <IconRender
            icon="venus:catalog"
            class="mr-2"
          />
          <span class="text-base font-semibold text-gray-800">目录</span>
        </div>
        <span class="text-xs text-gray-500">{{ Math.round(readingProgress) }}%</span>
      </div>
    </template>

    <div
      ref="tocScrollContainer"
      class="overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar"
    >
      <div
        v-if="tocItems.length > 0"
        class="space-y-1"
      >
        <div
          v-for="item of tocItems"
          :key="item.id"
          :data-toc-id="item.id"
          class="group flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-all duration-300 ease-in-out"
          :class="[
            activeTocId === item.id
              ? 'text-blue-300 font-semibold bg-sky-300/10 border-l-3'
              : 'text-gray-700 hover:bg-gray-100 border-transparent',
          ]
          "
          :style="{ paddingLeft: `${(item.depth - 1) * 10 + 8}px` }"
          @click="scrollToHeading(item.id)"
        >
          <!-- 层级图标 -->
          <span class="text-xs shrink-0">
            {{ item.depth <= 2 ? '▪️' : '·' }}
          </span>

          <!-- 标题文本 -->
          <span
            class="flex-1 text-sm truncate"
            :title="item.value"
          >
            {{ item.value }}
          </span>
        </div>
      </div>

      <div
        v-else
        class="text-center text-sm text-gray-500 py-8"
      >
        <div class="text-2xl mb-2">
          📖
        </div>
        暂无目录
      </div>
    </div>
  </UCard>
</template>

<style scoped lang="scss">
</style>
