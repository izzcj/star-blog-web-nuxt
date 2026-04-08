import { apiGet, createFetchApi, defineApiModule } from '~/api/create-api';
import type ActivityType from '~/enums/activity-type';

const activityApiModule = defineApiModule({
  namespace: '/blog/activity',
  apis: {
    /**
     * 分页获取动态列表
     */
    fetchPage: apiGet<PageData<ActivityItem>>('/page'),
  },
});

/**
 * Fetch类动态API
 */
export const activityFetchApis = () => {
  return createFetchApi(activityApiModule);
};

/**
 * 动态项
 */
export interface ActivityItem {
  // ID
  id: string
  // 类型
  type: ActivityType
  // 用户昵称
  userNickname: string
  // 用户头像
  userAvatar: string
  // 内容
  content: string
  // 关联文章标题
  articleTitle: string
  // 关联文章ID
  articleId: string
  // 创建时间
  createTime: string
}
