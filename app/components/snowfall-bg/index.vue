<script setup lang="ts">
import { snowfallBgProps } from './props';

const props = defineProps({
  ...snowfallBgProps,
});

interface Snowflake {
  x: number
  y: number
  size: number
  alpha: number
  dx: number
  dy: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContainerRef = ref<HTMLDivElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const snowflakes = ref<Snowflake[]>([]);
const canvasSize = reactive<{ w: number, h: number }>({ w: 0, h: 0 });
const { pixelRatio } = useDevicePixelRatio();

const color = computed(() => {
  const hex = props.color.replace(/^#/, '').padStart(6, '0');
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
});

onMounted(() => {
  if (canvasRef.value) {
    context.value = canvasRef.value.getContext('2d');
  }
  initCanvas();
  animate();
  window.addEventListener('resize', initCanvas);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', initCanvas);
});

function initCanvas() {
  resizeCanvas();
  createSnowflakes();
}

function resizeCanvas() {
  if (canvasContainerRef.value && canvasRef.value && context.value) {
    snowflakes.value.length = 0;
    canvasSize.w = canvasContainerRef.value.offsetWidth;
    canvasSize.h = canvasContainerRef.value.offsetHeight;
    canvasRef.value.width = canvasSize.w * pixelRatio.value;
    canvasRef.value.height = canvasSize.h * pixelRatio.value;
    canvasRef.value.style.width = `${canvasSize.w}px`;
    canvasRef.value.style.height = `${canvasSize.h}px`;
    context.value.scale(pixelRatio.value, pixelRatio.value);
  }
}

function createSnowflakes() {
  for (let i = 0; i < props.quantity; i++) {
    const snowflake = createSnowflake();
    snowflakes.value.push(snowflake);
  }
}

function createSnowflake(): Snowflake {
  const x = Math.random() * canvasSize.w;
  const y = Math.random() * canvasSize.h;
  const size = Math.random() * (props.maxRadius! - props.minRadius!) + props.minRadius!;
  const alpha = Math.random() * 0.5 + 0.5;
  const dx = (Math.random() - 0.5) * 0.5;
  const dy = Math.random() * 0.25 + props.speed;
  return { x, y, size, alpha, dx, dy };
}

function drawSnowflake(snowflake: Snowflake) {
  if (context.value) {
    const { x, y, size, alpha } = snowflake;
    context.value.beginPath();
    context.value.arc(x, y, size, 0, Math.PI * 2);
    context.value.fillStyle = `rgba(${color.value.split(' ').join(', ')}, ${alpha})`;
    context.value.fill();
  }
}

function animate() {
  if (context.value) {
    context.value.clearRect(0, 0, canvasSize.w, canvasSize.h);
  }

  snowflakes.value.forEach(snowflake => {
    snowflake.x += snowflake.dx;
    snowflake.y += snowflake.dy;

    if (snowflake.y > canvasSize.h) {
      snowflake.y = -snowflake.size;
      snowflake.x = Math.random() * canvasSize.w;
    }

    drawSnowflake(snowflake);
  });

  requestAnimationFrame(animate);
}
</script>

<template>
  <div
    ref="canvasContainerRef"
    :class="$props.class"
    aria-hidden="true"
  >
    <canvas ref="canvasRef" />
  </div>
</template>
