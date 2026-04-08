<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { type Notice, noticeActionApis, noticeFetchApis } from '~/apis/system/notice';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '通知管理',
});

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive({
  type: '',
  title: '',
  published: undefined as boolean | undefined,
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const previewOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);
const previewData = ref<Notice | null>(null);

const formData = reactive<Notice>({
  type: '',
  title: '',
  content: '',
  published: false,
  publishedTime: '',
  remark: '',
} as Notice);

const { data, status, refresh } = await noticeFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    type: queryForm.type || undefined,
    title: queryForm.title || undefined,
    published: queryForm.published,
  })),
  immediate: false,
});

const rows = computed<Notice[]>(() => (data.value?.data ?? []) as Notice[]);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'title', header: '通知标题' },
  { accessorKey: 'type', header: '通知分类' },
  { accessorKey: 'published', header: '发布状态' },
  { accessorKey: 'publishedTime', header: '发布时间' },
  { accessorKey: 'createTime', header: '创建时间' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

watch(() => [pagination.page, pagination.size], () => {
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
  queryForm.type = '';
  queryForm.title = '';
  queryForm.published = undefined;
  handleQuery();
}

function openCreate() {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    type: '',
    title: '',
    content: '',
    published: false,
    publishedTime: '',
    remark: '',
  });
  dialogOpen.value = true;
}

function openEdit(row: Notice) {
  editing.value = true;
  Object.assign(formData, { ...row });
  dialogOpen.value = true;
}

function openPreview(row: Notice) {
  previewData.value = { ...row };
  previewOpen.value = true;
}

function validateForm(state: Notice) {
  const errors: Array<{ name: keyof Notice, message: string }> = [];

  if (!state.title.trim()) {
    errors.push({ name: 'title', message: '请输入通知标题' });
  }

  if (!state.type) {
    errors.push({ name: 'type', message: '请选择通知分类' });
  }

  if (!state.content.trim()) {
    errors.push({ name: 'content', message: '请输入通知内容' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await noticeActionApis().modify({ data: formData });
      message.success('通知修改成功');
    } else {
      await noticeActionApis().create({ data: formData });
      message.success('通知创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function togglePublished(row: Notice) {
  await noticeActionApis().togglePublished({ pathParams: { id: row.id } });
  message.success(row.published ? '通知已下线' : '通知已发布');
  await refresh();
}

async function remove(row: Notice) {
  const confirmed = await confirm.confirmDelete({ itemName: row.title });
  if (!confirmed) {
    return;
  }

  await noticeActionApis().delete({ pathParams: { id: row.id } });
  message.success('通知删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
          <VenusSelect
            v-model="queryForm.type"
            class="min-w-52"
            :option-type="DataOptionType.DICT"
            option-key="notice-type"
            placeholder="请选择通知分类"
          />
          <UInput
            v-model="queryForm.title"
            placeholder="按通知标题搜索"
            icon="i-lucide-search"
            class="min-w-64"
            @keyup.enter="handleQuery"
          />
          <VenusSelect
            v-model="queryForm.published"
            class="min-w-44"
            :option-type="DataOptionType.CONST"
            :option-key="[{ label: '已发布', value: true }, { label: '未发布', value: false }]"
            placeholder="请选择状态"
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

        <UButton
          icon="i-lucide-plus"
          @click="openCreate"
        >
          新增通知
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
        empty="暂无通知数据。"
        loading-text="正在加载通知..."
      >
        <template #title-cell="{ row }">
          <div class="max-w-80 truncate font-medium text-highlighted">
            {{ row.original.title }}
          </div>
        </template>

        <template #type-cell="{ row }">
          {{ row.original.typeName || row.original.type }}
        </template>

        <template #published-cell="{ row }">
          <UBadge
            :color="row.original.published ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.published ? '已发布' : '未发布' }}
          </UBadge>
        </template>

        <template #publishedTime-cell="{ row }">
          {{ row.original.publishedTime || '-' }}
        </template>

        <template #createTime-cell="{ row }">
          {{ row.original.createTime || '-' }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              @click="openPreview(row.original)"
            >
              预览
            </UButton>
            <UButton
              size="sm"
              variant="soft"
              @click="openEdit(row.original)"
            >
              修改
            </UButton>
            <UButton
              size="sm"
              color="warning"
              variant="soft"
              @click="togglePublished(row.original)"
            >
              {{ row.original.published ? '取消发布' : '发布' }}
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

    <UModal
      v-model:open="dialogOpen"
      :title="editing ? '修改通知' : '新增通知'"
      :ui="{ content: 'sm:max-w-6xl' }"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            label="通知标题"
            name="title"
            required
          >
            <UInput
              v-model="formData.title"
              class="w-full"
              placeholder="请输入通知标题"
            />
          </UFormField>
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField
              label="通知分类"
              name="type"
              required
            >
              <VenusSelect
                v-model="formData.type"
                class="w-2/4"
                :option-type="DataOptionType.DICT"
                option-key="notice-type"
                placeholder="请选择通知分类"
              />
            </UFormField>
            <UFormField label="是否发布">
              <USwitch
                v-model="formData.published"
                class="w-2/4"
              />
            </UFormField>
          </div>
          <UFormField
            label="通知内容"
            name="content"
            required
          >
            <VenusVdMdEditor
              v-model="formData.content"
              :height="500"
            />
          </UFormField>
          <UFormField
            label="备注"
            name="remark"
          >
            <UTextarea
              v-model="formData.remark"
              class="w-full"
              :rows="3"
              placeholder="请输入备注"
            />
          </UFormField>
          <div class="flex justify-end gap-2 pt-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="dialogOpen = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              :loading="submitting"
            >
              确定
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="previewOpen"
      :title="previewData?.title || '通知预览'"
      :ui="{ content: 'sm:max-w-5xl' }"
    >
      <template #body>
        <div class="space-y-3">
          <div class="flex flex-wrap gap-2 text-sm text-muted">
            <UBadge
              :color="previewData?.published ? 'success' : 'neutral'"
              variant="soft"
            >
              {{ previewData?.published ? '已发布' : '未发布' }}
            </UBadge>
            <span>{{ previewData?.publishedTime || '未设置发布时间' }}</span>
          </div>
          <div class="rounded-2xl border border-default p-4">
            <VenusVdMdEditor
              v-if="previewData"
              v-model="previewData.content"
              :height="500"
              :preview="true"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
