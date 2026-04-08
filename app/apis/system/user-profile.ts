import { apiGet, apiPut, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const userProfileApiModule = defineApiModule({
  namespace: '/system/user/profile',
  apis: {
    /**
     * 获取登录用户信息
     */
    info: apiGet<UserProfile>(),
    /**
     * 修改个人信息
     */
    modify: apiPut<void, Recordable<string>>(),
    /**
     * 修改密码
     */
    changePassword: apiPut<void, Recordable<string>>('/password'),
    /**
     * 获取站长信息
     */
    fetchMasterInfo: apiGet<UserProfile>('/master'),
  },
});

/**
 * Fetch类用户信息API
 */
export const userProfileFetchApis = () => {
  return createFetchApi(userProfileApiModule);
};

/**
 * Action类用户信息API
 */
export const userProfileActionApis = () => {
  return createActionApi(userProfileApiModule);
};
