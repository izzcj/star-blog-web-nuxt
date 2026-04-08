<script setup lang="ts">
import { avatarUploaderProps } from './props';

interface AvatarUploaderEmits {
  (e: 'upload', file: File): void
  (e: 'delete'): void
}

const props = defineProps({
  ...avatarUploaderProps,
});

const emit = defineEmits<AvatarUploaderEmits>();

// 文件输入引用
const fileInputRef = ref<HTMLInputElement>();

// 是否悬停
const isHovering = ref(false);

/**
 * 文件选择处理
 */
function handleClick() {
  if (props.enabled) {
    fileInputRef.value?.click();
  }
}

/**
 * 文件选择变化
 *
 * @param event 事件
 */
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    emit('upload', file);
  }

  // 清空 input 值，允许重复选择同一文件
  target.value = '';
}

/**
 * 删除头像
 *
 * @param event 事件
 */
function handleDelete(event: Event) {
  event.stopPropagation();
  emit('delete');
}
</script>

<template>
  <div
    class="inline-block relative"
    :class="{ 'cursor-pointer': props.enabled }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- 默认插槽：头像 -->
    <slot />

    <!-- 悬停遮罩 -->
    <Transition name="fade">
      <div
        v-if="isHovering && props.enabled"
        class="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full"
      >
        <div class="actions flex gap-3 text-white">
          <!-- 删除按钮 -->
          <UIcon
            v-if="props.hasAvatar"
            name="lucide:x"
            :size="24"
            @click="handleDelete"
          />
          <!-- 上传按钮 -->
          <UIcon
            v-else
            name="lucide:plus"
            :size="24"
            @click="handleClick"
          />
        </div>
      </div>
    </Transition>

    <!-- 文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/jpg,image/bmp"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>

<style scoped lang="scss">
</style>
