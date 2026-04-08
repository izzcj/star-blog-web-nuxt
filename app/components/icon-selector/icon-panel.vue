<script setup lang="ts">
import type { IconItem } from '~/utils/icon-util';
import { searchIcons } from '~/utils/icon-util';

interface Props {
  icons: IconItem[]
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const searchKeyword = ref('');
const selectedIcon = ref(props.modelValue);

watch(() => props.modelValue, v => (selectedIcon.value = v));

const filteredIcons = computed(() => searchIcons(props.icons, searchKeyword.value));

/**
 * 选择图标
 *
 * @param name 图标名称
 */
function selectIcon(name: string) {
  selectedIcon.value = name;
  emit('update:modelValue', name);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <UInput
      v-model="searchKeyword"
      placeholder="搜索图标名称..."
      icon="i-lucide-search"
      class="w-full"
    />

    <div
      v-if="filteredIcons.length"
      class="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-2 max-h-100 overflow-y-auto border border-default rounded-(--ui-radius) p-2"
    >
      <UTooltip
        v-for="icon of filteredIcons"
        :key="icon.name"
        :text="icon.displayName || icon.name"
      >
        <div
          class="flex items-center justify-center cursor-pointer border border-default rounded-(--ui-radius) p-2 transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-sm hover:border-primary hover:bg-primary/5"
          :class="selectedIcon === icon.name ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : ''"
          @click="selectIcon(icon.name)"
        >
          <UIcon
            :name="icon.name"
            class="text-2xl"
          />
        </div>
      </UTooltip>
    </div>

    <div
      v-else
      class="flex items-center justify-center h-48 text-muted border border-default rounded-(--ui-radius)"
    >
      没有找到匹配的图标
    </div>
  </div>
</template>
