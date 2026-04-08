<script setup lang="ts">
withDefaults(defineProps<Props>(), {
  isFeatured: false,
});

interface Props {
  isFeatured?: boolean
}
</script>

<template>
  <!-- 特色卡片骨架 -->
  <div
    v-if="isFeatured"
    class="featured-card relative rounded-2xl overflow-hidden min-h-70 bg-white shadow-card-subtle"
  >
    <!-- 右侧图片骨架 -->
    <div class="absolute inset-0 md:left-[48%] animate-skeleton" />

    <!-- 内容区骨架 -->
    <div class="relative z-10 flex flex-col h-full p-6 md:p-8 md:w-[52%] space-y-4">
      <!-- 标签骨架 -->
      <div class="flex gap-2">
        <div class="h-6 w-16 animate-skeleton rounded-lg" />
        <div class="h-6 w-12 animate-skeleton rounded-lg" />
      </div>
      <!-- 标题骨架 -->
      <div class="space-y-2.5">
        <div class="h-8 animate-skeleton rounded-xl w-full" />
        <div class="h-8 animate-skeleton rounded-xl w-4/5" />
        <div class="h-8 animate-skeleton rounded-xl w-3/5" />
      </div>
      <!-- 摘要骨架 -->
      <div class="space-y-2 flex-1">
        <div class="h-4 animate-skeleton rounded-md" />
        <div class="h-4 animate-skeleton rounded-md w-11/12" />
        <div class="h-4 animate-skeleton rounded-md w-4/5" />
      </div>
      <!-- 底部信息骨架 -->
      <div class="flex items-center gap-3 mt-auto">
        <div class="w-7 h-7 rounded-full animate-skeleton shrink-0" />
        <div class="h-4 w-20 animate-skeleton rounded-md" />
        <div class="h-4 w-4 animate-skeleton rounded-md" />
        <div class="h-4 w-24 animate-skeleton rounded-md" />
      </div>
    </div>
  </div>

  <!-- 普通卡片骨架 -->
  <div
    v-else
    class="flex flex-col rounded-2xl overflow-hidden bg-white shadow-card-subtle"
  >
    <!-- 封面骨架 -->
    <div class="aspect-16/10 animate-skeleton shrink-0" />

    <!-- 内容骨架 -->
    <div class="flex flex-col p-4 md:p-5 space-y-3">
      <!-- 标题骨架 -->
      <div class="space-y-2">
        <div class="h-5 animate-skeleton rounded-lg" />
        <div class="h-5 animate-skeleton rounded-lg w-4/5" />
      </div>
      <!-- 摘要骨架 -->
      <div class="space-y-1.5">
        <div class="h-3.5 animate-skeleton rounded-md" />
        <div class="h-3.5 animate-skeleton rounded-md w-5/6" />
      </div>
      <!-- 底部信息骨架 -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-100/80">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full animate-skeleton shrink-0" />
          <div class="h-3.5 w-16 animate-skeleton rounded-md" />
          <div class="h-3.5 w-2 animate-skeleton rounded-full" />
          <div class="h-3.5 w-20 animate-skeleton rounded-md" />
        </div>
        <div class="h-3.5 w-12 animate-skeleton rounded-md" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
