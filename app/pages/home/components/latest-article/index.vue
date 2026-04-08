<script setup lang="ts">
import ArticleCard from '~/pages/blog/article/components/article-card/index.vue';
import HomeComponentCard from '../home-component-card.vue';
import { articleFetchApis } from '~/apis/blog/article';

const hotArticle = ref<Article[]>([]);

/**
 * 跳转至文章列表页
 */
function goArticleList() {
  navigateTo({ name: 'blog-article' });
}

const res = await articleFetchApis().fetchPage({
  params: {
    page: 1,
    size: 6,
    status: 'published',
    sortDesc: 'publishTime',
  },
});
hotArticle.value = res.data.value?.data ?? [];
</script>

<template>
  <HomeComponentCard
    header-class=""
    title="最新文章"
    title-icon="venus:new-article"
  >
    <template #header>
      <span
        class="text-sm font-medium text-blue-400 cursor-pointer"
        @click="goArticleList"
      >
        更多 →
      </span>
    </template>
    <div class="w-full">
      <template v-if="hotArticle.length">
        <div class="w-full grid gap-4 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          <ArticleCard
            v-for="article of hotArticle"
            :key="article.id"
            :article="article"
          />
        </div>
      </template>
      <UEmpty
        v-else
        description="暂无文章"
      />
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
</style>
