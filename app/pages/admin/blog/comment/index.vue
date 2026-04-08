<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { commentActionApis, commentFetchApis } from '~/apis/blog/comment';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '评论管理',
});

interface CommentQueryParams {
  status: string
  createTimeBegin: string
  createTimeEnd: string
}

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive<CommentQueryParams>({
  status: '',
  createTimeBegin: '',
  createTimeEnd: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const selectedIds = ref<string[]>([]);

const { data, status, refresh } = await commentFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    status: queryForm.status || undefined,
    createTimeBegin: queryForm.createTimeBegin || undefined,
    createTimeEnd: queryForm.createTimeEnd || undefined,
  })),
  immediate: false,
});

const rows = computed<Comment[]>(() => (data.value?.data ?? []) as Comment[]);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { id: 'select', header: '选择', meta: { class: { th: 'w-16', td: 'w-16' } } },
  { accessorKey: 'content', header: '评论内容' },
  { accessorKey: 'userNickname', header: '用户' },
  { accessorKey: 'status', header: '状态' },
  { accessorKey: 'createTime', header: '创建时间' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

const statusColors: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
  PENDING: 'warning',
  PASS: 'success',
  REJECT: 'error',
};

watch(() => [pagination.page, pagination.size], () => {
  selectedIds.value = [];
  void refresh();
});

onMounted(() => {
  void refresh();
});

function handleQuery() {
  pagination.page = 1;
  void refresh();
}

function handleReset() {
  queryForm.status = '';
  queryForm.createTimeBegin = '';
  queryForm.createTimeEnd = '';
  handleQuery();
}

function toggleSelection(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id];
    }
    return;
  }

  selectedIds.value = selectedIds.value.filter(item => item !== id);
}

async function auditComments(ids: string[], auditStatus: 'PASS' | 'REJECT', rejectReason?: string) {
  if (!ids.length) {
    return;
  }

  await commentActionApis().batchAudit({
    data: {
      ids,
      status: auditStatus,
      rejectReason,
    },
  });

  message.success('评论审核成功');
  selectedIds.value = [];
  await refresh();
}

function handleBatchPass() {
  void auditComments(selectedIds.value, 'PASS');
}

async function handleBatchReject() {
  if (!selectedIds.value.length) {
    return;
  }

  const reason = import.meta.client ? window.prompt('请输入驳回原因')?.trim() : '';
  if (!reason) {
    return;
  }

  await auditComments(selectedIds.value, 'REJECT', reason);
}

function handlePass(row: Comment) {
  void auditComments([row.id], 'PASS');
}

async function handleReject(row: Comment) {
  const reason = import.meta.client ? window.prompt('请输入驳回原因')?.trim() : '';
  if (!reason) {
    return;
  }

  await auditComments([row.id], 'REJECT', reason);
}

async function remove(row: Comment) {
  const confirmed = await confirm.confirmDelete({ itemName: row.content.slice(0, 12) || '该评论' });
  if (!confirmed) {
    return;
  }

  await commentActionApis().delete({ pathParams: { id: row.id } });
  message.success('评论删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
          <VenusSelect
            v-model="queryForm.status"
            class="min-w-52"
            :option-type="DataOptionType.ENUM"
            option-key="com.ale.starblog.admin.blog.enums.CommentStatus"
            placeholder="请选择状态"
          />

          <UInput
            :model-value="queryForm.createTimeBegin"
            type="datetime-local"
            class="min-w-56"
            @update:model-value="queryForm.createTimeBegin = formatDateTime($event as string)"
          />

          <UInput
            :model-value="queryForm.createTimeEnd"
            type="datetime-local"
            class="min-w-56"
            @update:model-value="queryForm.createTimeEnd = formatDateTime($event as string)"
          />

          <div class="flex gap-2">
            <UButton @click="handleQuery">
              查询
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="handleReset"
            >
              重置
            </UButton>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UButton
            color="success"
            variant="soft"
            :disabled="!selectedIds.length"
            @click="handleBatchPass"
          >
            批量通过
          </UButton>
          <UButton
            color="warning"
            variant="soft"
            :disabled="!selectedIds.length"
            @click="handleBatchReject"
          >
            批量驳回
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
        empty="暂无评论数据。"
        loading-text="正在加载评论..."
      >
        <template #select-cell="{ row }">
          <input
            :checked="selectedIds.includes(row.original.id)"
            :disabled="row.original.status !== 'PENDING'"
            type="checkbox"
            class="h-4 w-4 rounded border-default"
            @change="toggleSelection(row.original.id, ($event.target as HTMLInputElement).checked)"
          >
        </template>

        <template #content-cell="{ row }">
          <div class="max-w-96 truncate">
            {{ row.original.content }}
          </div>
        </template>

        <template #userNickname-cell="{ row }">
          <div class="flex items-center gap-3">
            <VenusAvatar
              v-model:value="row.original.userAvatar"
              :name="row.original.userNickname || row.original.userName"
              size="small"
            />
            <span>{{ row.original.userNickname || row.original.userName || '-' }}</span>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="statusColors[row.original.status] || 'neutral'"
            variant="soft"
          >
            {{ row.original.statusName || row.original.status }}
          </UBadge>
        </template>

        <template #createTime-cell="{ row }">
          {{ row.original.createTime || '-' }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              v-if="row.original.status === 'PENDING'"
              size="sm"
              color="success"
              variant="soft"
              @click="handlePass(row.original)"
            >
              通过
            </UButton>
            <UButton
              v-if="row.original.status === 'PENDING'"
              size="sm"
              color="warning"
              variant="soft"
              @click="handleReject(row.original)"
            >
              驳回
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="soft"
              @click="remove(row.original)"
            >
              删除
            </UButton>
          </div>
        </template>
      </UTable>

      <div class="mt-4 flex justify-end">
        <VenusPagination
          v-model:page="pagination.page"
          v-model:page-size="pagination.size"
          :total="total"
        />
      </div>
    </UCard>
  </div>
</template>
