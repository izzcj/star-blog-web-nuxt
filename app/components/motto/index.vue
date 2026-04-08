<script setup lang="ts">
import { mottoProps } from './props';

const props = defineProps({
  ...mottoProps,
});

const emit = defineEmits(['updateMotto']);

// 显示内容
const content = ref('');
// 当前内容索引
const contentIndex = ref(0);
// 是否正向输出
const print = ref(true);

// 定时器
let timer: ReturnType<typeof setInterval> | null = null;
let timeout: ReturnType<typeof setTimeout> | null = null;

/**
 * 清理所有定时器
 */
function clearAll() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
}

/**
 * 更新内容索引
 */
function updateIndex() {
  let newIndex = contentIndex.value;

  newIndex += print.value ? 1 : -1;

  if (print.value) {
    if (newIndex > props.motto.length) {
      newIndex = props.motto.length - 1;
      print.value = false;
    }
  } else {
    if (newIndex < 0) {
      newIndex = 1;
      print.value = true;
    }
  }

  contentIndex.value = newIndex;
}

/**
 * 开启动画
 */
function start() {
  clearAll();

  timeout = setTimeout(() => {
    timer = setInterval(() => {
      updateIndex();

      const atStart = contentIndex.value === 0;
      const atEnd = contentIndex.value === props.motto.length;

      if (atEnd && props.once) {
        clearAll();
        return;
      }

      if (atStart || atEnd) {
        clearAll();

        if (!print.value) {
          emit('updateMotto');
        }

        // 延迟后重新开始（安全重启）
        timeout = setTimeout(() => {
          start();
        }, props.delay);
      }
    }, props.duration);
  }, props.delay);
}

/**
 * 重置
 */
function reset() {
  clearAll();
  contentIndex.value = 0;
  print.value = true;

  if (props.play && import.meta.client) {
    start();
  } else {
    content.value = props.motto;
  }
}

/**
 * 监听内容变化
 */
watch(contentIndex, () => {
  content.value = props.motto.slice(0, contentIndex.value);
});

/**
 * 监听 props
 */
watch(
  () => [props.play, props.motto],
  () => {
    reset();
  },
);

/**
 * 挂载
 */
onMounted(() => {
  if (props.play && import.meta.client) {
    start();
  } else {
    content.value = props.motto;
  }
});

/**
 * 卸载
 */
onBeforeUnmount(() => {
  clearAll();
});
</script>

<template>
  <slot :content="content" />
</template>
