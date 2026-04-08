<script setup lang="ts">
interface Props {
  // 标题
  title: string
  // 标题图标
  titleIcon?: string
  // header样式
  headerClass?: string
  // body样式
  bodyClass?: string
}
const props = defineProps<Props>();

/**
 * 合并header样式
 */
function mergeHeaderClass(): string {
  if (props.headerClass) {
    return `${props.headerClass}`;
  }
  return 'py-3 px-4';
}

/**
 * 合并body样式
 */
function mergeBodyClass(): string {
  if (props.bodyClass) {
    return `${props.bodyClass}`;
  }
  return 'p-4';
}
</script>

<template>
  <UCard
    class="mb-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl"
    :ui="{
      header: mergeHeaderClass(),
      body: mergeBodyClass(),
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <IconRender
            v-if="props.titleIcon"
            :icon="props.titleIcon"
            class="mr-2"
          />
          <span class="text-base font-bold text-gray-700">{{ props.title }}</span>
        </div>
        <slot name="header" />
      </div>
    </template>
    <slot />
  </UCard>
</template>
