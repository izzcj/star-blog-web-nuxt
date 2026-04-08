import { apiDelete, apiGet, apiPost, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const articleApiModule = defineApiModule({
  namespace: '/blog/article',
  apis: {
    /**
     * 分页获取文章列表
     */
    fetchPage: apiGet<PageData<Article>>('/page'),
    /**
     * 获取文章详情
     */
    fetchDetail: apiGet<ArticleDetail>('/detail/{id}'),
    /**
     * 新增文章
     */
    create: apiPost<void, Recordable>(),
    /**
     * 修改文章
     */
    modify: apiPut<void, Recordable>(),
    /**
     * 增加文章浏览次数
     */
    incrementViewCount: apiPut<void, Recordable<string>>('/{id}/view-count'),
    /**
     * 发布文章
     */
    publish: apiPut<void, Recordable<string>>('/{id}/publish'),
    /**
     * 切换置顶状态
     */
    toggleTop: apiPut<void, Recordable<string>>('/{id}/toggle-top'),
    /**
     * 切换推荐状态
     */
    toggleRecommend: apiPut<void, Recordable<string>>('/{id}/toggle-recommend'),
    /**
     * 删除文章
     */
    delete: apiDelete('/{id}'),
    /**
     * 获取文章分类导航栏
     */
    fetchCategoryNavbar: apiGet<CategoryWithCount[]>('/category-navbar'),
  },
});

/**
 * Fetch类文章API
 */
export const articleFetchApis = () => {
  return createFetchApi(articleApiModule);
};

/**
 * Action类文章API
 */
export const articleActionApis = () => {
  return createActionApi(articleApiModule);
};

/**
 * 分类（含文章数）
 */
export interface CategoryWithCount {
  // 分类值
  categoryValue: string
  // 分类名称
  categoryLabel: string
  // 文章数量
  articleCount: number
  // 样式
  cssClass?: string
}
