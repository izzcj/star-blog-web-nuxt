<script setup lang="ts">
import { animate } from 'animejs';

// 配置
const siteName = '正在前往星站....';
const appStatusStore = useAppStatusStore();
const resourceLoaded = computed(() => appStatusStore.resourceLoadStatus);

const siteNameRef = ref();

onMounted(() => {
  const letters = siteNameRef.value.querySelectorAll('.letter');

  animate(letters, {
    // 上下浮动
    translateY: () => [0, -6, 0],
    duration: 1500,
    // 每个字延迟
    delay: (_, i) => i * 150,
    ease: 'easeInOutSine',
    loop: true,
  });
});
</script>

<template>
  <div
    id="loader-wrapper"
    :class="resourceLoaded ? 'loaded' : null"
  >
    <div class="loader">
      <div class="loader-circle" />
      <div class="loader-text">
        <span
          ref="siteNameRef"
          class="name"
        >
          <template
            v-for="(char) of siteName.split('')"
            :key="char"
          >
            <span class="letter">{{ char }}</span>
          </template>
        </span>
      </div>
    </div>
    <div class="loader-section section-left" />
    <div class="loader-section section-right" />
  </div>
</template>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden;
  .loader {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // 圆形加载动画
    .loader-circle {
      position: relative;
      width: 40px;
      height: 40px;
      background: #fff;
      border-radius: 50%;
      z-index: 2;

      &::before,
      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.6);
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 1;
        animation: ripple 2s infinite;
      }

      &::after {
        animation-delay: 1s;
      }
    }
    // 文字加载动画
    .loader-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #fff;
      z-index: 2;
      margin-top: 40px;
      font-size: 24px;

      .name {
        display: flex;
        gap: 2px;
      }

      .letter {
        display: inline-block;
      }
    }
  }
  // 加载完成动画
  .loader-section {
    position: fixed;
    top: 0;
    width: 51%;
    height: 100%;
    background: rgba(0, 0, 0);
    z-index: 1;
    &.section-left {
      left: 0;
    }
    &.section-right {
      right: 0;
    }
  }
  &.loaded {
    visibility: hidden;
    transform: translateY(-100%);
    transition:
      transform 0.3s 1s ease-out,
      visibility 0.3s 1s ease-out;
    .loader {
      .loader-circle,
      .loader-text {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
    }
    .loader-section {
      &.section-left {
        transform: translateX(-100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      &.section-right {
        transform: translateX(100%);
        transition: transform 0.5s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}
</style>
