import { array, bool, oneOf, oneOfType, string } from 'vue-types';
import DataOptionType from '~/enums/data-option-type';

export const venusRadioProps = {
  // 是否禁用
  disabled: bool().def(false),
  // 是否默认选中第一个选项
  autoFirst: bool().def(true),
  // 选项类型
  optionType: oneOf([DataOptionType.DICT, DataOptionType.ENUM, DataOptionType.CONST]).def(DataOptionType.DICT),
  // 选项key
  optionKey: oneOfType([string(), array<DataOption>()]),
} as const;
