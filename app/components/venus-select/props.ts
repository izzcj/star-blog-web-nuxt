import { array, bool, number, oneOf, oneOfType, string } from 'vue-types';
import DataOptionType from '~/enums/data-option-type';

export const venusSelectProps = {
  // 是否多选
  multiple: bool().def(false),
  // 多选时最多可选择数
  multipleLimit: number().def(0),
  // 占位符
  placeholder: string().def('请选择'),
  // 是否禁用
  disabled: bool().def(false),
  // 是否可以清除
  clearable: bool().def(true),
  // 是否可筛选
  searchable: bool().def(true),
  // 无匹配数据提示
  noMatchText: string().def('无匹配数据'),
  // 无数据提示
  noDataText: string().def('无数据'),
  // 选项类型
  optionType: oneOf([DataOptionType.DICT, DataOptionType.ENUM, DataOptionType.CONST]).def(DataOptionType.DICT),
  // 选项key
  optionKey: oneOfType([string(), array<DataOption | DataOptionsGroup>()]),
} as const;
