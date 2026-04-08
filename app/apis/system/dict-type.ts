import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const dictTypeApiModule = defineApiModule({
  namespace: '/system/dict-type',
  apis: {
    /**
     * 获取字典类型列表
     */
    fetchPage: apiGet<PageData<DictType>>('/page'),
    /**
     * 获取字典类型
     */
    fetchOne: apiGet<DictType>('/{id}'),
    /**
     * 新增字典类型
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改字典类型
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 删除字典类型
     */
    delete: apiDelete('/{id}'),
    /**
     * 刷新缓存
     */
    refreshCache: apiPut<void, Recordable<string>>('/refresh-cache'),
  },
});

/**
 * Fetch类字典类型API
 */
export const dictTypeFetchApis = () => {
  return createFetchApi(dictTypeApiModule);
};

/**
 * Action类字典类型API
 */
export const dictTypeActionApis = () => {
  return createActionApi(dictTypeApiModule);
};

/**
 * 字典分类
 */
export interface DictType extends BaseEntity {
  // 字典名称
  dictName: string
  // 字典key
  dictKey: string
  // 排序
  sort: number
  // 备注
  remark?: string
}
