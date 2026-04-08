import { bool, object, oneOf, string } from 'vue-types';

export const venusTagProps = {
  // Tag对象模式
  tag: object<Tag>(),
  // 属性模式
  name: string(),
  // 图标
  icon: string(),
  // 颜色
  color: string(),
  // 尺寸
  size: oneOf(['lg', 'md', 'sm'] as const).def('md'),
  // 主题
  variant: oneOf(['solid', 'outline', 'subtle', 'soft'] as const).def('subtle'),
  // 是否可关闭
  closable: bool().def(false),
} as const;
