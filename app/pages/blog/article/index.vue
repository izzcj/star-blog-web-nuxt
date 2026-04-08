<script setup lang="ts">
import ArticleCard from './components/article-card/index.vue';
import ArticleSkeleton from './components/article-skeleton/index.vue';
import FilterBar from './components/filter-bar/index.vue';
import HeroBanner from './components/hero-banner/index.vue';
import { useAppSettingsStore } from '@/stores/app-settings-store';
import { dictDataFetchApis } from '~/apis/system/dict-data';
import { articleFetchApis } from '~/apis/blog/article';

const props = defineProps<{
  category?: string
}>();

const pagination = reactive({
  page: 1,
  size: 12,
});
const currentCategory = ref(props.category);
const currentSort = ref('publishTime:desc');
const searchKeyword = ref('');
const appSettingsStore = useAppSettingsStore();

const params = computed(() => {
  let defaultDescSort = 'top, updateTime';
  const [sortField, sortOrder] = currentSort.value.split(':');
  if (sortOrder == 'desc' && !defaultDescSort.includes(sortField as string)) {
    defaultDescSort += `,${sortField}`;
  }
  return {
    page: pagination.page,
    size: pagination.size,
    status: 'published',
    category: currentCategory.value || undefined,
    title: searchKeyword.value || undefined,
    sortDesc: defaultDescSort,
    sortAsc: sortOrder === 'asc' ? sortField : undefined,
  };
});

/**
 * 响应式获取文章列表
 * params 变化时 useFetch 自动重新请求
 */
const { data: articlePageData, status: fetchStatus } = articleFetchApis().fetchPage({
  params,
});

const articleList = computed(() => articlePageData.value?.data ?? []);
const total = computed(() => articlePageData.value?.total ?? 0);
const loading = computed(() => fetchStatus.value === 'pending');

const { data: categoryOptions } = dictDataFetchApis().fetchOptions({ params: { dictKey: 'article-category' } });
const categories = computed(() => categoryOptions.value ?? []);

/**
 * 处理文章分类切换
 *
 * @param category 分类
 */
function handleCategoryChange(category: string) {
  currentCategory.value = category;
  pagination.page = 1;
}

/**
 * 处理文章排序切换
 *
 * @param sort 排序字段
 */
function handleSortChange(sort: string) {
  currentSort.value = sort;
  pagination.page = 1;
}

/**
 * 处理搜索
 *
 * @param keyword 关键字
 */
function handleSearch(keyword: string) {
  searchKeyword.value = keyword;
  pagination.page = 1;
}
</script>

<template>
  <div class="min-h-full aurora-bg">
    <!-- 顶部极光装饰（固定，不滚动） -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-10 blur-3xl glow-radial-mint" />
      <div class="absolute top-1/3 -right-40 w-125 h-125 rounded-full opacity-8 blur-3xl glow-radial-lime" />
    </div>

    <div class="relative z-10 w-full max-w-350 mx-auto px-4 md:px-6 lg:px-8">
      <!-- Hero 横幅 -->
      <div class="pt-6 md:pt-8 pb-6 md:pb-8">
        <HeroBanner :total-articles="total" />
      </div>

      <!-- 筛选导航栏 -->
      <div class="pb-6 md:pb-8">
        <FilterBar
          :categories="categories"
          :current-category="currentCategory"
          :current-sort="currentSort"
          @update:current-category="handleCategoryChange"
          @update:current-sort="handleSortChange"
          @search="handleSearch"
        />
      </div>

      <!-- 结果数量提示（非加载时显示） -->
      <Transition name="fade">
        <div
          v-if="!loading && total > 0"
          class="mb-4 flex items-center gap-2"
        >
          <div class="h-px flex-1 bg-linear-to-r from-mint-200/50 to-transparent" />
          <span class="text-xs text-gray-400 px-2">共 {{ total }} 篇文章</span>
          <div class="h-px flex-1 bg-linear-to-l from-mint-200/50 to-transparent" />
        </div>
      </Transition>

      <!-- 文章列表 -->
      <div class="min-h-100 pb-8">
        <!-- 骨架屏 -->
        <div
          v-if="loading"
          class="article-grid"
        >
          <ArticleSkeleton
            v-for="i of pagination.size"
            :key="i"
            :is-featured="i === 1"
          />
        </div>

        <!-- 文章网格 -->
        <div
          v-else-if="articleList.length > 0"
          class="article-grid"
        >
          <ArticleCard
            v-for="(article, index) of articleList"
            :key="article.id"
            :article="article"
            :is-featured="index === 0"
            class="animate-card-enter"
            :style="{ animationDelay: `${index * 60}ms` }"
          />
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-24 animate-fade-in"
        >
          <div class="rounded-3xl p-12 text-center empty-state-glass">
            <!-- 插图 -->
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 empty-icon-bg">
              <UIcon
                name="lucide:file-text"
                color="#5eead4"
                size="40"
              />
            </div>
            <p class="text-gray-600 font-medium text-lg mb-1">
              暂无文章
            </p>
            <p class="text-gray-400 text-sm">
              换个分类或关键词试试吧
            </p>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <Transition name="fade">
        <div
          v-if="total > 0"
          class="flex justify-center pt-4 pb-14"
        >
          <div class="rounded-2xl px-5 py-4 pagination-glass">
            <VenusPagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.size"
              :total="total"
              :size="appSettingsStore.isMobile ? 'sm' : 'md'"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 淡入过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
