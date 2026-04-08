import { bool, oneOf, string } from 'vue-types';

export const venusImageProps = {
  // 图片地址(文件ID或URL)
  src: string(),
  // 图片宽度
  width: string().def('100%'),
  // 图片高度
  height: string().def('100%'),
  // 图片填充方式
  fit: oneOf(['fill', 'contain', 'cover', 'inside', 'outside'] as const).def('cover'),
  // 是否懒加载
  lazy: bool().def(false),
  // 图片描述
  alt: string().def('图片'),
} as const;
