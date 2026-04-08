<script setup lang="ts">
import ArticleCard from '~/pages/blog/article/components/article-card/index.vue';
import HomeComponentCard from '../home-component-card.vue';
import { articleFetchApis } from '~/apis/blog/article';

const hotArticle = ref<Article[]>([]);

const res = await articleFetchApis().fetchPage({
  params: {
    page: 1,
    size: 6,
    status: 'published',
    sortDesc: 'top, viewCount, updateTime',
  },
});
hotArticle.value = res.data.value?.data ?? [];
</script>

<template>
  <HomeComponentCard
    header-class=""
    title="热门文章"
    title-icon="venus:hot-article"
  >
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
        description="暂无热门文章"
      />
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
</style>
