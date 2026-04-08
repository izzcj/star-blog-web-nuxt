<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const authenticationStore = useAuthenticationStore();
const userInfoStore = useUserInfoStore();
const profileOpen = ref(false);

if (authenticationStore.isLoggedIn && !userInfoStore.isFetched) {
  await userInfoStore.fetchUserInfo();
}

const isLoggedIn = computed(() => authenticationStore.isLoggedIn);

const displayName = computed(() => {
  return userInfoStore.nickname?.trim()
    || userInfoStore.account?.trim()
    || '已登录用户';
});

const userItems = computed<DropdownMenuItem[][]>(() => {
  const infoGroup: DropdownMenuItem[] = [{
    label: displayName.value,
    type: 'label',
  }];

  const summaryGroup: DropdownMenuItem[] = [];

  if (userInfoStore.account) {
    summaryGroup.push({
      label: `账号：${userInfoStore.account}`,
      icon: 'lucide:at-sign',
      disabled: true,
    });
  }

  if (userInfoStore?.email) {
    summaryGroup.push({
      label: `邮箱：${userInfoStore.email}`,
      icon: 'lucide:mail',
      disabled: true,
    });
  }

  const actionGroup: DropdownMenuItem[] = [{
    label: '个人信息',
    icon: 'lucide:user-round',
    async onSelect() {
      profileOpen.value = true;
    },
  }];

  if (userInfoStore?.admin) {
    actionGroup.push({
      label: '管理后台',
      icon: 'lucide:layout-dashboard',
      to: '/admin',
    });
  }

  actionGroup.push({
    label: '退出登录',
    icon: 'lucide:log-out',
    color: 'error',
    async onSelect() {
      await authenticationStore.logout();
      location.reload();
    },
  });

  return [infoGroup, ...(summaryGroup.length > 0 ? [summaryGroup] : []), actionGroup];
});
</script>

<template>
  <div class="flex items-center gap-1 sm:gap-2">
    <USlideover
      v-model:open="profileOpen"
      side="right"
      :ui="{ content: 'w-full sm:max-w-2xl p-4 sm:p-6' }"
    >
      <template #content>
        <UserProfileSlideoverContent />
      </template>
    </USlideover>

    <UDropdownMenu
      v-if="isLoggedIn"
      class="cursor-pointer"
      :items="userItems"
      :content="{ collisionPadding: 12 }"
      :ui="{ content: 'min-w-64' }"
    >
      <UButton
        color="neutral"
        variant="ghost"
        class="max-w-52"
      >
        <template #leading>
          <VenusAvatar
            v-if="userInfoStore.avatar"
            v-model:value="userInfoStore.avatar"
          />
        </template>
      </UButton>
    </UDropdownMenu>

    <UButton
      v-else
      to="/login"
      color="neutral"
      variant="outline"
      label="登录"
    />
  </div>
</template>
