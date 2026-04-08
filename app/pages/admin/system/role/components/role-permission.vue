<script setup lang="ts">
import { menuFetchApis } from '~/apis/system/menu';
import { roleActionApis, roleFetchApis } from '~/apis/system/role';

interface Props {
  roleId: string
}

const props = defineProps<Props>();

const emit = defineEmits<{
  saved: []
}>();

const message = useMessage();

const selectedIds = ref<string[]>([]);
const saving = ref(false);

const { data: menuTreeData, status: menuStatus, refresh: refreshMenus } = await menuFetchApis().fetchTreeList({
  immediate: false,
});

const currentRoleId = computed(() => props.roleId);
const { data: permissionData, status: permissionStatus, refresh: refreshPermissions } = await roleFetchApis().fetchMenuPermissions({
  pathParams: computed(() => ({ id: currentRoleId.value })),
  immediate: false,
});

const flatMenus = computed(() => flattenMenus(menuTreeData.value ?? []));
const loading = computed(() => menuStatus.value === 'pending' || permissionStatus.value === 'pending');

watch(permissionData, (value) => {
  selectedIds.value = value;
}, { immediate: true });

watch(() => props.roleId, async (roleId) => {
  if (!roleId) {
    selectedIds.value = [];
    return;
  }

  await Promise.all([
    refreshMenus(),
    refreshPermissions(),
  ]);
}, { immediate: true });

/**
 * 将菜单树扁平化为一维数组，并添加深度和完整路径信息。
 *
 * @param list 菜单树数组
 * @param depth 当前深度，默认为0
 * @returns 扁平化的菜单树数组
 */
function flattenMenus(list: MenuTree[], depth = 0): Array<MenuTree & { depth: number, fullPath: string }> {
  return list.flatMap((item) => {
    const current = [{
      ...item,
      depth,
      fullPath: item.redirectUri || item.uri,
    }];

    if (!item.children?.length) {
      return current;
    }

    return [...current, ...flattenMenus(item.children, depth + 1)];
  });
}

function isChecked(id?: string) {
  return Boolean(id && selectedIds.value.includes(id));
}

function toggleMenu(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id];
    }
    return;
  }

  selectedIds.value = selectedIds.value.filter(item => item !== id);
}

function selectAll() {
  selectedIds.value = flatMenus.value.map(item => item.id).filter(Boolean) as string[];
}

function clearAll() {
  selectedIds.value = [];
}

async function savePermissions() {
  if (!props.roleId) {
    return;
  }

  saving.value = true;

  try {
    await roleActionApis().saveMenuPermissions({
      pathParams: { id: props.roleId },
      data: selectedIds.value,
    });

    message.success('权限保存成功');
    emit('saved');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="text-sm text-muted">
        共 {{ flatMenus.length }} 项菜单，已选择 {{ selectedIds.length }} 项。
      </div>

      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="selectAll"
        >
          全选
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          @click="clearAll"
        >
          清空
        </UButton>
      </div>
    </div>

    <div class="max-h-112 overflow-auto rounded-2xl border border-default">
      <div
        v-if="loading"
        class="flex min-h-56 items-center justify-center text-sm text-muted"
      >
        正在加载权限树...
      </div>

      <div
        v-else-if="!flatMenus.length"
        class="flex min-h-56 items-center justify-center text-sm text-muted"
      >
        暂无可分配菜单。
      </div>

      <div
        v-for="menu in flatMenus"
        :key="menu.id"
        class="flex items-center justify-between gap-4 border-b border-default px-4 py-3 last:border-b-0"
      >
        <label
          class="flex min-w-0 cursor-pointer items-center gap-3"
          :style="{ paddingLeft: `${menu.depth * 18}px` }"
        >
          <input
            :checked="isChecked(menu.id)"
            type="checkbox"
            class="h-4 w-4 rounded border-default"
            @change="toggleMenu(menu.id, ($event.target as HTMLInputElement).checked)"
          >

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <IconRender
                v-if="menu.icon"
                :icon="menu.icon"
                size="16px"
              />
              <span class="font-medium text-highlighted">{{ menu.name }}</span>
            </div>
            <p class="truncate text-xs text-muted">
              {{ menu.fullPath || '-' }}
            </p>
          </div>
        </label>

        <div class="shrink-0 text-xs text-muted">
          {{ menu.component || '无组件名' }}
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <UButton
        color="primary"
        :loading="saving"
        @click="savePermissions"
      >
        保存权限
      </UButton>
    </div>
  </div>
</template>
