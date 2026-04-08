<script setup lang="ts">
import CommentSection from '../comment-section/index.vue';

const props = defineProps<{
  // 文章详情
  articleDetail: ArticleDetail
}>();

const router = useRouter();
const appSettingsStore = useAppSettingsStore();

// 估算阅读时间（按300字/分钟计算）
const readTime = computed(() => {
  const charCount = (props.articleDetail?.content?.length ?? 0);
  const mins = Math.max(1, Math.ceil(charCount / 300));
  return `${mins} 分钟`;
});

// 创建内容的本地副本，避免直接修改 prop
const localContent = ref(props.articleDetail.content ?? '');
const contentLoading = computed(() => !localContent.value);

// 监听 prop 变化，同步到本地副本
watch(
  () => props.articleDetail.content,
  newContent => {
    if (newContent) {
      localContent.value = newContent;
    }
  },
);

/**
 * 返回上一页
 * 如果没有浏览历史，则返回文章列表页
 */
function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    navigateTo({ name: 'blog-article' });
  }
}
</script>

<template>
  <div class="p-5">
    <!-- 移动端返回按钮 -->
    <UIcon
      v-if="appSettingsStore.isMobile"
      name="lucide:arrow-left"
      class="mb-4 cursor-pointer"
      @click="goBack"
    />

    <!-- PC 端返回按钮 -->
    <div
      v-else
      class="mb-4"
    >
      <UButton
        icon="lucide:arrow-left"
        color="neutral"
        variant="outline"
        class="cursor-pointer"
        @click="goBack"
      >
        返回
      </UButton>
    </div>

    <!-- 文章标题 -->
    <h1 class="text-center text-[28px]/[1.3] font-bold mb-4 text-[#333]">
      {{ articleDetail.title }}
    </h1>

    <!-- 文章元信息 -->
    <div class="flex flex-wrap justify-center gap-4 border-b border-solid border-[#eee] pb-4 text-sm text-gray-600">
      <UBadge
        v-if="articleDetail.top"
        color="error"
      >
        置顶
      </UBadge>

      <UBadge
        color="info"
        variant="outline"
      >
        {{ articleDetail.categoryName }}
      </UBadge>

      <span class="flex items-center gap-1">
        <UIcon name="lucide:user" />
        {{ articleDetail.createByName }}
      </span>

      <span class="flex items-center gap-1">
        <UIcon name="lucide:eye" />
        {{ formatViewCount(articleDetail.viewCount) }}
      </span>

      <span class="flex items-center gap-1">
        <UIcon name="lucide:clock" />
        {{ formatRelativeTime(articleDetail.publishTime) }}
      </span>

      <span class="flex items-center gap-1">
        约
        {{ readTime }}
      </span>
    </div>

    <div
      v-if="articleDetail.summary"
      class="mt-6 px-5 py-4 text-gray-400 text-sm italic leading-relaxed border-l-2 border-gray-300 bg-linear-to-r from-gray-50 to-transparent"
    >
      <TextGenerateEffect
        :words="articleDetail.summary"
        :duration="2"
      />
    </div>

    <!-- 封面图 -->
    <div
      v-if="articleDetail.coverImage"
      class="my-5"
    >
      <VenusImage
        :src="articleDetail.coverImage"
        :alt="articleDetail.title"
        class="rounded-md shadow-ms hover:shadow-xl"
      />
    </div>

    <!-- 内容 -->
    <div class="article-content-wrapper">
      <VenusByteMdEditor
        :model-value="localContent"
        :preview="true"
      />
    </div>

    <!-- 标签 -->
    <div
      v-if="articleDetail.tags && articleDetail.tags.length > 0"
      class="mt-7 pt-5 border-t border-t-[#eee]"
    >
      <VenusTag
        v-for="tag of articleDetail.tags"
        :key="tag.id"
        :tag="tag"
        class="mr-2.5 mb-2.5"
      />
    </div>

    <!-- 评论区 -->
    <div class="mt-4">
      <CommentSection
        :article-id="articleDetail.id"
        :author-id="articleDetail.createBy"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
// Element Plus 按钮样式覆盖
:deep(.el-button.is-text:hover) {
  background-color: transparent;
}
</style>
