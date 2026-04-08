<script setup lang="ts">
import HomeComponentCard from '../home-component-card.vue';
import ActivityType from '@/enums/activity-type';
import { activityFetchApis, type ActivityItem } from '~/apis/blog/activity';

// 最新动态列表
const activities = ref<ActivityItem[]>([]);

const res = await activityFetchApis().fetchPage({
  params: {
    page: 1,
    size: 5,
  },
});
activities.value = res.data.value?.data ?? [];

/**
 * 获取活动类型图标
 *
 * @param type 活动类型
 */
function getActivityIcon(type: ActivityItem['type']): string {
  switch (type) {
    case ActivityType.COMMENT:
      return '💬';
    case ActivityType.ARTICLE:
      return '📝';
    case ActivityType.REPLY:
      return '↩️';
    default:
      return '📌';
  }
}

/**
 * 跳转到文章详情
 *
 * @param articleId 文章ID
 */
function goToArticle(articleId?: string) {
  if (articleId) {
    navigateTo({ name: 'ArticleDetails', params: { id: articleId } });
  }
}
</script>

<template>
  <HomeComponentCard
    title="最新动态"
    title-icon="venus:new-activity"
    body-class="p-0! custom-scrollbar max-h-[260px] overflow-y-auto"
  >
    <div class="flex flex-col">
      <div
        v-for="activity of activities"
        :key="activity.id"
        class="group cursor-pointer flex py-3 px-4 border-b-[1px_solid_#f5f5f5] last:border-b-0 transition-colors duration-200 hover:bg-gray-200"
        @click="goToArticle(activity.articleId)"
      >
        <div class="w-6 h-6 text-xl mr-3 shrink-0 flex items-center justify-center">
          {{ getActivityIcon(activity.type) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center mb-1.5">
            <VenusAvatar
              v-model:value="activity.userAvatar"
              :size="28"
              class="mr-2 shrink-0"
            />
            <span class="text-[14px] text-[#333] font-semibold">{{ activity.userNickname }}</span>
          </div>
          <div class="text-[13px] text-[#333] mb-1 leading-normal">
            <template v-if="activity.type === ActivityType.COMMENT || activity.type === ActivityType.REPLY">
              评论了《<span class="text-[#333] font-semibold transition-colors duration-200 group-hover:text-[#409eff]">{{ activity.articleTitle }}</span>》
            </template>
            <template v-else-if="activity.type === ActivityType.ARTICLE">
              发表了新文章《<span class="text-[#333] font-semibold transition-colors duration-200 group-hover:text-[#409eff]">{{ activity.articleTitle }}</span>》
            </template>
          </div>
          <div
            v-if="activity.content"
            class="text-xs text-[#999] leading-normal mb-1 py-1.5 px-2.5 bg-[#f5f7fa] rounded-md truncate"
          >
            {{ activity.content }}
          </div>
          <div class="text-xs text-[#999]">
            {{ formatRelativeTime(activity.createTime) }}
          </div>
        </div>
      </div>
      <UEmpty
        v-if="activities.length === 0"
        description="暂无动态"
      />
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
</style>
