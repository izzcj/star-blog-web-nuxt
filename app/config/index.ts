import CommonRouterPathName from '@/enums/common-router-path-name';

export default {
  /**
   * API请求成功的结果码
   */
  apiSuccessCode: 200,
  /**
   * API未认证结果码
   */
  apiUnauthorizedCode: 403,
  /**
   * API访问被拒结果码
   */
  apiAccessDeniedCode: 405,
  /**
   * API Token过期结果码
   */
  apiTokenExpiredCode: 410,
  /**
   * 允许的路由路径（无需登录）
   */
  ignoreAuthenticationRoutes: [
    CommonRouterPathName.LOGIN,
    CommonRouterPathName.REDIRECT,
    CommonRouterPathName.SSO_LOGIN,
  ],
  /**
   * 是否允许匿名访问
   */
  anonymousEnable: true,
};
