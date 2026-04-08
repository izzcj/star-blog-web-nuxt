import { bool, number, oneOf, oneOfType, string } from 'vue-types';

export const venusMonacoEditorProps = {
  // 语言
  language: string().def('javascript'),
  // 主题
  theme: oneOf(['venus-dark', 'venus-light'] as const).def('venus-dark'),
  // 高度
  height: oneOfType([string(), number()]),
  // 是否禁用
  disabled: bool().def(false),
  // 字体大小
  fontSize: number().def(16),
  // 是否显示行号
  showLineNumber: bool().def(true),
  // 是否显示边框
  border: bool().def(false),
} as const;
