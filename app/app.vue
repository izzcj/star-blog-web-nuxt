<script setup lang="ts">
import { zh_cn } from '@nuxt/ui/locale';
import type { ContextMenuItem } from '@nuxt/ui';

const runtimeConfig = useRuntimeConfig();
const toasterPosition = useToasterState();
const toaster = computed(() => ({ position: toasterPosition.value }));
const appTitle = computed(() => runtimeConfig.public.appTitle || 'Star Blog');

const appSettingsStore = useAppSettingsStore();

const transitionName = computed(() => {
  return appSettingsStore.pageAnimation ? appSettingsStore.pageAnimationType : '';
});

const fontOptions = [
  { label: 'HarmonyOS Sans', value: 'HarmonyOS Sans', icon: 'lucide:type' },
  { label: 'DingLieZhuHai', value: 'DingLieZhuHai', icon: 'lucide:pen-tool' },
];

const contextMenuItems = computed<ContextMenuItem[][]>(() => [
  [
    {
      label: '字体',
      icon: 'lucide:a-large-small',
      children: fontOptions.map(font => ({
        label: font.label,
        icon: appSettingsStore.appFont === font.value ? 'lucide:check' : font.icon,
        onSelect(e: Event) {
          e.preventDefault();
          appSettingsStore.setAppFont(font.value);
        },
      })),
    },
  ],
  [
    { label: '更多设置（待完成）', icon: 'lucide:settings', disabled: true },
  ],
]);

useHead(() => ({
  title: appTitle.value,
}));

onMounted(() => {
  appSettingsStore.initAppFont();
});
</script>

<template>
  <UApp
    :locale="zh_cn"
    :toaster="toaster"
  >
    <UContextMenu
      :items="contextMenuItems"
      :ui="{ content: 'w-48' }"
    >
      <NuxtLayout>
        <NuxtPage
          :transition="{
            name: transitionName,
            mode: 'out-in',
            appear: true,
          }"
        />
      </NuxtLayout>
    </UContextMenu>
  </UApp>
</template>

<style>
/* 隐藏最外层滚动条 */
html::-webkit-scrollbar {
  display: none;
}

html {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
