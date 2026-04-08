import { array, bool, number, oneOf, oneOfType, string } from 'vue-types';
import DataOptionType from '~/enums/data-option-type';

export const venusCheckboxProps = {
  // 是否禁用
  disabled: bool().def(false),
  // 最小选择数量
  min: number().def(1),
  // 最大选择数量
  max: number().def(5),
  // 选项类型
  optionType: oneOf([DataOptionType.DICT, DataOptionType.ENUM, DataOptionType.CONST]).def(DataOptionType.DICT),
  // 选项key
  optionKey: oneOfType([string(), array<DataOption>()]),
} as const;
