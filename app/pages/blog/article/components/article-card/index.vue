<script setup lang="ts">
import ArticleCardCover from './cover/index.vue';
import ArticleCardMeta from './meta/index.vue';

const props = defineProps<{
  article: Article
  isFeatured?: boolean
}>();

// 标题样式
const titleClass = computed(() =>
  props.isFeatured
    ? 'text-2xl md:text-3xl text-white md:text-gray-900 text-shadow-card'
    : 'text-base md:text-lg text-gray-900',
);

// 摘要样式
const summaryClass = computed(() =>
  props.isFeatured
    ? 'md:text-base leading-relaxed line-clamp-3 mb-4 md:text-gray-500 text-white/75'
    : 'text-gray-400 line-clamp-2 leading-relaxed mb-3',
);

/**
 * 点击事件
 *
 * @param article 文章
 */
function clickArticle(article: Article) {
  navigateTo({
    name: 'ArticleDetails',
    params: { id: article.id },
  });
}
</script>

<template>
  <div
    class="group neumorphic relative rounded-2xl overflow-hidden cursor-pointer contain-layout card-glow bg-white"
    :class="isFeatured ? 'featured-card' : 'flex flex-col'"
    @click="clickArticle(article)"
  >
    <!-- 封面 -->
    <ArticleCardCover
      :article="article"
      :is-featured="isFeatured"
    />

    <!-- 内容 -->
    <div
      class="relative z-10 flex flex-col"
      :class="isFeatured ? 'p-6 md:p-8 md:w-[52%]' : 'p-4 md:p-5 flex-1'"
    >
      <!-- 分类 -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <span
          v-if="article.categoryName"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold tag-mint"
        >
          {{ article.categoryName }}
        </span>
      </div>

      <!-- 标题 -->
      <h2
        class="font-bold leading-snug mb-3 transition-colors duration-300 line-clamp-3 group-hover:text-mint-700"
        :class="titleClass"
      >
        {{ article.title }}
      </h2>

      <!-- 摘要 + 底部信息（整体贴底对齐） -->
      <div class="mt-auto">
        <p
          v-if="article.summary"
          class="text-sm"
          :class="summaryClass"
        >
          {{ article.summary }}
        </p>

        <ArticleCardMeta
          :article="article"
          :is-featured="isFeatured"
        />
      </div>
    </div>

    <!-- 阅读按钮（仅精选） -->
    <div
      v-if="isFeatured"
      class="absolute bottom-6 right-6 hidden md:block"
    >
      <div class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-300 group-hover:gap-2.5 btn-read-gradient">
        阅读全文
        <UIcon
          name="lucide:arrow-right"
          color="#fff"
          size="16"
        />
      </div>
    </div>

    <!-- 底部悬停进度条（装饰） -->
    <div class="absolute bottom-0 inset-x-0 h-0.5 transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100 progress-mint-lime" />
  </div>
</template>

<style scoped lang="scss">
</style>
