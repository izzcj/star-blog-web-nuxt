/**
 * 请求头枚举
 */
enum RequestHeader {
  /**
   * 请求内容类型
   */
  CONTENT_TYPE = 'Content-Type',
  /**
   * 认证Token头部
   */
  AUTHORIZATION = 'Authorization',
  /**
   * JSON请求类型
   */
  CONTENT_TYPE_APPLICATION_JSON = 'application/json',
  /**
   * 表单请求类型
   */
  CONTENT_TYPE_FORM_URLENCODED = 'application/x-www-form-urlencoded',
  /**
   * 文件表单请求类型
   */
  CONTENT_TYPE_MULTIPART_FORM_DATA = 'multipart/form-data',
}

export default RequestHeader;
