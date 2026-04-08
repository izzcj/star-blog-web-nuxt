<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import CommonRouterPath from '~/enums/common-router-path';

const route = useRoute();
const authenticationStore = useAuthenticationStore();
const userInfoStore = useUserInfoStore();
const appSettingsStore = useAppSettingsStore();

if (authenticationStore.isLoggedIn && !userInfoStore.isFetched) {
  await userInfoStore.fetchUserInfo();
}

const pageTitle = computed(() => {
  return (route.meta.title as string | undefined) || 'Admin';
});

const displayName = computed(() => {
  return userInfoStore.nickname?.trim()
    || userInfoStore.account?.trim()
    || 'Administrator';
});

const dropdownItems = computed<DropdownMenuItem[]>(() => [
  {
    label: '退出登录',
    icon: 'lucide:log-out',
    color: 'error',
    async onSelect() {
      await authenticationStore.logout();
      await navigateTo(CommonRouterPath.HOME);
    },
  },
]);
</script>

<template>
  <UCard :ui="{ body: 'px-4 py-3 sm:px-5 sm:py-3.5' }">
    <div class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <div
          v-if="!appSettingsStore.isMobile"
          class="flex shrink-0 items-center gap-3"
        >
          <UButton
            :icon="appSettingsStore.asideCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
            color="neutral"
            variant="outline"
            size="sm"
            square
            class="rounded-xl"
            @click="appSettingsStore.toggleAsideCollapse()"
          />

          <div class="h-8 w-px bg-default" />
        </div>

        <div class="min-w-0">
          <h1 class="truncate text-lg font-semibold text-highlighted">
            {{ pageTitle }}
          </h1>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <UButton
          to="/home"
          icon="lucide:house"
          color="neutral"
          variant="ghost"
          class="hidden sm:inline-flex"
        />

        <UDropdownMenu
          :items="dropdownItems"
          :content="{ align: 'end', collisionPadding: 12 }"
        >
          <UButton
            color="neutral"
            variant="outline"
          >
            <template #leading>
              <VenusAvatar
                v-model:value="userInfoStore.avatar as string"
                :name="displayName"
                size="small"
              />
            </template>

            <span class="hidden max-w-28 truncate sm:inline">
              {{ displayName }}
            </span>
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </UCard>
</template>
