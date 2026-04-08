<script setup lang="ts">
import { generateAvatarColor, getAvatarText } from '../utils/avatar-color';
import { avatarDisplayProps } from './props';

const props = defineProps({
  ...avatarDisplayProps,
});

// 图片加载失败状态
const imageLoadError = ref(false);

// 容器样式
const containerStyle = computed(() => {
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
    borderRadius: props.shape === 'circle' ? '50%' : '8px',
  };
});

// 文字头像文本
const avatarText = computed(() => {
  return getAvatarText(props.name || '');
});

// 计算尺寸
const computedSize = computed(() => {
  return props.size || 80;
});

// 计算宽度
const computedWidth = computed(() => {
  if (props.size) {
    return `${props.size}px`;
  }
  return '100%';
});

// 计算高度
const computedHeight = computed(() => {
  if (props.size) {
    return `${props.size}px`;
  }
  return '100%';
});

// 文字头像样式
const textAvatarStyle = computed(() => {
  const bgColor = props.bgColor || generateAvatarColor(props.name || '');
  const fontSize = computedSize.value > 80 ? computedSize.value * 0.4 : computedSize.value * 0.35;

  return {
    backgroundColor: bgColor,
    color: props.textColor,
    fontSize: `${fontSize}px`,
    lineHeight: `${props.size}px`,
  };
});

// 是否显示图片
const shouldShowImage = computed(() => {
  return props.src && !imageLoadError.value;
});

// 是否显示文字头像
const shouldShowText = computed(() => {
  return !shouldShowImage.value && avatarText.value;
});

// 是否显示默认图标
const shouldShowIcon = computed(() => {
  return !shouldShowImage.value && !shouldShowText.value;
});

/**
 * 图片加载错误处理
 */
function handleImageError() {
  imageLoadError.value = true;
}

// 监听 src 变化，重置错误状态
watch(() => props.src, () => {
  imageLoadError.value = false;
});
</script>

<template>
  <div
    class="relative border-inherit overflow-hidden"
    :style="containerStyle"
  >
    <!-- 图片头像 -->
    <VenusImage
      v-if="shouldShowImage"
      :src="props.src!"
      fit="cover"
      :width="computedWidth"
      :height="computedHeight"
      alt="avatar"
      @error="handleImageError"
    />

    <!-- 文字头像 -->
    <div
      v-else-if="shouldShowText"
      class="size-full rounded-full flex items-center justify-center font-semibold select-none"
      :style="textAvatarStyle"
    >
      {{ avatarText }}
    </div>

    <!-- 默认图标 -->
    <div
      v-else-if="shouldShowIcon"
      class="size-full flex items-center justify-center bg-gray-200"
      :style="containerStyle"
    >
      <UIcon
        name="lucide:user"
        :style="{ fontSize: `${computedSize * 0.5}px` }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
