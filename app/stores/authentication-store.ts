import { nanoid } from 'nanoid';
import { authApis } from '~/apis/auth';

const ANONYMOUS_TOKEN_KEY = 'AUTHENTICATION_anonymousToken';

function useAnonymousTokenCookie() {
  return useCookie<string | null>(ANONYMOUS_TOKEN_KEY, {
    sameSite: 'lax',
    path: '/',
  });
}

function useAnonymousTokenStorage() {
  return import.meta.client
    ? useLocalStorage<string | null>(ANONYMOUS_TOKEN_KEY, null)
    : null;
}

function getPersistedAnonymousToken() {
  const anonymousTokenCookie = useAnonymousTokenCookie();
  const anonymousTokenStorage = useAnonymousTokenStorage();

  return anonymousTokenCookie.value ?? anonymousTokenStorage?.value ?? null;
}

function syncAnonymousToken(token: string | null) {
  const anonymousTokenCookie = useAnonymousTokenCookie();
  const anonymousTokenStorage = useAnonymousTokenStorage();

  anonymousTokenCookie.value = token;

  if (anonymousTokenStorage) {
    anonymousTokenStorage.value = token;
  }
}

/**
 * 认证信息
 */
export interface AuthenticationState {
  /**
   * 访问Token
   */
  accessToken: Nullable<string>
  /**
   * 访问Token过期时间（秒）
   */
  expiresIn: number
  /**
   * 匿名token
   */
  anonymousToken: Nullable<string>
}

export const useAuthenticationStore = defineStore('app-authentication', {
  state: (): Partial<AuthenticationState> => {
    const token = useCookie<string | null>('token');

    return {
      accessToken: token.value ?? null,
      anonymousToken: getPersistedAnonymousToken(),
    };
  },
  getters: {
    /**
     * 判断是否已经登录
     */
    isLoggedIn(): boolean {
      return !!this.accessToken;
    },
  },
  actions: {
    /**
     * 登录
     *
     * @param formData 登录表单数据
     */
    async login(formData: LoginData) {
      const { accessToken, expiresIn } = await authApis().login({
        data: {
          ...formData,
        },
      });

      this.accessToken = accessToken;
      this.anonymousToken = null;

      const token = useCookie<string | null>('token', {
        maxAge: expiresIn,
        sameSite: 'lax',
        path: '/',
      });

      token.value = accessToken;
      syncAnonymousToken(null);
    },

    /**
     * 退出登录
     */
    async logout() {
      await authApis().logout();
      await this.clearAuthentication();
    },

    /**
     * 构建匿名Token
     */
    async buildAnonymousToken() {
      try {
        if (!this.anonymousToken) {
          this.anonymousToken = getPersistedAnonymousToken() ?? nanoid(12);
        }

        syncAnonymousToken(this.anonymousToken);

        const userInfoStore = useUserInfoStore();
        return await userInfoStore.buildAnonymousUserInfo();
      } catch {
        console.error('构建匿名Token失败');
        return false;
      }
    },

    /**
     * 清除认证信息
     */
    async clearAuthentication() {
      this.accessToken = null;
      this.anonymousToken = null;

      const token = useCookie<string | null>('token');
      token.value = null;

      syncAnonymousToken(null);

      const userInfoStore = useUserInfoStore();
      userInfoStore.clearUserInfo();

      const { refresh } = await useLayoutMenus();
      await refresh();

      const instantMessageStore = useInstantMessageStore();
      instantMessageStore.disconnectMessageServer();
    },
  },
});
