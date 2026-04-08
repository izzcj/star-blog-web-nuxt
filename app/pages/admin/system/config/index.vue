<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import ConfigItem from './components/config-item.vue';
import { systemConfigActionApis, systemConfigFetchApis } from '~/apis/system/system-config';
import { useConfirm } from '~/composables/use-confirm';
import { useLoadDataOptions } from '~/composables/use-data-options';
import { useMessage } from '~/composables/use-message';
import DataOptionType from '~/enums/data-option-type';
import SystemConfigType from '~/enums/systme-config-type';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '系统配置',
});

type ConfigValue = string | number | boolean | string[] | number[] | Recordable | null;
type EditableSystemConfig = Omit<SystemConfig, 'value'> & { value: ConfigValue };
type SystemConfigFormData = Omit<SystemConfig, 'id' | 'deletable' | 'createTime' | 'updateTime'>;

const message = useMessage();
const { confirmDelete } = useConfirm();

const currentConfigCategory = ref('');
const creating = ref(false);
const dialogVisible = ref(false);
const systemConfigs = ref<EditableSystemConfig[]>([]);
const rowSavingKeys = ref<string[]>([]);
const rowDeletingKeys = ref<string[]>([]);

const categoryOptionType = computed(() => DataOptionType.DICT);
const categoryOptionKey = computed(() => 'system-config-category');
const { data: configCategoryOptions } = useLoadDataOptions(categoryOptionType, categoryOptionKey);

const systemConfigTypeEnumKey = 'com.ale.starblog.admin.system.enums.SystemConfigType';
const systemConfigDataSourceTypeEnumKey = 'com.ale.starblog.admin.system.enums.SystemConfigDataSourceType';

function createDefaultFormData(): SystemConfigFormData {
  return {
    category: currentConfigCategory.value,
    sort: null,
    name: '',
    type: SystemConfigType.TEXT,
    key: '',
    value: null,
    dataSourceType: null,
    dataSourceConfig: null,
  };
}

const formData = reactive<SystemConfigFormData>(createDefaultFormData());

const currentConfigCategoryLabel = computed(() => {
  const currentOption = configCategoryOptions.value.find(item => String(item.value) === currentConfigCategory.value);
  return currentOption?.label ?? '系统配置';
});

const hasConfigCategory = computed(() => !isEmpty(configCategoryOptions.value));
const hasDataSource = computed(() => isDataSourceConfigType(formData.type));

const {
  data: systemConfigList,
  status: systemConfigListStatus,
  refresh: refreshSystemConfigList,
} = await systemConfigFetchApis().fetchList({
  params: computed(() => ({
    category: currentConfigCategory.value,
  })),
  immediate: false,
});

const loading = computed(() => systemConfigListStatus.value === 'pending');

const configTableColumns = [
  { accessorKey: 'sort', header: '排序', meta: { class: { th: 'w-20', td: 'align-top' } } },
  { accessorKey: 'name', header: '配置名称', meta: { class: { th: 'w-44', td: 'align-top' } } },
  { accessorKey: 'key', header: '配置 Key', meta: { class: { th: 'w-52', td: 'align-top' } } },
  { accessorKey: 'value', header: '配置值', meta: { class: { th: 'min-w-90', td: 'align-top' } } },
  { id: 'actions', header: '操作', meta: { class: { th: 'w-44', td: 'align-top' } } },
];

watch(
  () => configCategoryOptions.value,
  options => {
    if (isEmpty(options)) {
      currentConfigCategory.value = '';
      systemConfigs.value = [];
      return;
    }

    const hasCurrentOption = options.some(item => String(item.value) === currentConfigCategory.value);
    if (!currentConfigCategory.value || !hasCurrentOption) {
      currentConfigCategory.value = String(options[0]?.value);
    }
  },
  { immediate: true },
);

watch(
  () => currentConfigCategory.value,
  () => {
    void loadSystemConfigs();
  },
);

watch(
  () => systemConfigList.value,
  value => {
    systemConfigs.value = (value ?? []).map(normalizeConfigValue);
  },
  { immediate: true },
);

watch(
  () => formData.type,
  type => {
    if (!isDataSourceConfigType(type)) {
      formData.dataSourceType = null;
      formData.dataSourceConfig = null;
    }
  },
);

/**
 * 判断是否为数据源配置类型
 *
 * @param type 系统配置类型
 */
function isDataSourceConfigType(type: SystemConfigType) {
  return type === SystemConfigType.SELECT
    || type === SystemConfigType.MULTI_SELECT
    || type === SystemConfigType.RADIO
    || type === SystemConfigType.CHECKBOX;
}

/**
 * 判断是否为集合配置类型
 *
 * @param type
 */
