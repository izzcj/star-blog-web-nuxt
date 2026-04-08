<script setup lang="ts">
import HomeComponentCard from '../home-component-card.vue';
import { statInfoFetchApis } from '~/apis/system/stat-info';

// 统计数据
const viewCount = ref(0);
const articleCount = ref(0);
const commentCount = ref(0);
const runningDays = ref(0);
const animationDuration = 2000;

const displayViewCount = useTransition(viewCount, {
  duration: animationDuration,
});
const displayArticleCount = useTransition(articleCount, {
  duration: animationDuration,
});
const displayCommentCount = useTransition(commentCount, {
  duration: animationDuration,
});
const displayRunningDays = useTransition(runningDays, {
  duration: animationDuration,
});

const statItems = computed(() => [
  { label: '访客数', value: displayViewCount, icon: 'lucide:users' },
  { label: '文章数', value: displayArticleCount, icon: 'lucide:file-text' },
  { label: '评论数', value: displayCommentCount, icon: 'lucide:message-circle' },
  { label: '运行天数', value: displayRunningDays, icon: 'lucide:clock' },
]);

const res = await statInfoFetchApis().fetchAccumulativeStatInfo();
const statInfo = res.data.value;
viewCount.value = statInfo?.viewCount ?? 0;
articleCount.value = statInfo?.articleCount ?? 0;
commentCount.value = statInfo?.commentCount ?? 0;

// 计算运营天数
const startDate = new Date('2026-03-25');
const today = new Date();
const diffTime = Math.abs(today.getTime() - startDate.getTime());
runningDays.value = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
</script>

<template>
  <HomeComponentCard
    title="网站统计"
    title-icon="venus:stat"
  >
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="item in statItems"
        :key="item.label"
        class="stat-item"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5 mb-1 text-gray-500">
            <UIcon
              :name="item.icon"
              class="size-4"
            />
            <span class="text-sm">{{ item.label }}</span>
          </div>
          <span class="text-2xl font-bold text-gray-800">{{ Math.round(item.value.value) }}</span>
        </div>
      </div>
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
.stat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    opacity: 0.8;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

    &::before {
      opacity: 1;
    }
  }
}
</style>
