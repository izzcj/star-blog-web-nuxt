<script setup lang="ts">
import { venusTagProps } from './props';

const props = defineProps({
  ...venusTagProps,
});

const emit = defineEmits<{
  close: [event: Event]
}>();

// 显示文本
const displayName = computed(() => props.tag?.name || props.name || '');

// 标签颜色
const tagColor = computed(() => props.tag?.color || props.color);

// 图标值
const iconValue = computed(() => props.tag?.icon || props.icon);

// 图标尺寸映射
const iconSizeMap: Record<string, string> = {
  lg: '16px',
  md: '14px',
  sm: '12px',
};

const iconSize = computed(() => iconSizeMap[props.size]);

function handleClose(event: Event) {
  emit('close', event);
}
</script>

<template>
  <UBadge
    :variant="props.variant"
    :size="props.size"
    :style="tagColor ? { backgroundColor: tagColor } : undefined"
  >
    <div class="inline-flex items-center gap-1">
      <IconRender
        v-if="iconValue"
        :icon="iconValue"
        :size="iconSize"
      />
      {{ displayName }}
      <button
        v-if="props.closable"
        class="ml-1 hover:opacity-70"
        @click="handleClose"
      >
        <UIcon
          name="lucide:x"
          class="text-xs"
        />
      </button>
    </div>
  </UBadge>
</template>
