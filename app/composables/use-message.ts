import type { ToastProps } from '@nuxt/ui';

type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

// 消息配置
interface MessageOptions {
  // 描述
  description?: string
  // 图标
  icon?: string
  // 是否显示进度
  progress?: boolean
  // 持续时间
  duration?: number
  // 操作
  actions?: ToastProps['actions']
  // 弹出位置
  position?: ToastPosition
}

// 全局 toaster 位置状态，绑定到 UApp 的 :toaster prop
export const useToasterState = () => useState<ToastPosition>('toaster-position', () => 'bottom-right');

// 默认图标
const defaultIcons: Record<string, string> = {
  success: 'lucide:circle-check',
  info: 'lucide:info',
  warning: 'lucide:triangle-alert',
  error: 'lucide:circle-x',
};

export const useMessage = () => {
  const nuxtApp = useNuxtApp();

  const show = (title: string, color: ToastProps['color'], options?: MessageOptions) => {
    nuxtApp.runWithContext(() => {
      const position = useToasterState();
      const toast = useToast();

      if (options?.position) {
        position.value = options.position;
      }

      toast.add({
        title,
        color,
        icon: options?.icon ?? defaultIcons[color as string],
        description: options?.description,
        progress: options?.progress ?? true,
        duration: options?.duration,
        actions: options?.actions,
      });
    });
  };

  return {
    success: (title: string, options?: MessageOptions) => show(title, 'success', options),
    error: (title: string, options?: MessageOptions) => show(title, 'error', options),
    warning: (title: string, options?: MessageOptions) => show(title, 'warning', options),
    info: (title: string, options?: MessageOptions) => show(title, 'info', options),
    clear: () => nuxtApp.runWithContext(() => useToast().clear()),
  };
};
