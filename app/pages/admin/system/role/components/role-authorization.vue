<script setup lang="ts">
import { userActionApis, userFetchApis } from '~/apis/system/user';

interface Props {
  roleId: string
  roleName: string
}

const props = defineProps<Props>();

const emit = defineEmits<{
  changed: []
}>();

const message = useMessage();
const confirm = useConfirm();

const authorizedQuery = reactive({
  nickname: '',
});

const authorizedPagination = reactive({
  page: 1,
  size: 10,
});

const authorizedSelectedIds = ref<string[]>([]);

const roleId = computed(() => props.roleId);

const { data: authorizedData, status: authorizedStatus, refresh: refreshAuthorized } = await userFetchApis().fetchAllocatedPage({
  pathParams: computed(() => ({ roleId: roleId.value })),
  params: {
    page: authorizedPagination.page,
    size: authorizedPagination.size,
    nickname: authorizedQuery.nickname || undefined,
  },
  immediate: false,
});

const selectUserOpen = ref(false);
const unauthorizedQuery = reactive({
  nickname: '',
});
const unauthorizedPagination = reactive({
  page: 1,
  size: 10,
});
const unauthorizedSelectedIds = ref<string[]>([]);

const { data: unauthorizedData, status: unauthorizedStatus, refresh: refreshUnauthorized } = await userFetchApis().fetchUnallocatedPage({
  pathParams: computed(() => ({ roleId: roleId.value })),
  params: computed(() => ({
    page: unauthorizedPagination.page,
    size: unauthorizedPagination.size,
    nickname: unauthorizedQuery.nickname || undefined,
  })),
  immediate: false,
});

const authorizedUsers = computed(() => authorizedData.value?.data ?? []);
const authorizedTotal = computed(() => authorizedData.value?.total ?? 0);
const unauthorizedUsers = computed(() => unauthorizedData.value?.data ?? []);
const unauthorizedTotal = computed(() => unauthorizedData.value?.total ?? 0);

