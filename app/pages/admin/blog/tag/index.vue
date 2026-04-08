<script setup lang="ts">
import { tagActionApis, tagFetchApis } from '~/apis/blog/tag';

interface TagQueryParams {
  name: string
}

interface TagForm {
  id?: string
  name: string
  icon: string
  color: string
  description: string
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '标签管理',
});

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive<TagQueryParams>({
  name: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);

const formData = reactive<TagForm>({
  name: '',
  icon: '',
  color: '#3b82f6',
  description: '',
});

const { data, status, refresh } = await tagFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    name: queryForm.name || undefined,
  })),
  immediate: false,
});

const rows = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'name', header: '标签名称' },
  { accessorKey: 'style', header: '标签样式' },
  { accessorKey: 'description', header: '描述' },
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
  queryForm.name = '';
  handleQuery();
}

function openCreate() {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    name: '',
    icon: '',
    color: '#3b82f6',
    description: '',
  });
  dialogOpen.value = true;
}

function openEdit(row: Tag) {
  editing.value = true;
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color || '#3b82f6',
    description: row.description || '',
  });
  dialogOpen.value = true;
}

function validateForm(state: TagForm) {
  const errors: Array<{ name: keyof TagForm, message: string }> = [];

  if (!state.name.trim()) {
    errors.push({ name: 'name', message: '请输入标签名称' });
  }

  if (!state.color.trim()) {
    errors.push({ name: 'color', message: '请输入标签颜色' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await tagActionApis().modify({ data: formData });
      message.success('标签修改成功');
    } else {
      await tagActionApis().create({ data: formData });
      message.success('标签创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: Tag) {
  const confirmed = await confirm.confirmDelete({ itemName: row.name });
  if (!confirmed) {
    return;
  }

  await tagActionApis().delete({ pathParams: { id: row.id } });
  message.success('标签删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
          <UInput
            v-model="queryForm.name"
            placeholder="按标签名称搜索"
            icon="i-lucide-search"
            class="min-w-60"
            @keyup.enter="handleQuery"
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
          新增标签
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
        empty="暂无标签数据。"
        loading-text="正在加载标签..."
      >
        <template #name-cell="{ row }">
          <div class="font-medium text-highlighted">
            {{ row.original.name }}
          </div>
        </template>

        <template #style-cell="{ row }">
          <VenusTag :tag="row.original" />
        </template>

        <template #description-cell="{ row }">
          {{ row.original.description || '-' }}
        </template>

        <template #createTime-cell="{ row }">
          {{ row.original.createTime || '-' }}
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              variant="soft"
              @click="openEdit(row.original)"
            >
              修改
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
      :title="editing ? '修改标签' : '新增标签'"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            label="标签名称"
            name="name"
            required
          >
            <UInput
              v-model="formData.name"
              class="w-full"
              placeholder="请输入标签名称"
            />
          </UFormField>

          <UFormField
            label="标签图标"
            name="icon"
          >
            <IconSelector v-model="formData.icon" />
          </UFormField>

          <UFormField
            label="标签颜色"
            name="color"
            required
          >
            <div class="flex items-center gap-3">
              <input
                v-model="formData.color"
                type="color"
                class="h-10 w-16 rounded border border-default bg-transparent"
              >
              <UInput
                v-model="formData.color"
                class="w-full"
                placeholder="例如：#3b82f6"
              />
            </div>
          </UFormField>

          <UFormField
            label="描述"
            name="description"
          >
            <UTextarea
              v-model="formData.description"
              class="w-full"
              :rows="3"
              placeholder="请输入描述"
            />
          </UFormField>

          <div class="rounded-2xl border border-default p-4">
            <p class="mb-2 text-sm text-muted">
              预览效果
            </p>
            <VenusTag
              :name="formData.name || '标签预览'"
              :icon="formData.icon"
              :color="formData.color"
            />
          </div>

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
  </div>
</template>
