import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const dictDataApiModule = defineApiModule({
  namespace: '/system/dict-data',
  apis: {
    /**
     * 分页获取字典数据列表
     */
    fetchPage: apiGet<PageData<DictData>>('/page'),
    /**
     * 获取字典数据
     */
    fetchOne: apiGet<DictData>('/{id}'),
    /**
     * 获取字典数据列表
     */
    list: apiGet<DictData[]>('/list'),
    /**
     * 获取字典数据选项
     */
    fetchOptions: apiGet<DataOption[]>('/options'),
    /**
     * 新增字典数据
     */
    create: apiPost<void, Recordable>(),
    /**
     * 修改字典数据
     */
    modify: apiPut<void, Recordable>(),
    /**
     * 删除字典数据
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类字典数据API
 */
export const dictDataFetchApis = () => {
  return createFetchApi(dictDataApiModule);
};

/**
 * Action类字典数据API
 */
export const dictDataActionApis = () => {
  return createActionApi(dictDataApiModule);
};

/**
 * 字典数据
 */
export interface DictData extends BaseEntity {
  // 字典标签
  dictLabel: string
  // 字典值
  dictValue: string
  // 字典键
  dictKey: string
  // CSS类
  cssClass?: string
  // 列表类
  listClass?: string
  // 是否可删除
  deletable?: boolean
  // 排序
  sort: number
  // 是否启用
  enabled: boolean
  // 备注
  remark?: string
}
