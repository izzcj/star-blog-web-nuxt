import CommonRouterPathName from '@/enums/common-router-path-name';

interface FrameworkConfig {
  /**
   * 忽略获取菜单的路由名称
   */
  ignoreFetchMenusRouteNames: string[]
  /**
   * 登录成功跳转的路由名称
   */
  loginSuccessRouteName?: string
}

export const frameworkConfig: FrameworkConfig = {
  ignoreFetchMenusRouteNames: [CommonRouterPathName.SSO_LOGIN, CommonRouterPathName.LOGIN],
  loginSuccessRouteName: 'Home',
};
