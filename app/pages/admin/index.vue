<script setup lang="ts">
import { adminMenuSections } from '~/constants/admin-menu';
import { statInfoFetchApis } from '~/apis/system/stat-info';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '仪表盘',
});

interface StatInfo {
  viewCount?: number
  articleCount?: number
  commentCount?: number
}

const { data, status, refresh } = await statInfoFetchApis().fetchAccumulativeStatInfo();

const stats = computed(() => {
  const statInfo = (data.value ?? {}) as StatInfo;

  return [
    {
      title: '浏览量',
      value: statInfo.viewCount ?? 0,
      icon: 'lucide:eye',
    },
    {
      title: '文章数',
      value: statInfo.articleCount ?? 0,
      icon: 'lucide:file-text',
    },
    {
      title: '评论数',
      value: statInfo.commentCount ?? 0,
      icon: 'lucide:messages-square',
    },
  ];
});

const quickLinks = computed(() => {
  return adminMenuSections.flatMap(section => section.items).filter(item => item.path !== '/admin');
});
</script>

<template>
  <div class="space-y-4">
    <section class="grid gap-4 md:grid-cols-3">
      <UCard
        v-for="item in stats"
        :key="item.title"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm text-muted">
              {{ item.title }}
            </p>
            <p class="mt-2 text-3xl font-semibold text-highlighted">
              {{ item.value }}
            </p>
          </div>

          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UIcon
              :name="item.icon"
              class="h-6 w-6"
            />
          </div>
        </div>
      </UCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted">
                快捷入口
              </p>
              <h2 class="text-lg font-semibold text-highlighted">
                常用管理操作
              </h2>
            </div>

            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              :loading="status === 'pending'"
              @click="refresh()"
            >
              刷新
            </UButton>
          </div>
        </template>

        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.path"
            :to="item.path"
            class="rounded-2xl border border-default bg-default px-4 py-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UIcon
                  :name="item.icon"
                  class="h-5 w-5"
                />
              </div>

              <div class="min-w-0">
                <p class="truncate font-medium text-highlighted">
                  {{ item.title }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ item.path }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </UCard>
    </section>
  </div>
</template>
