import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const roleApiModule = defineApiModule({
  namespace: '/system/role',
  apis: {
    /**
     * 分页获取角色
     */
    fetchPage: apiGet<PageData<Role>>('/page'),
    /**
     * 获取角色
     */
    fetchOne: apiGet<Role>('/detail/{id}'),
    /**
     * 获取角色选项
     */
    fetchOptions: apiGet<DataOption[]>('/options'),
    /**
     * 获取角色菜单权限
     */
    fetchMenuPermissions: apiGet<string[]>('/{id}/menu'),
    /**
     * 保存角色菜单权限
     */
    saveMenuPermissions: apiPost<void, Recordable<string>>('/{id}/menu'),
    /**
     * 创建角色
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改角色
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 删除角色
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类角色API
 */
export const roleFetchApis = () => {
  return createFetchApi(roleApiModule);
};

/**
 * Action类角色API
 */
export const roleActionApis = () => {
  return createActionApi(roleApiModule);
};

/**
 * 角色信息
 */
export interface Role extends BaseEntity {
  // 角色名称
  name: string
  // 角色类型
  type: string
  // 角色类型名称
  typeName?: string
  // 备注
  remark?: string
  // 排序
  sort: number
  // 是否默认角色
  defaultRole: boolean
}
