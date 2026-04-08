<script setup lang="ts">
import { type DictData, dictDataActionApis, dictDataFetchApis } from '~/apis/system/dict-data';

interface Props {
  dictKey: string
  dictName?: string
}

const props = defineProps<Props>();

const message = useMessage();
const confirm = useConfirm();

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);

const defaultForm = (): Omit<DictData, 'id'> => ({
  dictLabel: '',
  dictValue: '',
  dictKey: props.dictKey,
  cssClass: '',
  listClass: '',
  deletable: true,
  sort: 0,
  enabled: true,
  remark: '',
});

const formData = reactive<Omit<DictData, 'id'>>(defaultForm());

const { data, status, refresh } = await dictDataFetchApis().fetchPage({
  params: computed(() => ({
    dictKey: props.dictKey,
    page: pagination.page,
    size: pagination.size,
  })),
  immediate: false,
});

const rows = computed<DictData[]>(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'dictLabel', header: '字典标签' },
  { accessorKey: 'dictValue', header: '字典键值' },
  { accessorKey: 'sort', header: '排序' },
  { accessorKey: 'enabled', header: '状态' },
  { accessorKey: 'remark', header: '备注' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

watch(() => props.dictKey, async () => {
  pagination.page = 1;
  Object.assign(formData, defaultForm());
  await refresh();
}, { immediate: true });

watch(() => [pagination.page, pagination.size], () => {
  void refresh();
});

function openCreate() {
  editing.value = false;
  Object.assign(formData, defaultForm());
  dialogOpen.value = true;
}

function openEdit(row: DictData) {
  editing.value = true;
  Object.assign(formData, {
    ...defaultForm(),
    ...row,
  });
  dialogOpen.value = true;
}

function validateForm(state: Omit<DictData, 'id'>) {
  const errors: Array<{ name: keyof Omit<DictData, 'id'>, message: string }> = [];

  if (!state.dictLabel.trim()) {
    errors.push({ name: 'dictLabel', message: '请输入字典标签' });
  }

  if (!state.dictValue.trim()) {
    errors.push({ name: 'dictValue', message: '请输入字典键值' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await dictDataActionApis().modify({ data: formData });
      message.success('字典项修改成功');
    } else {
      await dictDataActionApis().create({ data: formData });
      message.success('字典项创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function toggleEnabled(row: DictData) {
  await dictDataActionApis().modify({
    data: {
      ...row,
      enabled: !row.enabled,
    },
  });

  message.success('状态已更新');
  await refresh();
}

async function remove(row: DictData) {
  const confirmed = await confirm.confirmDelete({ itemName: row.dictLabel });
  if (!confirmed) {
    return;
  }

  await dictDataActionApis().delete({ pathParams: { id: row.id } });
  message.success('字典项删除成功');
  await refresh();
}
</script>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm text-muted">
              当前字典
            </p>
            <h3 class="text-lg font-semibold text-highlighted">
              {{ props.dictName || props.dictKey }}
            </h3>
          </div>

          <UButton
            icon="i-lucide-plus"
            @click="openCreate"
          >
            新增字典项
          </UButton>
        </div>
      </template>

      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
      >
        <template #dictLabel-cell="{ row }">
          <div class="text-highlighted">
            {{ row.original.dictLabel }}
          </div>
        </template>

        <template #dictValue-cell="{ row }">
          <div class="font-mono text-xs">
            {{ row.original.dictValue }}
          </div>
        </template>

        <template #enabled-cell="{ row }">
          <USwitch
            :model-value="row.original.enabled"
            @update:model-value="toggleEnabled(row.original)"
          />
        </template>

        <template #remark-cell="{ row }">
          {{ row.original.remark || '-' }}
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
              v-if="row.original.deletable !== false"
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
      :title="editing ? '修改字典项' : '新增字典项'"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            label="字典标签"
            name="dictLabel"
            required
          >
            <UInput
              v-model="formData.dictLabel"
              class="w-full"
              placeholder="请输入字典标签"
            />
          </UFormField>

          <UFormField
            label="字典键值"
            name="dictValue"
            required
          >
            <UInput
              v-model="formData.dictValue"
              class="w-full"
              placeholder="请输入字典键值"
            />
          </UFormField>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField
              label="字典样式"
              name="cssClass"
            >
              <UInput
                v-model="formData.cssClass"
                class="w-full"
                placeholder="请输入字典样式"
              />
            </UFormField>

            <UFormField
              label="列表样式"
              name="listClass"
            >
              <UInput
                v-model="formData.listClass"
                class="w-full"
                placeholder="请输入列表样式"
              />
            </UFormField>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField
              label="排序"
              name="sort"
            >
              <UInputNumber
                v-model="formData.sort"
                class="w-full"
              />
            </UFormField>

            <UFormField label="启用状态">
              <USwitch v-model="formData.enabled" />
            </UFormField>
          </div>

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
