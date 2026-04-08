<script setup lang="ts">
import { normalizeIconName } from '~/utils/icon-util';

interface Props {
  /** 图标名称（支持 iconify 格式如 ant-design:home / venus:article / i-venus-article） */
  icon?: string
  /** 图标大小 */
  size?: string | number
  /** 图标颜色 */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  size: '20px',
  color: '',
});

const iconName = computed(() => normalizeIconName(props.icon));

const sizeValue = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
);

const styleObject = computed(() => {
  const styles: Record<string, string> = {};
  if (sizeValue.value) {
    styles.width = sizeValue.value;
    styles.height = sizeValue.value;
    styles.fontSize = sizeValue.value;
  }
  if (props.color) {
    styles.color = props.color;
  }
  return styles;
});
</script>

<template>
  <UIcon
    v-if="iconName"
    :name="iconName"
    :style="styleObject"
  />
  <UIcon
    v-else
    name="i-lucide-help-circle"
    :style="styleObject"
    class="text-muted"
  />
</template>
