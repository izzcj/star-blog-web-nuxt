import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const commentApiModule = defineApiModule({
  namespace: '/blog/comment',
  apis: {
    /**
     * 分页获取评论列表
     */
    fetchPage: apiGet<PageData<Comment>>('/page'),
    /**
     * 获取评论
     */
    fetchOne: apiGet<Comment>('/{id}'),
    /**
     * 新增评论
     */
    create: apiPost<void, Recordable<string>>(),
    /**
     * 删除评论
     */
    delete: apiDelete('/{id}'),
    /**
     * 点赞评论
     */
    like: apiPost('/{id}/like'),
    /**
     * 取消点赞
     */
    unLike: apiDelete('/{id}/like'),
    /**
     * 批量审核
     */
    batchAudit: apiPut<void, Recordable<string>>('/batch/audit'),
  },
});

/**
 * Fetch类评论API
 */
export const commentFetchApis = () => {
  return createFetchApi(commentApiModule);
};

/**
 * Action类评论API
 */
export const commentActionApis = () => {
  return createActionApi(commentApiModule);
};
