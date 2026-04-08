<script setup lang="ts">
import Brand from '@/components/layout/default/brand.vue';
import Navigation from '@/components/layout/default/navigation.vue';
import UserMenu from '@/components/layout/default/user-menu.vue';

const siteTitle = computed(() => 'StarBlog');
const { menuItems } = await useLayoutMenus();
</script>

<template>
  <UHeader
    mode="slideover"
    :ui="{
      root: 'bg-transparent hover:bg-(--venus-menu-bg--color) border-none',
      right: 'pr-10',
    }"
  >
    <template #title>
      <Brand :title="siteTitle" />
    </template>

    <Navigation
      :items="menuItems"
      class="hidden lg:flex"
      :ui="{
        link: 'text-white text-base font-semibold',
      }"
    />

    <template #right>
      <UserMenu />
    </template>

    <template #body>
      <Navigation
        :items="menuItems"
        vertical
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
