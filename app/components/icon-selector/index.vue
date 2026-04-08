<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui';
import type { IconItem } from '~/utils/icon-util';
import { getLocalIcons } from '~/utils/icon-util';
import IconPanel from './icon-panel.vue';

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const modalOpen = ref(false);

// 当前选中的图标（临时，确认后才 emit）
const selectedIcon = ref('');

// Icons Tab 手动输入
const iconsInput = ref('');

// Tab 定义
const tabs = [
  { label: 'Iconify 图标集', slot: 'iconify' as const, icon: 'i-lucide-package' },
  { label: '本地图标', slot: 'local' as const, icon: 'i-lucide-folder' },
  { label: 'Icons 图标', slot: 'icons' as const, icon: 'i-lucide-globe' },
] satisfies TabsItem[];

// ---- Iconify 图标集搜索 ----
const iconifyQuery = ref('');
const iconifyIcons = ref<IconItem[]>([]);
const iconifyLoading = ref(false);
const iconifySelectedIcon = ref('');

const debouncedIconifySearch = useDebounceFn(async () => {
  if (!iconifyQuery.value.trim()) {
    iconifyIcons.value = [];
    return;
  }
  iconifyLoading.value = true;
  try {
    const data: any = await $fetch('https://api.iconify.design/search', {
      query: { query: iconifyQuery.value, limit: 120 },
    });
    iconifyIcons.value = (data.icons || []).map((name: string) => ({
      name,
      displayName: name,
    }));
  }
  catch {
    iconifyIcons.value = [];
  }
  finally {
    iconifyLoading.value = false;
  }
}, 400);

watch(iconifyQuery, () => debouncedIconifySearch());

// ---- 本地图标 ----
const localIcons = computed(() => getLocalIcons());
const localSelectedIcon = ref('');

// ---- 打开弹窗时同步外部值 ----
watch(modalOpen, (open) => {
  if (!open) return;
  selectedIcon.value = props.modelValue || '';
  iconifySelectedIcon.value = '';
  localSelectedIcon.value = '';
  iconsInput.value = '';

  if (selectedIcon.value) {
    if (selectedIcon.value.startsWith('venus:')) {
      localSelectedIcon.value = selectedIcon.value;
    }
    else if (selectedIcon.value.includes(':')) {
      iconifySelectedIcon.value = selectedIcon.value;
    }
  }
});

// 各 panel 选中时同步
function onIconifySelect(name: string) {
  iconifySelectedIcon.value = name;
  selectedIcon.value = name;
  localSelectedIcon.value = '';
  iconsInput.value = '';
}

function onLocalSelect(name: string) {
  localSelectedIcon.value = name;
  selectedIcon.value = name;
  iconifySelectedIcon.value = '';
  iconsInput.value = '';
}

// Icons 输入变化
watch(iconsInput, (val) => {
  if (val.trim()) {
    selectedIcon.value = val.trim();
    iconifySelectedIcon.value = '';
    localSelectedIcon.value = '';
  }
});

/**
 * 确认选择图标
 */
function confirmSelection() {
  if (selectedIcon.value) {
    emit('update:modelValue', selectedIcon.value);
  }
  modalOpen.value = false;
}

/**
 * 清空选择
 */
function clearSelection() {
  selectedIcon.value = '';
  iconifySelectedIcon.value = '';
  localSelectedIcon.value = '';
  iconsInput.value = '';
  emit('update:modelValue', '');
  modalOpen.value = false;
}
</script>

<template>
  <div>
    <UModal
      v-model:open="modalOpen"
      title="选择图标"
      :ui="{ content: 'sm:max-w-3xl' }"
    >
      <!-- 触发器（UModal 默认插槽） -->
      <UInput
        :model-value="modelValue"
        placeholder="请选择图标"
        readonly
        class="cursor-pointer"
      >
        <template #leading>
          <UIcon
            v-if="modelValue"
            :name="modelValue"
            class="text-lg"
          />
          <UIcon
            v-else
            name="lucide:search"
            class="text-muted"
          />
        </template>
        <template #trailing>
          <UIcon
            name="lucide:chevron-down"
            class="text-muted"
          />
        </template>
      </UInput>

      <template #body>
        <UTabs
          :items="tabs"
          class="w-full"
        >
          <!-- Iconify 图标集 -->
          <template #iconify>
            <div class="flex flex-col gap-3 pt-3">
              <UInput
                v-model="iconifyQuery"
                placeholder="搜索 Iconify 图标（如 arrow, home, user）..."
                icon="i-lucide-search"
                :loading="iconifyLoading"
                class="w-full"
              />
              <IconPanel
                v-if="iconifyIcons.length"
                :icons="iconifyIcons"
                :model-value="iconifySelectedIcon"
                @update:model-value="onIconifySelect"
              />
              <div
                v-else-if="!iconifyLoading && iconifyQuery"
                class="flex items-center justify-center h-48 text-muted border border-default rounded-(--ui-radius)"
              >
                未找到匹配图标
              </div>
              <div
                v-else
                class="flex items-center justify-center h-48 text-muted border border-default rounded-(--ui-radius)"
              >
                输入关键词搜索 Iconify 图标
              </div>
            </div>
          </template>

          <!-- 本地图标 -->
          <template #local>
            <div class="pt-3">
              <IconPanel
                :icons="localIcons"
                :model-value="localSelectedIcon"
                @update:model-value="onLocalSelect"
              />
            </div>
          </template>

          <!-- Icons 图标 -->
          <template #icons>
            <div class="flex flex-col gap-4 pt-3">
              <p class="text-sm text-muted">
                从
                <a
                  href="https://icones.js.org"
                  target="_blank"
                  class="text-primary underline"
                >icones.js.org</a>
                复制图标名称粘贴到下方输入框
              </p>
              <UInput
                v-model="iconsInput"
                placeholder="输入图标名称，如 mdi:home, carbon:add..."
                icon="i-lucide-type"
                class="w-full"
              />
              <div
                v-if="iconsInput.trim()"
                class="flex flex-col items-center gap-3 py-8 border border-default rounded-(--ui-radius)"
              >
                <UIcon
                  :name="iconsInput.trim()"
                  class="text-5xl"
                />
                <span class="text-sm text-muted">{{ iconsInput.trim() }}</span>
              </div>
              <div
                v-else
                class="flex items-center justify-center h-48 text-muted border border-default rounded-(--ui-radius)"
              >
                输入图标名称后预览
              </div>
            </div>
          </template>
        </UTabs>
      </template>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-sm text-muted flex items-center gap-2">
            <template v-if="selectedIcon">
              <span>已选择：</span>
              <UIcon
                :name="selectedIcon"
                class="text-lg"
              />
              <span class="font-medium">{{ selectedIcon }}</span>
            </template>
            <span v-else>请选择一个图标</span>
          </div>
          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              label="清空"
              @click="clearSelection"
            />
            <UButton
              color="neutral"
              variant="soft"
              label="取消"
              @click="modalOpen = false"
            />
            <UButton
              label="确定"
              :disabled="!selectedIcon"
              @click="confirmSelection"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
