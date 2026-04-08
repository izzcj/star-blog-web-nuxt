<script setup lang="ts">
import HomeComponentCard from '../home-component-card.vue';
import { articleFetchApis, type CategoryWithCount } from '~/apis/blog/article';

// 分类列表
const categories = ref<CategoryWithCount[]>([]);

const res = await articleFetchApis().fetchCategoryNavbar();
categories.value = res.data.value ?? [];

/**
 * 跳转到分类页面
 *
 * @param categoryValue 分类值
 */
function goToCategory(categoryValue: string) {
  navigateTo({ name: 'blog-article', query: { category: categoryValue } });
}
</script>

<template>
  <HomeComponentCard
    title="分类导航"
    title-icon="venus:category"
  >
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="category of categories"
        :key="category.categoryValue"
        class="group relative p-4 rounded-lg cursor-pointer transition-all duration-300 ease-out
               hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
        :style="category.cssClass"
        @click="goToCategory(category.categoryValue)"
      >
        <div class="relative z-10 flex flex-col items-center text-center">
          <div class="w-full">
            <div class="text-[14px] text-white font-semibold mb-1 transition-transform duration-300 ease-out group-hover:translate-x-1">
              {{ category.categoryLabel }}
            </div>
            <div class="text-xs text-white/90">
              {{ category.articleCount }} 篇
            </div>
          </div>
        </div>
      </div>
      <UEmpty
        v-if="categories.length === 0"
        description="暂无导航分类"
      />
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
</style>
