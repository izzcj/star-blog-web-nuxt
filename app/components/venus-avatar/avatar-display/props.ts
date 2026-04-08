import { number, oneOf, string } from 'vue-types';

export const avatarDisplayProps = {
  // 图片地址
  src: string().isRequired,
  // 用户名
  name: string(),
  // 尺寸（像素）
  size: number(),
  // 形状
  shape: oneOf(['circle', 'square'] as const),
  // 文字颜色
  textColor: string(),
  // 背景色
  bgColor: string(),
} as const;
