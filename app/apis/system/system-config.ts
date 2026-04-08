import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const systemConfigApiModule = defineApiModule({
  namespace: '/system/config',
  apis: {
    /**
     * 获取系统配置列表
     */
    fetchList: apiGet<SystemConfig[]>('/list'),
    /**
     * 获取系统配置
     */
    fetchOne: apiGet<SystemConfig>(),
    /**
     * 新增系统配置
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改系统配置
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 删除系统配置
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类系统配置API
 */
export const systemConfigFetchApis = () => {
  return createFetchApi(systemConfigApiModule);
};

/**
 * Action类系统配置API
 */
export const systemConfigActionApis = () => {
  return createActionApi(systemConfigApiModule);
};
