<script setup lang="ts">
import HomeComponentCard from '../home-component-card.vue';
import { tagFetchApis } from '~/apis/blog/tag';

// 热门标签列表
const hotTags = ref<Tag[]>([]);

const res = await tagFetchApis().fetchHot();
hotTags.value = res.data.value ?? [];
</script>

<template>
  <HomeComponentCard
    title="热门标签"
    title-icon="venus:hot-tag"
  >
    <div class="min-h-20">
      <div
        v-if="hotTags.length"
        class="flex flex-wrap gap-2"
      >
        <VenusTag
          v-for="tag of hotTags"
          :key="tag.id"
          :tag="tag"
        />
      </div>
      <UEmpty
        v-else
        description="暂无标签"
      />
    </div>
  </HomeComponentCard>
</template>

<style scoped lang="scss">
</style>
