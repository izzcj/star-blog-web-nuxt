import { apiPost, createActionApi, defineApiModule } from '~/api/create-api';
import type { AuthenticationState } from '~/stores/authentication-store';

const authApiModule = defineApiModule({
  namespace: '/auth',
  apis: {
    /**
     * 登录
     */
    login: apiPost<AuthenticationState, Recordable<string>>('/login'),
    /**
     * 退出登录
     */
    logout: apiPost<void, Recordable<string>>('/logout'),
  },
});

/**
 * 认证API
 */
export const authApis = () => {
  return createActionApi(authApiModule);
};
