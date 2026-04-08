import { useInstantMessageStore } from '@/stores/instant-message-store';
import { userProfileFetchApis } from '~/apis/system/user-profile';

export const useUserInfoStore = defineStore('app-user-info', {
  state: (): UserProfile => {
    return {
      id: '',
      account: '',
      nickname: '',
      sex: '',
      mobile: '',
      avatar: '',
      remark: '',
      email: '',
      lastLoginIp: '',
      lastLoginTime: '',
      admin: false,
      roleIds: [],
      permissions: [],
    };
  },
  getters: {
    /**
     * 用户信息是否已经获取过
     */
    isFetched(): boolean {
      return !!this.id;
    },
    /**
     * 是否是管理员
     */
    isAdmin(): boolean {
      return this.admin;
    },
    /**
     * 是否是匿名用户
     */
    isAnonymousUser(): boolean {
      return this.account == 'anonymous';
    },
  },
  actions: {
    /**
     * 清除用户信息
     */
    clearUserInfo() {
      this.$reset();
    },
    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      const instantMessageStore = useInstantMessageStore();
      const message = useMessage();
      return userProfileFetchApis().info()
        .then(resp => {
          this.$patch({
            ...resp.data.value,
          });

          // 连接IM
          instantMessageStore.connectMessageServer();
          return true;
        })
        .catch(e => {
          if (e) {
            message.error('错误提示', typeof e == 'string' ? e : e.message);
          }
          message.error('登录用户信息加载失败，请刷新页面重试！');
          return false;
        });
    },
    /**
     * 构建匿名用户信息
     */
    async buildAnonymousUserInfo() {
      const message = useMessage();
      this.$patch(() => {
        return {
          id: '',
          account: 'anonymous',
          nickname: '匿名用户',
          sex: '',
          mobile: '',
          avatar: '',
          remark: '',
          email: '',
          lastLoginIp: '',
          lastLoginTime: '',
          admin: false,
          roleIds: [],
          permissions: [],
        };
      });
      try {
        const instantMessageStore = useInstantMessageStore();
        instantMessageStore.connectMessageServer();
        return true;
      } catch (e) {
        console.log(e);
        message.error('用户信息构建失败，请刷新页面重试！');
        return false;
      }
    },
  },
});
