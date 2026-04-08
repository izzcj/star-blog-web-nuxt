<script setup lang="ts">
defineProps<{
  article: Article
  isFeatured?: boolean
}>();

function getAvatarClass(isFeatured: boolean) {
  const baseClass = 'rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-mint-400 to-lime-400';
  if (isFeatured) {
    return `w-7 h-7 ${baseClass}`;
  }
  return `w-6 h-6 ${baseClass}`;
}
</script>

<template>
  <!-- 精选卡片 -->
  <div
    v-if="isFeatured"
    class="flex items-center gap-4 mt-auto"
  >
    <!-- 作者 -->
    <div
      v-if="article.createByName"
      class="flex items-center gap-2"
    >
      <div :class="getAvatarClass(true)">
        {{ article.createByName.charAt(0) }}
      </div>
      <span class="text-xs font-medium md:text-gray-700 text-white/90">
        {{ article.createByName }}
      </span>
    </div>

    <span class="w-1 h-1 rounded-full shrink-0 md:bg-gray-300 bg-white/40" />

    <!-- 日期 -->
    <div
      v-if="article.publishTime"
      class="flex items-center gap-1 text-xs md:text-gray-400 text-white/70"
    >
      <UIcon
        name="lucide:clock"
        color="#fff"
        size="12"
      />
      {{ formatRelativeTime(article.publishTime) }}
    </div>

    <!-- 阅读量 -->
    <div class="ml-auto flex items-center gap-1 text-xs md:text-gray-400 text-white/70">
      <UIcon
        name="lucide:eye"
        color="#fff"
        size="12"
      />
      {{ formatViewCount(article.viewCount) }}
    </div>
  </div>

  <!-- 普通卡片 -->
  <div
    v-else
    class="flex items-center justify-between pt-3 mt-auto border-t border-gray-100"
  >
    <div class="flex items-center gap-2 min-w-0">
      <div
        v-if="article.createByName"
        :class="getAvatarClass(false)"
      >
        {{ article.createByName.charAt(0) }}
      </div>

      <span class="text-xs text-gray-500 truncate max-w-20">
        {{ article.createByName }}
      </span>

      <span class="w-1 h-1 rounded-full shrink-0 bg-gray-200" />

      <span
        v-if="article.publishTime"
        class="text-xs text-gray-400"
      >
        {{ formatRelativeTime(article.publishTime) }}
      </span>
    </div>

    <div class="flex items-center gap-1 text-xs text-gray-400">
      <UIcon
        name="lucide:eye"
        color="#fff"
        size="12"
      />
      {{ formatViewCount(article.viewCount) }}
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
