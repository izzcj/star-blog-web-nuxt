<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { roleFetchApis } from '~/apis/system/role';
import { userActionApis, userFetchApis } from '~/apis/system/user';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '用户管理',
});

interface UserQueryParams {
  account: string
  nickname: string
  mobile: string
  sex: string
}

interface UserForm {
  id?: string
  account: string
  avatar?: string
  nickname: string
  sex: string
  mobile: string
  email: string
  sort: number
  roleIds: number[]
  remark: string
}

const message = useMessage();
const confirm = useConfirm();

const queryForm = reactive<UserQueryParams>({
  account: '',
  nickname: '',
  mobile: '',
  sex: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);

const formData = reactive<UserForm>({
  account: '',
  avatar: '',
  nickname: '',
  sex: '',
  mobile: '',
  email: '',
  sort: 0,
  roleIds: [],
  remark: '',
});

const { data, status, refresh } = await userFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    account: queryForm.account || undefined,
    nickname: queryForm.nickname || undefined,
    mobile: queryForm.mobile || undefined,
    sex: queryForm.sex || undefined,
  })),
  immediate: false,
});

const { data: roleOptionsData, refresh: refreshRoleOptions } = await roleFetchApis().fetchOptions({
  immediate: false,
});

const rows = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);
const roleOptions = computed(() => roleOptionsData.value ?? []);

const tableColumns = [
  { accessorKey: 'sort', header: '排序' },
  { accessorKey: 'avatar', header: '头像' },
  { accessorKey: 'account', header: '账号' },
  { accessorKey: 'nickname', header: '昵称' },
  { accessorKey: 'sex', header: '性别' },
  { accessorKey: 'mobile', header: '手机号' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'createTime', header: '创建时间' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

watch(() => [pagination.page, pagination.size], () => {
  void refresh();
});

onMounted(async () => {
  await Promise.all([
    refresh(),
    refreshRoleOptions(),
  ]);
});

function handleQuery() {
  pagination.page = 1;
  void refresh();
}

function handleReset() {
  queryForm.account = '';
  queryForm.nickname = '';
  queryForm.mobile = '';
  queryForm.sex = '';
  handleQuery();
}

function openCreate() {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    account: '',
    avatar: '',
    nickname: '',
    sex: '',
    mobile: '',
    email: '',
    sort: 0,
    roleIds: [],
    remark: '',
  });
  dialogOpen.value = true;
}

function openEdit(row: User) {
  editing.value = true;
  Object.assign(formData, {
    id: row.id,
    account: row.account,
    avatar: row.avatar || '',
    nickname: row.nickname,
    sex: row.sex,
    mobile: row.mobile || '',
    email: row.email || '',
    sort: row.sort || 0,
    roleIds: row.roleIds || [],
    remark: row.remark || '',
  });
  dialogOpen.value = true;
}

function validateForm(state: UserForm) {
  const errors: Array<{ name: keyof UserForm, message: string }> = [];

  if (!state.account.trim()) {
    errors.push({ name: 'account', message: '请输入账号' });
  }

  if (!state.nickname.trim()) {
    errors.push({ name: 'nickname', message: '请输入昵称' });
  }

  if (!state.sex) {
    errors.push({ name: 'sex', message: '请选择性别' });
  }

  return errors;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await userActionApis().modify({ data: formData });
      message.success('用户修改成功');
    } else {
      await userActionApis().create({ data: formData });
      message.success('用户创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function resetPassword(row: User) {
  const confirmed = await confirm.confirm({
    title: '重置密码',
    description: '系统将重置该用户的密码。',
    content: `确定重置 ${row.nickname || row.account} 的密码吗？`,
    confirmText: '重置',
  });

  if (!confirmed) {
    return;
  }

  await userActionApis().resetPassword({ pathParams: { id: row.id } });
  message.success('密码重置成功');
}

async function remove(row: User) {
  const confirmed = await confirm.confirmDelete({ itemName: row.nickname || row.account });
  if (!confirmed) {
    return;
  }

  await userActionApis().delete({ pathParams: { id: row.id } });
  message.success('用户删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
          <UInput
            v-model="queryForm.account"
            placeholder="按账号搜索"
            icon="i-lucide-search"
            class="min-w-52"
            @keyup.enter="handleQuery"
          />

          <UInput
            v-model="queryForm.nickname"
            placeholder="按昵称搜索"
            class="min-w-52"
            @keyup.enter="handleQuery"
          />

          <UInput
            v-model="queryForm.mobile"
            placeholder="按手机号搜索"
            class="min-w-52"
            @keyup.enter="handleQuery"
          />

          <VenusSelect
            v-model="queryForm.sex"
            class="min-w-40"
            :option-type="DataOptionType.DICT"
            option-key="sex"
            placeholder="请选择性别"
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
          icon="i-lucide-user-plus"
          @click="openCreate"
        >
          新增用户
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
        empty="暂无用户数据。"
        loading-text="正在加载用户..."
      >
        <template #sort-cell="{ row }">
          {{ row.original.sort ?? 0 }}
        </template>

        <template #avatar-cell="{ row }">
          <VenusAvatar
            v-model:value="row.original.avatar"
            :name="row.original.nickname"
            size="small"
          />
        </template>

        <template #account-cell="{ row }">
          <div class="text-highlighted">
            {{ row.original.account }}
          </div>
        </template>

        <template #nickname-cell="{ row }">
          {{ row.original.nickname }}
        </template>

        <template #sex-cell="{ row }">
          {{ (row.original as any).sexName || row.original.sex || '-' }}
        </template>

        <template #mobile-cell="{ row }">
          {{ row.original.mobile || '-' }}
        </template>

        <template #email-cell="{ row }">
          {{ row.original.email || '-' }}
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
              color="warning"
              variant="soft"
              @click="resetPassword(row.original)"
            >
              重置密码
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
      :title="editing ? '修改用户' : '新增用户'"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <template #body>
        <UForm
          :state="formData"
          :validate="validateForm"
          class="space-y-4"
          @submit="submit"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField
              label="头像"
              name="avatar"
            >
              <VenusAvatar
                v-model:value="formData.avatar"
                :name="formData.nickname"
                mode="edit"
              />
            </UFormField>

            <UFormField
              label="账号"
              name="account"
              required
            >
              <UInput
                v-model="formData.account"
                class="w-full"
                placeholder="请输入账号"
              />
            </UFormField>

            <UFormField
              label="昵称"
              name="nickname"
              required
            >
              <UInput
                v-model="formData.nickname"
                class="w-full"
                placeholder="请输入昵称"
              />
            </UFormField>

            <UFormField
              label="性别"
              name="sex"
              required
            >
              <VenusSelect
                v-model="formData.sex"
                class="w-full"
                :option-type="DataOptionType.DICT"
                option-key="sex"
                placeholder="请选择性别"
              />
            </UFormField>

            <UFormField
              label="手机号"
              name="mobile"
            >
              <UInput
                v-model="formData.mobile"
                class="w-full"
                placeholder="请输入手机号"
              />
            </UFormField>

            <UFormField
              label="邮箱"
              name="email"
            >
              <UInput
                v-model="formData.email"
                class="w-full"
                placeholder="请输入邮箱"
              />
            </UFormField>

            <UFormField
              label="角色"
              name="roleIds"
            >
              <VenusSelect
                v-model="formData.roleIds"
                class="w-full"
                :option-type="DataOptionType.CONST"
                :option-key="roleOptions"
                placeholder="请选择角色"
                :multiple="true"
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
