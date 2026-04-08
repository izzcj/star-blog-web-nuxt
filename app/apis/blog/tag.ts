import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const tagApiModule = defineApiModule({
  namespace: '/blog/tag',
  apis: {
    /**
     * 获取标签列表
     */
    fetchPage: apiGet<PageData<Tag>>('/page'),
    /**
     * 获取标签
     */
    fetchOne: apiGet<Tag>('/{id}'),
    /**
     * 获取标签选项
     */
    fetchOptions: apiGet<DataOption[]>('/options'),
    /**
     * 获取热门标签
     */
    fetchHot: apiGet<Tag[]>('/hot'),
    /**
     * 新增标签
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改标签
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 删除标签
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类标签API
 */
export const tagFetchApis = () => {
  return createFetchApi(tagApiModule);
};

/**
 * Action类标签API
 */
export const tagActionApis = () => {
  return createActionApi(tagApiModule);
};
