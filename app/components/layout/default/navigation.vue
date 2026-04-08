<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const props = withDefaults(defineProps<{
  items: NavigationMenuItem[]
  vertical?: boolean
}>(), {
  vertical: false,
});

const orientation = computed(() => props.vertical ? 'vertical' : 'horizontal');
</script>

<template>
  <UNavigationMenu
    :items="items"
    :orientation="orientation"
    highlight
    highlight-color="primary"
    :ui="{
      link: 'text-base font-semibold',
    }"
  />
</template>
