<script setup lang="ts">
import AuthorCard from './author-card/index.vue';
import AuthorArticles from './author-articles/index.vue';

defineProps<{
  authorId: string
  currentArticleId: string
}>();
</script>

<template>
  <div class="space-y-4">
    <AuthorCard :author-id="authorId" />
    <AuthorArticles
      :author-id="authorId"
      :current-article-id="currentArticleId"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
