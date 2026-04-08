<script setup lang="ts">
import { adminMenuSections } from '~/constants/admin-menu';

const route = useRoute();
const appSettingsStore = useAppSettingsStore();

const collapsed = computed(() => {
  return appSettingsStore.isMobile || appSettingsStore.asideCollapsed;
});

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden bg-white/90 backdrop-blur dark:bg-neutral-900/90">
    <div
      class="border-b border-default"
      :class="collapsed ? 'p-2' : 'p-3'"
    >
      <LayoutAdminBrand :collapsed="collapsed" />
    </div>

    <div class="hidden-scrollbar flex-1 overflow-y-auto px-3 py-4">
      <div
        v-for="section in adminMenuSections"
        :key="section.title"
        class="mb-6 last:mb-0"
      >
        <p
          v-if="!collapsed"
          class="mb-2 px-3 text-xs font-medium tracking-[0.18em] text-muted uppercase"
        >
          {{ section.title }}
        </p>

        <div class="space-y-1">
          <NuxtLink
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            :title="collapsed ? item.title : undefined"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200"
            :class="[
              isActive(item.path)
                ? 'bg-primary/10 text-primary shadow-xs'
                : 'text-muted hover:bg-neutral-100 hover:text-highlighted dark:hover:bg-neutral-800',
              collapsed ? 'justify-center' : '',
            ]"
          >
            <UIcon
              :name="item.icon"
              class="h-5 w-5 shrink-0"
            />
            <span
              v-if="!collapsed"
              class="truncate font-medium"
            >
              {{ item.title }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
