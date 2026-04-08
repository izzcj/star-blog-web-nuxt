import appSettings from '@/config/app';

export interface AppSettingsState {
  /**
   * 顶部设置
   */
  headerSettings: object
  /**
   * 显示底部
   */
  showFooter: boolean
  /**
   * 是否启用页面动画
   */
  pageAnimation: boolean
  /**
   * 页面动画类型
   */
  pageAnimationType: string
  /**
   * 移动端宽度
   */
  mobileWidth: number
  /**
   * 是否是移动端
   */
  isMobile: boolean
  /**
   * 侧边栏是否折叠
   */
  asideCollapsed: boolean
  /**
   * 全局字体
   */
  appFont: string
}

/**
 * 加载侧边栏折叠状态
 */
function readAsideCollapsed() {
  return useLocalStorage<boolean>('admin-aside-collapsed', appSettings.asideCollapsed).value;
}

/**
 * 保存侧边栏折叠状态
 */
function persistAsideCollapsed(value: boolean) {
  useLocalStorage<boolean>('admin-aside-collapsed', appSettings.asideCollapsed).value = value;
}

const APP_FONT_KEY = 'app-font';
const DEFAULT_FONT = 'HarmonyOS Sans';

/**
 * 加载全局字体
 */
function readAppFont(): string {
  return useLocalStorage<string>(APP_FONT_KEY, DEFAULT_FONT).value;
}

/**
 * 保存全局字体
 */
function persistAppFont(value: string) {
  useLocalStorage<string>(APP_FONT_KEY, DEFAULT_FONT).value = value;
}

export const useAppSettingsStore = defineStore('appSettingsStore', {
  state: (): AppSettingsState => {
    return {
      ...appSettings,
      asideCollapsed: readAsideCollapsed(),
      appFont: readAppFont(),
    };
  },
  getters: {
    /**
     * 获取侧边栏宽度
     */
    asideWidth(state): string {
      if (state.isMobile || state.asideCollapsed) {
        return '60px';
      }

      return '200px';
    },
  },
  actions: {
    /**
     * 同步设备状态
     *
     * @param width 瑙嗗彛瀹藉害
     */
    syncDeviceState(width: number) {
      this.isMobile = width <= this.mobileWidth;
    },
    /**
     * 切换侧边栏折叠状态
     */
    toggleAsideCollapse() {
      this.asideCollapsed = !this.asideCollapsed;

      try {
        persistAsideCollapsed(this.asideCollapsed);
      } catch (e) {
        console.error('Failed to save aside collapsed state:', e);
      }
    },
    /**
     * 设置侧边栏折叠状态
     */
    setAsideCollapse(value: boolean) {
      this.asideCollapsed = value;

      try {
        persistAsideCollapsed(this.asideCollapsed);
      } catch (e) {
        console.error('Failed to save aside collapsed state:', e);
      }
    },
    /**
     * 设置全局字体
     */
    setAppFont(font: string) {
      this.appFont = font;

      try {
        persistAppFont(font);
      } catch (e) {
        console.error('Failed to save app font:', e);
      }

      if (import.meta.client) {
        document.documentElement.style.setProperty('--app-font', `'${font}'`);
      }
    },
    /**
     * 初始化字体（从缓存恢复）
     */
    initAppFont() {
      if (import.meta.client) {
        const savedFont = readAppFont();
        this.appFont = savedFont;
        document.documentElement.style.setProperty('--app-font', `'${savedFont}'`);
      }
    },
  },
});
