<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
  currentCategory: '',
  currentSort: 'publishTime:desc',
});

interface Props {
  categories?: DataOption[]
  currentCategory?: string
  currentSort?: string
}

const emit = defineEmits([
  'update:currentCategory',
  'update:currentSort',
  'search',
]);

const searchKeyword = ref('');

const sortOptions = [
  { label: '最新发布', value: 'publishTime:desc' },
  { label: '最早发布', value: 'publishTime:asc' },
  { label: '最多浏览', value: 'viewCount:desc' },
  { label: '最少浏览', value: 'viewCount:asc' },
];

function selectCategory(categoryValue: string) {
  emit('update:currentCategory', categoryValue);
}

function selectSort(sortValue: string | undefined) {
  if (sortValue !== undefined) {
    emit('update:currentSort', sortValue);
  }
}

function handleSearch() {
  emit('search', searchKeyword.value);
}
</script>

<template>
  <div class="glass-filter rounded-2xl p-5 md:p-6 space-y-5">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="flex-1 search-glow rounded-xl transition-all duration-300">
        <div class="search-input-override flex items-stretch gap-2">
          <UInput
            v-model="searchKeyword"
            placeholder="搜索文章标题..."
            size="xl"
            variant="outline"
            leading-icon="i-lucide-search"
            class="flex-1"
            :ui="{
              base: 'bg-white/85 border border-teal-500/20 rounded-xl',
              leadingIcon: 'text-teal-600/80',
            }"
            @keyup.enter="handleSearch"
          />

          <UButton
            size="xl"
            color="primary"
            class="px-4 rounded-xl bg-linear-to-br from-teal-500 to-teal-700 border-0 text-white cursor-pointer transition-all duration-200 active:scale-95"
            @click="handleSearch"
          >
            搜索
          </UButton>
        </div>
      </div>

      <div class="w-full sm:w-40 shrink-0">
        <USelect
          :model-value="currentSort"
          :items="sortOptions"
          value-key="value"
          label-key="label"
          placeholder="排序方式"
          size="xl"
          variant="outline"
          leading-icon="i-lucide-list-filter"
          class="w-full sort-select-override"
          @update:model-value="selectSort"
        />
      </div>
    </div>

    <div class="relative">
      <div class="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-white/60 to-transparent z-10 pointer-events-none" />
      <div class="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-white/60 to-transparent z-10 pointer-events-none" />

      <div class="flex items-center gap-2 overflow-x-auto pb-0.5 px-1 scrollbar-none">
        <button
          class="shrink-0 px-4 py-2 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap cursor-pointer transition-all duration-250 select-none"
          :class="props.currentCategory === '' ? 'category-active' : 'category-default'"
          @click="selectCategory('')"
        >
          全部
        </button>

        <div class="h-5 w-px bg-mint-200/60 shrink-0 mx-0.5" />

        <button
          v-for="category of props.categories"
          :key="category.value"
          class="shrink-0 px-4 py-2 rounded-xl font-medium text-xs md:text-sm whitespace-nowrap cursor-pointer transition-all duration-250 select-none"
          :class="props.currentCategory === category.value ? 'category-active' : 'category-default'"
          @click="selectCategory(category.value as string)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar { display: none; }
}

.filter-hint-enter-active,
.filter-hint-leave-active {
  transition: all 0.25s ease;
}

.filter-hint-enter-from,
.filter-hint-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

:deep(.search-input-override [data-slot='root']) {
  min-height: 48px;
}

:deep(.search-input-override [data-slot='base']) {
  box-shadow: none;

  &:hover {
    border-color: rgba(20, 184, 166, 0.4);
  }

  &:focus {
    border-color: rgba(20, 184, 166, 0.6);
    background: rgba(255, 255, 255, 0.95);
  }
}

:deep(.sort-select-override [data-slot='trigger']) {
  min-height: 48px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(20, 184, 166, 0.2);
  box-shadow: none;
  border-radius: 12px;

  &:hover,
  &:focus-visible {
    border-color: rgba(20, 184, 166, 0.4);
  }
}
</style>
