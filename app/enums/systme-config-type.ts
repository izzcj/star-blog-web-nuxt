/**
 * 系统配置类型枚举
 */
enum SystemConfigType {
  /**
   * 文本
   */
  TEXT = 'TEXT',

  /**
   * 文本域
   */
  TEXTAREA = 'TEXTAREA',

  /**
   * 数字
   */
  NUMBER = 'NUMBER',

  /**
   * 布尔
   */
  BOOLEAN = 'BOOLEAN',

  /**
   * 下拉单选
   */
  SELECT = 'SELECT',

  /**
   * 下拉多选
   */
  MULTI_SELECT = 'MULTI_SELECT',

  /**
   * 单选
   */
  RADIO = 'RADIO',

  /**
   * 多选
   */
  CHECKBOX = 'CHECKBOX',

  /**
   * 日期时间
   */
  DATE_TIME = 'DATE_TIME',

  /**
   * 日期时间范围
   */
  DATE_TIME_RANGE = 'DATE_TIME_RANGE',

  /**
   * 日期
   */
  DATE = 'DATE',

  /**
   * 日期范围
   */
  DATE_RANGE = 'DATE_RANGE',

  /**
   * 时间
   */
  TIME = 'TIME',

  /**
   * 时间范围
   */
  TIME_RANGE = 'TIME_RANGE',

  /**
   * JSON
   */
  JSON = 'JSON',

  /**
   * 图片
   */
  IMAGE = 'IMAGE',
}

export default SystemConfigType;
