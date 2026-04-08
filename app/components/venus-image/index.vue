<script setup lang="ts">
import { venusImageProps } from './props';

const props = defineProps({
  ...venusImageProps,
});

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>();

const resolvedSrc = useResolvedFileUrl(computed(() => props.src));

/**
 * 处理异常
 *
 * @param event 事件
 */
function handleError(event: Event) {
  emit('error', event);
}

/**
 * 处理加载成功
 *
 * @param event 事件
 */
function handleLoad(event: Event) {
  emit('load', event);
}
</script>

<template>
  <NuxtImg
    v-if="resolvedSrc"
    :src="resolvedSrc"
    :width="props.width"
    :height="props.height"
    :alt="props.alt"
    :fit="props.fit"
    :loading="props.lazy ? 'lazy' : undefined"
    class="block"
    @load="handleLoad"
    @error="handleError"
  />
</template>
