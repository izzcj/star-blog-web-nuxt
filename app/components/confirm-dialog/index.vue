<script setup lang="ts">
import type { ButtonProps, IconProps } from '@nuxt/ui';

interface Props {
  // 是否显示确认对话框
  open?: boolean
  // 标题
  title?: string
  // 描述
  description?: string
  // 内容
  content?: string
  // 图标名称
  icon?: IconProps['name']
  // 确认按钮文本
  confirmText?: string
  // 取消按钮文本
  cancelText?: string
  // 确认按钮颜色
  confirmColor?: ButtonProps['color']
  // 确认按钮样式
  confirmVariant?: ButtonProps['variant']
  // 取消按钮颜色
  cancelColor?: ButtonProps['color']
  // 取消按钮样式
  cancelVariant?: ButtonProps['variant']
  // 是否关闭对话框
  close?: boolean
  // 是否可关闭
  dismissible?: boolean
}

withDefaults(defineProps<Props>(), {
  open: false,
  title: '确认操作',
  description: '',
  content: '',
  icon: 'i-lucide-circle-alert',
  confirmText: '确认',
  cancelText: '取消',
  confirmColor: 'primary',
  confirmVariant: 'solid',
  cancelColor: 'neutral',
  cancelVariant: 'ghost',
  close: true,
  dismissible: true,
});

const emit = defineEmits<{
  'update:open': [value: boolean]
  'close': [confirmed: boolean]
}>();

function handleOpenChange(value: boolean) {
  emit('update:open', value);

  if (!value) {
    emit('close', false);
  }
}

function handleCancel() {
  emit('close', false);
}

function handleConfirm() {
  emit('close', true);
}
</script>

<template>
  <UModal
    :open="open"
    :title="title"
    :description="description"
    :close="close"
    :dismissible="dismissible"
    :ui="{ footer: 'justify-end gap-2' }"
    @update:open="handleOpenChange"
  >
    <template #body>
      <div class="flex items-start gap-3">
        <UIcon
          :name="icon"
          class="mt-0.5 size-5 shrink-0 text-warning"
        />

        <p
          v-if="content"
          class="text-sm leading-6 text-toned"
        >
          {{ content }}
        </p>
      </div>
    </template>

    <template #footer>
      <UButton
        :color="cancelColor"
        :variant="cancelVariant"
        @click="handleCancel"
      >
        {{ cancelText }}
      </UButton>

      <UButton
        :color="confirmColor"
        :variant="confirmVariant"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </UButton>
    </template>
  </UModal>
</template>
