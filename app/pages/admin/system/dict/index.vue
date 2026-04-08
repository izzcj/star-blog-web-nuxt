<script setup lang="ts">
import { type DictType, dictTypeActionApis, dictTypeFetchApis } from '~/apis/system/dict-type';
import DictDataManager from './components/dict-data-manager.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '字典管理',
});

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive({
  dictName: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);
const selectedDict = ref<DictType | null>(null);

const formData = reactive<DictType>({
  dictName: '',
  dictKey: '',
  sort: 0,
} as DictType);

const { data, status, refresh } = await dictTypeFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    dictName: queryForm.dictName || undefined,
  })),
  immediate: false,
});

const rows = computed<DictType[]>(() => (data.value?.data ?? []) as DictType[]);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'sort', header: '排序' },
  { accessorKey: 'dictName', header: '字典名称' },
  { accessorKey: 'dictKey', header: '字典 Key' },
  { accessorKey: 'remark', header: '备注' },
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
  queryForm.dictName = '';
  handleQuery();
}

async function refreshCache() {
  await dictTypeActionApis().refreshCache();
  message.success('字典缓存刷新成功');
  await refresh();
}

function openCreate() {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    dictName: '',
    dictKey: '',
    sort: 0,
    remark: '',
  });
  dialogOpen.value = true;
}

function openEdit(row: DictType) {
  editing.value = true;
  Object.assign(formData, { ...row });
  dialogOpen.value = true;
}

function selectDict(row: DictType) {
  selectedDict.value = row;
}

function validateForm(state: DictType) {
  const errors: Array<{ name: keyof DictType, message: string }> = [];

  if (!state.dictName.trim()) {
    errors.push({ name: 'dictName', message: '请输入字典名称' });
  }

  if (!state.dictKey.trim()) {
    errors.push({ name: 'dictKey', message: '请输入字典 Key' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await dictTypeActionApis().modify({ data: formData });
      message.success('字典修改成功');
    } else {
      await dictTypeActionApis().create({ data: formData });
      message.success('字典创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: DictType) {
  const confirmed = await confirm.confirmDelete({ itemName: row.dictName });
  if (!confirmed) {
    return;
  }

  await dictTypeActionApis().delete({ pathParams: { id: row.id } });
  message.success('字典删除成功');
  if (selectedDict.value?.id === row.id) {
    selectedDict.value = null;
  }
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-wrap gap-3">
          <UInput
            v-model="queryForm.dictName"
            placeholder="按字典名称搜索"
            icon="i-lucide-search"
            class="min-w-64"
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

        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="soft"
            @click="refreshCache"
          >
            刷新缓存
          </UButton>
          <UButton
            icon="i-lucide-plus"
            @click="openCreate"
          >
            新增字典
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
      >
        <template #dictName-cell="{ row }">
          <div class="font-medium text-highlighted">
            {{ row.original.dictName }}
          </div>
        </template>

        <template #dictKey-cell="{ row }">
          <button
            class="font-mono text-primary hover:underline"
            @click="selectDict(row.original)"
          >
            {{ row.original.dictKey }}
          </button>
        </template>

        <template #remark-cell="{ row }">
          {{ row.original.remark || '-' }}
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

    <DictDataManager
      v-if="selectedDict"
      :dict-key="selectedDict.dictKey"
      :dict-name="selectedDict.dictName"
    />

    <UModal
      v-model:open="dialogOpen"
      :title="editing ? '修改字典' : '新增字典'"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            label="字典名称"
            name="dictName"
            required
          >
            <UInput
              v-model="formData.dictName"
              class="w-full"
              placeholder="请输入字典名称"
            />
          </UFormField>
          <UFormField
            label="字典 Key"
            name="dictKey"
            required
          >
            <UInput
              v-model="formData.dictKey"
              class="w-full"
              :disabled="editing"
              placeholder="请输入字典 Key"
            />
          </UFormField>
          <UFormField
            label="排序"
            name="sort"
          >
            <UInputNumber
              v-model="formData.sort"
              class="w-2/5"
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
  </div>
</template>
