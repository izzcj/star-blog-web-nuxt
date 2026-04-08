import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const userApiModule = defineApiModule({
  namespace: '/system/user',
  apis: {
    /**
     * 分页获取用户
     */
    fetchPage: apiGet<PageData<User>>('/page'),
    /**
     * 获取用户
     */
    fetchOne: apiGet<User>('/{id}'),
    /**
     * 创建用户
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改用户
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 重置密码
     */
    resetPassword: apiPut<void, Recordable<string>>('/{id}/password'),
    /**
     * 分页获取已授权的用户
     */
    fetchAllocatedPage: apiGet<PageData<User>>('/authorized/{roleId}/page'),
    /**
     * 分页获取未授权的用户
     */
    fetchUnallocatedPage: apiGet<PageData<User>>('/unauthorized/{roleId}/page'),
    /**
     * 授权
     */
    authorization: apiPost<void, Recordable<string>>('/authorization'),
    /**
     * 取消授权
     */
    cancelAuthorization: apiPut<void, Recordable<string>>('/authorization/cancel'),
    /**
     * 删除用户
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类用户API
 */
export const userFetchApis = () => {
  return createFetchApi(userApiModule);
};

/**
 * Action类用户API
 */
export const userActionApis = () => {
  return createActionApi(userApiModule);
};