const authorizedTableColumns = [
  { id: 'select', header: '选择', meta: { class: { th: 'w-16', td: 'w-16' } } },
  { accessorKey: 'account', header: '账号' },
  { accessorKey: 'nickname', header: '昵称' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'createTime', header: '创建时间' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

const unauthorizedTableColumns = [
  { id: 'select', header: '选择', meta: { class: { th: 'w-16', td: 'w-16' } } },
  { accessorKey: 'account', header: '账号' },
  { accessorKey: 'nickname', header: '昵称' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'createTime', header: '创建时间' },
];

watch(() => props.roleId, async (value) => {
  if (!value) {
    return;
  }

  authorizedSelectedIds.value = [];
  unauthorizedSelectedIds.value = [];

  await refreshAuthorized();
}, { immediate: true });

watch(() => [authorizedPagination.page, authorizedPagination.size], () => {
  authorizedSelectedIds.value = [];
  void refreshAuthorized();
});

watch(() => [unauthorizedPagination.page, unauthorizedPagination.size], () => {
  if (!selectUserOpen.value) {
    return;
  }

  unauthorizedSelectedIds.value = [];
  void refreshUnauthorized();
});

function toggleAuthorizedSelection(id: string, checked: boolean) {
  if (checked) {
    if (!authorizedSelectedIds.value.includes(id)) {
      authorizedSelectedIds.value = [...authorizedSelectedIds.value, id];
    }
    return;
  }

  authorizedSelectedIds.value = authorizedSelectedIds.value.filter(item => item !== id);
}

function toggleUnauthorizedSelection(id: string, checked: boolean) {
  if (checked) {
    if (!unauthorizedSelectedIds.value.includes(id)) {
      unauthorizedSelectedIds.value = [...unauthorizedSelectedIds.value, id];
    }
    return;
  }

  unauthorizedSelectedIds.value = unauthorizedSelectedIds.value.filter(item => item !== id);
}

function handleAuthorizedQuery() {
  authorizedPagination.page = 1;
  void refreshAuthorized();
}

function handleAuthorizedReset() {
  authorizedQuery.nickname = '';
  handleAuthorizedQuery();
}

async function removeAuthorization(userIds: string[]) {
  if (!userIds.length) {
    return;
  }

  await userActionApis().cancelAuthorization({
    data: {
      roleId: props.roleId,
      userIds,
    },
  });

  message.success('取消授权成功');
  authorizedSelectedIds.value = [];

  await refreshAuthorized();
  emit('changed');
}

async function handleRemoveOne(user: User) {
  const confirmed = await confirm.confirm({
    title: '取消授权',
    description: '该用户将不再拥有当前角色。',
    content: `确定移除 ${user.nickname || user.account} 的授权吗？`,
    confirmColor: 'error',
    confirmText: '移除',
  });

  if (!confirmed) {
    return;
  }

  await removeAuthorization([user.id]);
}

async function handleBatchRemove() {
  if (!authorizedSelectedIds.value.length) {
    return;
  }

  const confirmed = await confirm.confirm({
    title: '批量移除授权',
    description: '批量移除后需要重新授权才能恢复。',
    content: `确定移除 ${authorizedSelectedIds.value.length} 个用户的授权吗？`,
    confirmColor: 'error',
    confirmText: '批量移除',
  });

  if (!confirmed) {
    return;
  }

  await removeAuthorization(authorizedSelectedIds.value);
}

async function openSelectUserModal() {
  unauthorizedQuery.nickname = '';
  unauthorizedPagination.page = 1;
  unauthorizedPagination.size = 10;
  unauthorizedSelectedIds.value = [];
  selectUserOpen.value = true;
  await refreshUnauthorized();
}

function handleUnauthorizedQuery() {
  unauthorizedPagination.page = 1;
  void refreshUnauthorized();
}

function handleUnauthorizedReset() {
  unauthorizedQuery.nickname = '';
  handleUnauthorizedQuery();
}

async function batchAuthorize() {
  if (!unauthorizedSelectedIds.value.length) {
    return;
  }

  await userActionApis().authorization({
    data: {
      roleId: props.roleId,
      userIds: unauthorizedSelectedIds.value,
    },
  });

  message.success('授权成功');
  selectUserOpen.value = false;
  unauthorizedSelectedIds.value = [];

  await refreshAuthorized();
  emit('changed');
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div class="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
        <UInput
          v-model="authorizedQuery.nickname"
          placeholder="按用户昵称筛选"
          icon="i-lucide-search"
          class="min-w-60"
          @keyup.enter="handleAuthorizedQuery"
        />

        <div class="flex gap-2">
          <UButton @click="handleAuthorizedQuery">
            查询
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            @click="handleAuthorizedReset"
          >
            重置
          </UButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-user-plus"
          @click="openSelectUserModal"
        >
          新增授权
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="soft"
          :disabled="!authorizedSelectedIds.length"
          @click="handleBatchRemove"
        >
          批量移除（{{ authorizedSelectedIds.length }}）
        </UButton>
      </div>
    </div>

    <UTable
      :columns="authorizedTableColumns"
      :data="authorizedStatus === 'pending' ? [] : authorizedUsers"
      :loading="authorizedStatus === 'pending'"
    >
      <template #select-cell="{ row }">
        <input
          :checked="authorizedSelectedIds.includes(row.original.id)"
          type="checkbox"
          class="h-4 w-4 rounded border-default"
          @change="toggleAuthorizedSelection(row.original.id, ($event.target as HTMLInputElement).checked)"
        >
      </template>

      <template #account-cell="{ row }">
        <div class="text-highlighted">
          {{ row.original.account }}
        </div>
      </template>

      <template #nickname-cell="{ row }">
        {{ row.original.nickname }}
      </template>

      <template #email-cell="{ row }">
        {{ row.original.email || '-' }}
      </template>

      <template #createTime-cell="{ row }">
        {{ row.original.createTime || '-' }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton
            color="error"
            variant="soft"
            size="sm"
            @click="handleRemoveOne(row.original)"
          >
            移除
          </UButton>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end">
      <VenusPagination
        v-model:page="authorizedPagination.page"
        v-model:page-size="authorizedPagination.size"
        :total="authorizedTotal"
      />
    </div>

    <UModal
      v-model:open="selectUserOpen"
      title="选择用户"
      :ui="{ content: 'sm:max-w-5xl' }"
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              <UInput
                v-model="unauthorizedQuery.nickname"
                placeholder="按用户昵称筛选"
                icon="i-lucide-search"
                class="min-w-60"
                @keyup.enter="handleUnauthorizedQuery"
              />

              <div class="flex gap-2">
                <UButton @click="handleUnauthorizedQuery">
                  查询
                </UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="handleUnauthorizedReset"
                >
                  重置
                </UButton>
              </div>
            </div>

            <div class="text-sm text-muted">
              为角色 “{{ roleName }}” 追加用户
            </div>
          </div>

          <UTable
            :columns="unauthorizedTableColumns"
            :data="unauthorizedStatus === 'pending' ? [] : unauthorizedUsers"
            :loading="unauthorizedStatus === 'pending'"
          >
            <template #select-cell="{ row }">
              <input
                :checked="unauthorizedSelectedIds.includes(row.original.id)"
                type="checkbox"
                class="h-4 w-4 rounded border-default"
                @change="toggleUnauthorizedSelection(row.original.id, ($event.target as HTMLInputElement).checked)"
              >
            </template>

            <template #account-cell="{ row }">
              <div class="text-highlighted">
                {{ row.original.account }}
              </div>
            </template>

            <template #nickname-cell="{ row }">
              {{ row.original.nickname }}
            </template>

            <template #email-cell="{ row }">
              {{ row.original.email || '-' }}
            </template>

            <template #createTime-cell="{ row }">
              {{ row.original.createTime || '-' }}
            </template>
          </UTable>

          <div class="flex justify-end">
            <VenusPagination
              v-model:page="unauthorizedPagination.page"
              v-model:page-size="unauthorizedPagination.size"
              :total="unauthorizedTotal"
            />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full items-center justify-between gap-2">
          <span class="text-sm text-muted">
            已选 {{ unauthorizedSelectedIds.length }} 个用户
          </span>

          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="selectUserOpen = false"
            >
              取消
            </UButton>
            <UButton
              :disabled="!unauthorizedSelectedIds.length"
              @click="batchAuthorize"
            >
              确认授权
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
