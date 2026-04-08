/**
 * 应用状态
 *
 * @author Ale
 * @version 1.0.0 2025/8/13 15:07
 */
export interface AppStatusStore {
  /**
   * 资源加载状态
   */
  resourceLoadStatus: boolean
}

export const useAppStatusStore = defineStore('appStatusStore', {
  state: (): AppStatusStore => {
    return {
      resourceLoadStatus: false,
    };
  },
  actions: {
    setResourceLoadStatus(status: boolean) {
      this.resourceLoadStatus = status;
    },
  },
});
