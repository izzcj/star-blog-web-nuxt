import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const menuApiModule = defineApiModule({
  namespace: '/system/menu',
  apis: {
    /**
     * 获取菜单树列表
     */
    fetchTreeList: apiGet<MenuTree[]>('/tree'),
    /**
     * 获取菜单详情
     */
    fetchOne: apiGet<Menu>('/{id}'),
    /**
     * 获取路由菜单
     */
    fetchRoutes: apiGet<MenuRouterInfo[]>('/routers'),
    /**
     * 新增菜单
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改菜单
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 删除菜单
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类菜单API
 */
export const menuFetchApis = () => {
  return createFetchApi(menuApiModule);
};

/**
 * Action类菜单API
 */
export const menuActionApis = () => {
  return createActionApi(menuApiModule);
};
