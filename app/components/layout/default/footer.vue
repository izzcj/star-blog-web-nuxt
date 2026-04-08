<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const currentYear = computed(() => new Date().getFullYear());
const copyrightYear = computed(() => currentYear.value > 2026 ? `2026-${currentYear.value}` : '2026');

const footerItems = computed<NavigationMenuItem[]>(() => [{
  label: 'ICP备案',
  to: 'https://beian.miit.gov.cn',
  target: '_blank',
}, {
  label: '公安备案',
  to: 'https://beian.mps.gov.cn/#/query/webSearch',
  target: '_blank',
}]);
</script>

<template>
  <UFooter class="border-t border-default/60 bg-white/70 backdrop-blur-xl dark:bg-neutral-950/70">
    <template #left>
      <p class="text-muted text-sm">
        热爱生活，也别忘了热爱自己！
      </p>
    </template>

    <UNavigationMenu
      :items="footerItems"
      variant="link"
    />

    <template #right>
      <p class="text-muted text-sm">
        Copyright © {{ copyrightYear }} Ale All Rights Reserved
      </p>
    </template>
  </UFooter>
</template>
