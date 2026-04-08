<script setup lang="ts">
import HomeComponentCard from '../home-component-card.vue';
import { articleFetchApis } from '~/apis/blog/article';

// 推荐文章列表
const articles = ref<Array<Pick<Article, 'id' | 'title' | 'coverImage' | 'viewCount' | 'publishTime'>>>([]);

const res = await articleFetchApis().fetchPage({
  params: {
    page: 1,
    size: 5,
    recommended: true,
    sortDesc: 'publishTime',
  },
});
articles.value = res.data.value?.data ?? [];

/**
 * 跳转到文章详情
 *
 * @param articleId 文章ID
 */
function goToArticle(articleId: string) {
  navigateTo({ name: 'ArticleDetails', params: { id: articleId } });
}
</script>

<template>
  <HomeComponentCard
    title="推荐阅读"
    title-icon="venus:recommend"
    body-class="custom-scrollbar max-h-[330px] overflow-y-auto"
  >
    <div class="flex flex-col gap-3">
      <div
        v-for="article of articles"
        :key="article.id"
        class="group flex p-3 rounded-lg bg-[#fafafa] cursor-pointer overflow-hidden transition duration-300 ease-out hover:bg-[#f0f0f0] hover:-translate-y-0.5 hover:shadow-md"
        @click="goToArticle(article.id)"
      >
        <!-- 封面 -->
        <div class="relative w-20 h-15 rounded-md overflow-hidden mr-3 shrink-0">
          <VenusImage
            :src="article.coverImage"
            class="size-full transition-transform duration-300 ease-out group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span class="text-white text-xs font-semibold px-2 py-1 border border-white rounded">
              阅读
            </span>
          </div>
        </div>

        <!-- 信息 -->
        <div class="flex flex-col justify-between flex-1 min-w-0">
          <div class="text-sm font-semibold text-[#333] leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-blue-500">
            {{ article.title }}
          </div>

          <div class="flex items-center text-xs gap-3 text-gray-500">
            <span>{{ formatRelativeTime(article.publishTime) }}</span>
            <span class="flex items-center gap-1">
              <UIcon
                name="lucide:eye"
                size="14"
              />
              {{ formatViewCount(article.viewCount) }}
            </span>
          </div>
        </div>
      </div>

      <UEmpty
        v-if="articles.length === 0"
        description="暂无推荐文章"
      />
    </div>
  </HomeComponentCard>
</template>
