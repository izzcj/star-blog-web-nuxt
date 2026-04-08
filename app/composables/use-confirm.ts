import type { ButtonProps, IconProps } from '@nuxt/ui';
import ConfirmDialog from '~/components/confirm-dialog/index.vue';

export interface ConfirmOptions {
  // 确认对话框标题
  title?: string
  // 确认对话框描述
  description?: string
  // 确认对话框内容
  content?: string
  // 确认对话框图标
  icon?: IconProps['name']
  // 确认按钮文字
  confirmText?: string
  // 取消按钮文字
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
  // 是否可取消
  dismissible?: boolean
}

export interface DeleteConfirmOptions extends ConfirmOptions {
  itemName?: string
}

export const useConfirm = () => {
  const overlay = useOverlay();

  async function confirm(options: ConfirmOptions = {}) {
    const modal = overlay.create(ConfirmDialog, {
      destroyOnClose: true,
      props: {
        title: '确认操作',
        description: '请确认是否继续执行当前操作',
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
        ...options,
      },
    });

    const result = await modal.open();
    return Boolean(result);
  }

  function confirmDelete(options: string | DeleteConfirmOptions = {}) {
    const deleteOptions = typeof options === 'string'
      ? { itemName: options }
      : options;

    const itemLabel = deleteOptions.itemName ? `「${deleteOptions.itemName}」` : '该内容';

    return confirm({
      title: '删除确认',
      description: '删除后将无法恢复',
      content: `确认删除${itemLabel}吗？`,
      icon: 'i-lucide-trash-2',
      confirmText: '删除',
      confirmColor: 'error',
      ...deleteOptions,
    });
  }

  return {
    confirm,
    confirmDelete,
  };
};
