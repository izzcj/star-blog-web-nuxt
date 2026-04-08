import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const noticeApiModule = defineApiModule({
  namespace: '/system/notice',
  apis: {
    /**
     * 获取通知列表
     */
    fetchPage: apiGet<PageData<Notice>>('/page'),
    /**
     * 获取通知
     */
    fetchOne: apiGet<Notice>('/detail/{id}'),
    /**
     * 新增通知
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 修改通知
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 切换通知发布状态
     */
    togglePublished: apiPut<void, Recordable<string>>('/{id}/toggle-published'),
    /**
     * 删除通知
     */
    delete: apiDelete('/{id}'),
  },
});

/**
 * Fetch类通知API
 */
export const noticeFetchApis = () => {
  return createFetchApi(noticeApiModule);
};

/**
 * Action类通知API
 */
export const noticeActionApis = () => {
  return createActionApi(noticeApiModule);
};

/**
 * 系统通知
 */
export interface Notice extends BaseEntity {
  // 通知类型
  type: string
  // 类型名称
  typeName?: string
  // 标题
  title: string
  // 内容
  content: string
  // 是否发布
  published: boolean
  // 发布时间
  publishedTime?: string
  // 备注
  remark?: string
}