function isCollectionConfigType(type: SystemConfigType) {
  return type === SystemConfigType.MULTI_SELECT
    || type === SystemConfigType.CHECKBOX
    || type === SystemConfigType.DATE_RANGE
    || type === SystemConfigType.DATE_TIME_RANGE
    || type === SystemConfigType.TIME_RANGE;
}

/**
 * 获取系统配置的唯一标识
 *
 * @param config 系统配置
 */
function getConfigIdentity(config: EditableSystemConfig) {
  return config.id ?? config.key;
}

/**
 * 判断是否正在保存行
 *
 * @param config 系统配置
 */
function isRowSaving(config: EditableSystemConfig) {
  return rowSavingKeys.value.includes(getConfigIdentity(config));
}

/**
 * 判断是否正在删除行
 *
 * @param config 系统配置
 */
function isRowDeleting(config: EditableSystemConfig) {
  return rowDeletingKeys.value.includes(getConfigIdentity(config));
}

/**
 * 标准化系统配置值
 *
 * @param config 系统配置
 */
function normalizeConfigValue(config: SystemConfig): EditableSystemConfig {
  const normalizedConfig: EditableSystemConfig = { ...config, value: config.value as ConfigValue };

  if (!config.value) {
    normalizedConfig.value = null;
    return normalizedConfig;
  }

  if (isCollectionConfigType(config.type)) {
    try {
      normalizedConfig.value = JSON.parse(config.value) as string[] | number[];
    } catch {
      normalizedConfig.value = [];
    }
  }

  if (config.type === SystemConfigType.BOOLEAN) {
    normalizedConfig.value = Boolean(config.value);
  }

  return normalizedConfig;
}

/**
 * 构建提交数据
 *
 * @param config 系统配置或表单数据
 */
function buildSubmitData(config: EditableSystemConfig | SystemConfigFormData) {
  const submitData = { ...config } as Recordable;

  if (isCollectionConfigType(config.type) && Array.isArray(config.value)) {
    submitData.value = JSON.stringify(config.value);
  }

  return submitData;
}

/**
 * 加载系统配置
 */
async function loadSystemConfigs() {
  if (!currentConfigCategory.value) {
    systemConfigs.value = [];
    return;
  }

  await refreshSystemConfigList();
}

/**
 * 选择配置分类
 */
function handleConfigCategoryChange(category: string | number) {
  currentConfigCategory.value = String(category);
}

/**
 * 打开新增配置对话框
 */
function openCreateDialog() {
  Object.assign(formData, createDefaultFormData());
  dialogVisible.value = true;
}

/**
 * 校验表单
 */
function validateForm(state: Partial<SystemConfigFormData>): FormError[] {
  const errors: FormError[] = [];

  if (!state.name?.trim()) {
    errors.push({ name: 'name', message: '请输入配置名称' });
  }

  if (!state.key?.trim()) {
    errors.push({ name: 'key', message: '请输入配置 Key' });
  }

  if (!state.type) {
    errors.push({ name: 'type', message: '请选择配置类型' });
  }

  if (state.type && isDataSourceConfigType(state.type) && !state.dataSourceType) {
    errors.push({ name: 'dataSourceType', message: '请选择数据源类型' });
  }

  return errors;
}

/**
 * 处理新增配置表单提交
 */
async function handleCreateConfig(event: FormSubmitEvent<SystemConfigFormData>) {
  creating.value = true;
  try {
    await systemConfigActionApis().create({
      data: buildSubmitData(event.data) as Recordable<string>,
    });
    message.success('新增成功');
    dialogVisible.value = false;
    await loadSystemConfigs();
  } finally {
    creating.value = false;
  }
}

/**
 * 保存配置
 */
async function saveConfig(config: EditableSystemConfig) {
  const rowKey = getConfigIdentity(config);
  rowSavingKeys.value = [...rowSavingKeys.value, rowKey];

  try {
    if (!config.id) {
      await systemConfigActionApis().create({
        data: buildSubmitData(config) as Recordable<string>,
      });
      message.success('新增成功');
      await loadSystemConfigs();
      return;
    }

    await systemConfigActionApis().modify({
      data: buildSubmitData(config) as Recordable<string>,
    });
    message.success('保存成功');
  } finally {
    rowSavingKeys.value = rowSavingKeys.value.filter(item => item !== rowKey);
  }
}

/**
 * 删除配置
 */
