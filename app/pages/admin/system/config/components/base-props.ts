import { object, oneOf, string, oneOfType, array, number, bool } from 'vue-types';
import DataOptionType from '@/enums/data-option-type';
import SystemConfigType from '@/enums/systme-config-type';

export const configItemProps = {
  /**
   * 配置项类型
   */
  type: oneOf(values(SystemConfigType)).isRequired,
  /**
   * 配置名称
   */
  label: string().isRequired,
  /**
   * 配置数据
   */
  value: oneOfType([string(), number(), bool(), array<any>(), object<any>()]),
  /**
   * 数据源类型
   */
  dataSourceType: oneOf(values(DataOptionType)),
  /**
   * 数据源配置
   */
  dataSourceConfig: string(),
} as const;
