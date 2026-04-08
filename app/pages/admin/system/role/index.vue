<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { type Role, roleActionApis, roleFetchApis } from '~/apis/system/role';
import RoleAuthorization from './components/role-authorization.vue';
import RolePermission from './components/role-permission.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '角色管理',
});

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive({
  name: '',
  type: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);
const authorizeOpen = ref(false);
const permissionOpen = ref(false);
const currentRole = ref<Role | null>(null);

const formData = reactive<Role>({
  name: '',
  type: '',
  sort: 0,
  defaultRole: false,
} as Role);

const { data, status, refresh } = await roleFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    name: queryForm.name || undefined,
    type: queryForm.type || undefined,
  })),
  immediate: false,
});

const rows = computed<Role[]>(() => (data.value?.data ?? []) as Role[]);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'sort', header: '排序' },
  { accessorKey: 'name', header: '角色名称' },
  { accessorKey: 'type', header: '角色类型' },
  { accessorKey: 'defaultRole', header: '默认角色' },
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
  queryForm.name = '';
  queryForm.type = '';
  handleQuery();
}

function openCreate() {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    name: '',
    type: '',
    sort: 0,
    defaultRole: false,
    remark: '',
  });
  dialogOpen.value = true;
}

function openEdit(row: Role) {
  editing.value = true;
  Object.assign(formData, {
    ...row,
  });
  dialogOpen.value = true;
}

function openAuthorization(row: Role) {
  currentRole.value = row;
  authorizeOpen.value = true;
}

function openPermission(row: Role) {
  currentRole.value = row;
  permissionOpen.value = true;
}

function validateForm(state: Role) {
  const errors: Array<{ name: keyof Role, message: string }> = [];

  if (!state.name.trim()) {
    errors.push({ name: 'name', message: '请输入角色名称' });
  }

  if (!state.type) {
    errors.push({ name: 'type', message: '请选择角色类型' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await roleActionApis().modify({ data: formData });
      message.success('角色修改成功');
    } else {
      await roleActionApis().create({ data: formData });
      message.success('角色创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: Role) {
  const confirmed = await confirm.confirmDelete({ itemName: row.name });
  if (!confirmed) {
    return;
  }

  await roleActionApis().delete({ pathParams: { id: row.id } });
  message.success('角色删除成功');
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
            placeholder="按角色名称搜索"
            icon="lucide:search"
            class="min-w-56"
            @keyup.enter="handleQuery"
          />
          <VenusSelect
            v-model="queryForm.type"
            class="min-w-56"
            :option-type="DataOptionType.ENUM"
            option-key="com.ale.starblog.admin.system.enums.RoleType"
            placeholder="请选择角色类型"
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
          icon="lucide:plus"
          @click="openCreate"
        >
          新增角色
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
      >
        <template #name-cell="{ row }">
          <div class="font-medium text-highlighted">
            {{ row.original.name }}
          </div>
        </template>

        <template #type-cell="{ row }">
          {{ row.original.typeName || row.original.type }}
        </template>

        <template #defaultRole-cell="{ row }">
          <UBadge
            :color="row.original.defaultRole ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.defaultRole ? '是' : '否' }}
          </UBadge>
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
              :disabled="row.original.id === '1'"
              @click="openAuthorization(row.original)"
            >
              授权用户
            </UButton>
            <UButton
              size="sm"
              color="warning"
              variant="soft"
              :disabled="row.original.id === '1'"
              @click="openPermission(row.original)"
            >
              设置权限
            </UButton>
            <UButton
              size="sm"
              variant="soft"
              :disabled="row.original.defaultRole"
              @click="openEdit(row.original)"
            >
              修改
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="soft"
              :disabled="row.original.defaultRole"
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
      :title="editing ? '修改角色' : '新增角色'"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <UFormField
            label="角色名称"
            name="name"
            required
          >
            <UInput
              v-model="formData.name"
              class="w-full"
              placeholder="请输入角色名称"
            />
          </UFormField>
          <UFormField
            label="角色类型"
            name="type"
            required
          >
            <VenusSelect
              v-model="formData.type"
              class="w-full"
              :option-type="DataOptionType.ENUM"
              option-key="com.ale.starblog.admin.system.enums.RoleType"
              placeholder="请选择角色类型"
            />
          </UFormField>
          <UFormField
            label="排序"
            name="sort"
          >
            <UInputNumber
              v-model="formData.sort"
              class="w-full"
            />
          </UFormField>
          <UFormField label="默认角色">
            <USwitch v-model="formData.defaultRole" />
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
      v-model:open="authorizeOpen"
      :title="currentRole ? `用户授权 - ${currentRole.name}` : '用户授权'"
      :ui="{ content: 'sm:max-w-6xl' }"
    >
      <template #body>
        <RoleAuthorization
          v-if="currentRole"
          :role-id="currentRole.id"
          :role-name="currentRole.name"
          @changed="refresh()"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="permissionOpen"
      :title="currentRole ? `权限设置 - ${currentRole.name}` : '权限设置'"
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <RolePermission
          v-if="currentRole"
          :role-id="currentRole.id"
          @saved="permissionOpen = false"
        />
      </template>
    </UModal>
  </div>
</template>