async function deleteConfig(config: EditableSystemConfig) {
  if (!config.id) {
    return;
  }

  const confirmed = await confirmDelete(config.name || config.key);
  if (!confirmed) {
    return;
  }

  const rowKey = getConfigIdentity(config);
  rowDeletingKeys.value = [...rowDeletingKeys.value, rowKey];

  try {
    await systemConfigActionApis().delete({
      pathParams: { id: config.id },
    });
    message.success('删除成功');
    await loadSystemConfigs();
  } finally {
    rowDeletingKeys.value = rowDeletingKeys.value.filter(item => item !== rowKey);
  }
}
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
    <UCard>
      <template #header>
        <div>
          <p class="text-sm text-muted">
            Categories
          </p>
          <h2 class="text-lg font-semibold text-highlighted">
            配置分类
          </h2>
        </div>
      </template>

      <div
        v-if="hasConfigCategory"
        class="space-y-2"
      >
        <button
          v-for="item in configCategoryOptions"
          :key="String(item.value)"
          type="button"
          class="w-full rounded-xl border px-3 py-2 text-left text-sm transition"
          :class="String(item.value) === currentConfigCategory
            ? 'border-primary bg-primary/8 text-primary'
            : 'border-default bg-default hover:border-primary/30 hover:bg-primary/5'"
          @click="handleConfigCategoryChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-default px-4 py-8 text-center text-sm text-muted"
      >
        暂无配置分类
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-muted">
              {{ currentConfigCategory || 'system-config' }}
            </p>
            <h2 class="text-lg font-semibold text-highlighted">
              {{ currentConfigCategoryLabel }}
            </h2>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="ghost"
              :loading="loading"
              @click="loadSystemConfigs"
            >
              刷新
            </UButton>
            <UButton
              icon="i-lucide-plus"
              :disabled="!currentConfigCategory"
              @click="openCreateDialog"
            >
              新增配置
            </UButton>
          </div>
        </div>
      </template>

      <div
        v-if="!currentConfigCategory"
        class="rounded-xl border border-dashed border-default px-4 py-12 text-center text-sm text-muted"
      >
        请选择左侧配置分类
      </div>

      <UTable
        v-else
        :columns="configTableColumns"
        :data="loading ? [] : systemConfigs"
        :loading="loading"
        :ui="{
          base: 'min-w-full table-fixed text-sm',
          thead: 'bg-transparent',
          tbody: 'divide-y-0',
          th: 'px-3 text-left text-sm font-medium text-muted',
          td: 'px-3 py-4',
        }"
        class="overflow-x-auto rounded-xl border border-default"
      >
        <template #sort-cell="{ row }">
          <span class="text-sm text-toned">{{ row.original.sort ?? '-' }}</span>
        </template>

        <template #name-cell="{ row }">
          <div class="font-medium text-highlighted">
            {{ row.original.name }}
          </div>
        </template>

        <template #key-cell="{ row }">
          <code class="break-all text-xs text-toned">{{ row.original.key }}</code>
        </template>

        <template #value-cell="{ row }">
          <ConfigItem
            :key="row.original.id ?? row.original.key"
            v-model:value="row.original.value"
            :type="row.original.type"
            :label="row.original.name"
            :data-source-type="row.original.dataSourceType"
            :data-source-config="row.original.dataSourceConfig"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="lucide:save"
              size="sm"
              :loading="isRowSaving(row.original)"
              @click="saveConfig(row.original)"
            >
              保存
            </UButton>
            <UButton
              v-if="row.original.deletable"
              icon="lucide:trash-2"
              color="error"
              variant="soft"
              size="sm"
              :loading="isRowDeleting(row.original)"
              @click="deleteConfig(row.original)"
            >
              删除
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal
      v-model:open="dialogVisible"
      title="新增配置"
      :dismissible="!creating"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="handleCreateConfig"
        >
          <UFormField
            label="配置名称"
            name="name"
            required
          >
            <UInput
              v-model="formData.name"
              class="w-full"
              placeholder="请输入配置名称"
            />
          </UFormField>

          <UFormField
            label="配置 Key"
            name="key"
            required
          >
            <UInput
              v-model="formData.key"
              class="w-full"
              placeholder="请输入配置 Key"
            />
          </UFormField>

          <UFormField
            label="排序"
            name="sort"
          >
            <UInputNumber
              v-model="formData.sort"
              class="w-full"
              placeholder="请输入排序"
            />
          </UFormField>

          <UFormField
            label="配置类型"
            name="type"
            required
          >
            <VenusSelect
              v-model="formData.type"
              class="w-full"
              :option-type="DataOptionType.ENUM"
              :option-key="systemConfigTypeEnumKey"
              placeholder="请选择配置类型"
            />
          </UFormField>

          <UFormField
            v-if="hasDataSource"
            label="数据源类型"
            name="dataSourceType"
            required
          >
            <VenusSelect
              v-model="formData.dataSourceType"
              class="w-full"
              :option-type="DataOptionType.ENUM"
              :option-key="systemConfigDataSourceTypeEnumKey"
              placeholder="请选择数据源类型"
            />
          </UFormField>

          <UFormField
            v-if="hasDataSource"
            label="数据源配置"
            name="dataSourceConfig"
          >
            <UInput
              v-model="formData.dataSourceConfig"
              class="w-full"
              placeholder="请输入数据源配置"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="creating"
              @click="dialogVisible = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              :loading="creating"
            >
              确定
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
