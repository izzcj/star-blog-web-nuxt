<script setup lang="ts">
import { menuActionApis, menuFetchApis } from '~/apis/system/menu';
import MenuEditor from './components/menu-editor.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '菜单管理',
});

interface MenuEditorForm {
  id?: string
  parentId: string
  name: string
  component: string
  uri: string
  redirectUri: string
  icon: string
  topLevel: boolean
  keepAlive: boolean
  hidden: boolean
  enabled: boolean
  common: boolean
  sort: number
  remark: string
}

const message = useMessage();
const confirm = useConfirm();

const queryName = ref('');
const dialogOpen = ref(false);
const editing = ref(false);
const submitting = ref(false);

const formData = reactive<MenuEditorForm>({
  parentId: '0',
  name: '',
  component: '',
  uri: '',
  redirectUri: '',
  icon: '',
  topLevel: false,
  keepAlive: true,
  hidden: false,
  enabled: true,
  common: true,
  sort: 0,
  remark: '',
});

const { data, status, refresh } = await menuFetchApis().fetchTreeList({
  immediate: false,
});

const treeRows = computed(() => (data.value ?? []) as MenuTree[]);
const filteredRows = computed(() => filterTree(treeRows.value, queryName.value.trim()));
const flatRows = computed(() => flattenMenus(filteredRows.value));
const menuOptions = computed<DataOption[]>(() => buildMenuOptions(treeRows.value));

const tableColumns = [
  { accessorKey: 'name', header: '菜单名称' },
  { accessorKey: 'component', header: '组件名称' },
  { accessorKey: 'uri', header: '路由路径' },
  { accessorKey: 'icon', header: '图标' },
  { accessorKey: 'topLevel', header: '顶级' },
  { accessorKey: 'keepAlive', header: '缓存' },
  { accessorKey: 'hidden', header: '隐藏' },
  { accessorKey: 'common', header: '公共' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

onMounted(() => {
  void refresh();
});

function filterTree(list: MenuTree[], keyword: string): MenuTree[] {
  if (!keyword) {
    return list;
  }

  return list
    .map((item) => {
      const children = filterTree(item.children ?? [], keyword);
      const matched = item.name?.includes(keyword);

      if (matched || children.length) {
        return {
          ...item,
          children,
        };
      }

      return null;
    })
    .filter(Boolean) as MenuTree[];
}

function flattenMenus(list: MenuTree[], depth = 0): Array<MenuTree & { depth: number }> {
  return list.flatMap(item => [{ ...item, depth }, ...flattenMenus(item.children ?? [], depth + 1)]);
}

function buildMenuOptions(list: MenuTree[]) {
  const options: DataOption[] = [{ label: '根菜单', value: '0' }];

  const walk = (menus: MenuTree[], prefix = '') => {
    for (const item of menus) {
      options.push({
        label: `${prefix}${item.name}`,
        value: item.id,
      });
      walk(item.children ?? [], `${prefix}— `);
    }
  };

  walk(list);
  return options;
}

async function openCreate(parent?: MenuTree) {
  editing.value = false;
  Object.assign(formData, {
    id: '',
    parentId: parent?.id ?? '0',
    name: '',
    component: '',
    uri: '',
    redirectUri: '',
    icon: '',
    topLevel: false,
    keepAlive: true,
    hidden: false,
    enabled: true,
    common: true,
    sort: 0,
    remark: '',
  });
  dialogOpen.value = true;
}

async function openEdit(row: MenuTree) {
  editing.value = true;
  Object.assign(formData, {
    id: row.id,
    parentId: row.parentId || '0',
    name: row.name || '',
    component: row.component || '',
    uri: row.uri || '',
    redirectUri: row.redirectUri || '',
    icon: row.icon || '',
    topLevel: Boolean(row.topLevel),
    keepAlive: Boolean(row.keepAlive),
    hidden: Boolean(row.hidden),
    enabled: Boolean(row.enabled),
    common: Boolean(row.common),
    sort: row.sort || 0,
    remark: row.remark || '',
  });
  dialogOpen.value = true;
}

async function submit() {
  submitting.value = true;

  try {
    if (editing.value) {
      await menuActionApis().modify({ data: formData });
      message.success('菜单修改成功');
    } else {
      await menuActionApis().create({ data: formData });
      message.success('菜单创建成功');
    }

    dialogOpen.value = false;
    await refresh();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: MenuTree) {
  const confirmed = await confirm.confirmDelete({ itemName: row.name });
  if (!confirmed) {
    return;
  }

  await menuActionApis().delete({ pathParams: { id: row.id } });
  message.success('菜单删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-wrap gap-3">
          <UInput
            v-model="queryName"
            placeholder="按菜单名称过滤"
            icon="i-lucide-search"
            class="min-w-64"
          />
          <div class="flex gap-2">
            <UButton @click="refresh()">
              查询
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="queryName = ''"
            >
              重置
            </UButton>
          </div>
        </div>

        <UButton
          icon="i-lucide-plus"
          @click="openCreate()"
        >
          新增菜单
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : flatRows"
        :loading="status === 'pending'"
        empty="暂无菜单数据。"
        loading-text="正在加载菜单..."
      >
        <template #name-cell="{ row }">
          <div
            class="flex items-center gap-2"
            :style="{ paddingLeft: `${row.original.depth * 18}px` }"
          >
            <span class="font-medium text-highlighted">{{ row.original.name }}</span>
          </div>
        </template>

        <template #component-cell="{ row }">
          {{ row.original.component || '-' }}
        </template>

        <template #uri-cell="{ row }">
          {{ row.original.uri || '-' }}
        </template>

        <template #icon-cell="{ row }">
          <IconRender
            v-if="row.original.icon"
            :icon="row.original.icon"
            size="16px"
          />
          <span v-else>-</span>
        </template>

        <template #topLevel-cell="{ row }">
          <UBadge
            :color="row.original.topLevel ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.topLevel ? '是' : '否' }}
          </UBadge>
        </template>

        <template #keepAlive-cell="{ row }">
          <UBadge
            :color="row.original.keepAlive ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.keepAlive ? '是' : '否' }}
          </UBadge>
        </template>

        <template #hidden-cell="{ row }">
          <UBadge
            :color="row.original.hidden ? 'warning' : 'success'"
            variant="soft"
          >
            {{ row.original.hidden ? '是' : '否' }}
          </UBadge>
        </template>

        <template #common-cell="{ row }">
          <UBadge
            :color="row.original.common ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.common ? '是' : '否' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              variant="soft"
              @click="openCreate(row.original)"
            >
              新增
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
              color="error"
              variant="soft"
              @click="remove(row.original)"
            >
              删除
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal
      v-model:open="dialogOpen"
      :title="editing ? '修改菜单' : '新增菜单'"
      :ui="{ content: 'sm:max-w-4xl' }"
    >
      <template #body>
        <MenuEditor
          v-model="formData"
          :is-edit="editing"
          :menu-options="menuOptions"
          :pending="submitting"
          @submit="submit"
        />
      </template>
    </UModal>
  </div>
</template>
