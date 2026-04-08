<script setup lang="ts">
import { formatViewCount } from '@/utils/format-util';
import { formatRelativeTime } from '@/utils/date-util';
import { articleFetchApis } from '~/apis/blog/article';

const props = defineProps<{
  authorId: string
  currentArticleId: string
}>();

// 作者其他文章列表
const articles = ref<Article[]>([]);
const loading = ref(false);

const { data, status } = await articleFetchApis().fetchPage({
  params: {
    createBy: props.authorId,
    excludeIds: props.currentArticleId,
    status: 'published',
    sortDesc: 'viewCount',
    page: 1,
    size: 5,
  },
});

if (status.value == 'success') {
  articles.value = data.value.data;
  loading.value = false;
}

/**
 * 跳转到文章详情
 */
function navigateToArticle(id: string) {
  navigateTo({
    name: 'ArticleDetails',
    params: { id },
  });
}
</script>

<template>
  <UCard
    class="border border-gray-100/60 hover:shadow-md transition-all duration-300 rounded-xl"
  >
    <template #header>
      <div class="flex items-center">
        <IconRender
          icon="venus:other"
          class="mr-2"
        />
        <span class="text-base font-semibold text-gray-800">其他文章</span>
      </div>
    </template>

    <USkeleton
      v-if="loading"
    />

    <div
      v-else-if="articles.length > 0"
      class="flex flex-col gap-3"
    >
      <div
        v-for="article of articles"
        :key="article.id"
        class="group flex p-3 rounded-lg bg-gray-50/60 cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md"
        @click="navigateToArticle(article.id)"
      >
        <!-- 封面 -->
        <div class="relative w-20 h-15 rounded-md overflow-hidden mr-3 shrink-0">
          <VenusImage
            :src="article.coverImage"
            :alt="article.title"
            class="size-full transition-transform duration-300 ease-out group-hover:scale-110"
          />
        </div>

        <!-- 信息 -->
        <div class="flex flex-col justify-between flex-1 min-w-0">
          <!-- 标题 -->
          <div class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-primary">
            {{ article.title }}
          </div>

          <!-- 元信息 -->
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span>{{ formatRelativeTime(article.publishTime) }}</span>
            <span class="flex items-center gap-1">
              <UIcon name="lucide:eye" />
              {{ formatViewCount(article.viewCount) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      description="暂无其他文章"
    />
  </UCard>
</template>
