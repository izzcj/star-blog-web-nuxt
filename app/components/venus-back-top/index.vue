<script setup lang="ts">
import { venusBackTopProps } from './props';

const props = defineProps({
  ...venusBackTopProps,
});

const emit = defineEmits<{
  click: [event: MouseEvent]
}>();

// 解析目标容器
const targetEl = shallowRef<HTMLElement | undefined>();

onMounted(() => {
  if (props.target) {
    targetEl.value = document.querySelector<HTMLElement>(props.target) ?? undefined;
  }
});

// 根据是否指定容器决定使用 useScroll 或 useWindowScroll
const windowScroll = useWindowScroll();
const containerScroll = useScroll(targetEl);

const scrollY = computed(() => props.target ? containerScroll.y.value : windowScroll.y.value);

// 是否显示
const visible = computed(() => scrollY.value >= props.visibilityHeight);

// 定位样式
const positionStyle = computed(() => ({
  right: `${props.right}px`,
  bottom: `${props.bottom}px`,
}));

function scrollToTop(event: MouseEvent) {
  if (props.target) {
    const el = targetEl.value;
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  emit('click', event);
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-in-out"
    leave-active-class="transition-opacity duration-300 ease-in-out"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed z-50 cursor-pointer"
      :style="positionStyle"
      @click="scrollToTop"
    >
      <slot>
        <button
          class="flex items-center justify-center size-10 rounded-full border-none cursor-pointer
          text-mint-700 bg-default neumorphic-sm transition-all duration-300 ease-in-out
          hover:text-mint-900 hover:shadow-(--shadow-neumorphic-hover) active:neumorphic-inset"
          aria-label="回到顶部"
        >
          <UIcon
            name="lucide:chevron-up"
            :size="20"
          />
        </button>
      </slot>
    </div>
  </Transition>
</template>
