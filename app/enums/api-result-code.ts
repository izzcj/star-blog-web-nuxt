import config from '@/config';

/**
 * API 结果码枚举
 */
enum ApiResultCode {
  /**
   * API请求成功的结果码
   */
  SUCCESS = config.apiSuccessCode,
  /**
   * API未认证结果码
   */
  UNAUTHORIZED = config.apiUnauthorizedCode,
  /**
   * API访问被拒结果码
   */
  ACCESS_DENIED = config.apiAccessDeniedCode,
  /**
   * API Token过期结果码
   */
  TOKEN_EXPIRED = config.apiTokenExpiredCode,
}

export default ApiResultCode;
