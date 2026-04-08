import { apiGet, createFetchApi, defineApiModule } from '~/api/create-api';

const statInfoApiModule = defineApiModule({
  namespace: '/system/stat-info',
  apis: {
    /**
     * 获取日数据统计信息
     */
    fetchDailyStatInfo: apiGet('/daily'),
    /**
     * 获取累计数据统计信息
     */
    fetchAccumulativeStatInfo: apiGet<StatInfo>('/accumulative'),
  },
});

/**
 * Fetch类统计信息API
 */
export const statInfoFetchApis = () => {
  return createFetchApi(statInfoApiModule);
};

/**
 * 统计信息
 */
export interface StatInfo {
  // 访问数
  viewCount: number
  // 文章数
  articleCount: number
  // 评论数
  commentCount: number
}
