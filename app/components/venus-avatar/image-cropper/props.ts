import { bool, number, string } from 'vue-types';

export const imageCropperProps = {
  // 显示状态
  open: bool().def(false),
  // 标题
  title: string().def('头像编辑'),
  // 图片路径
  path: string().def(''),
  // 输出宽度
  outWidth: number().def(240),
  // 容器宽度
  width: number().def(600),
  // 容器高度
  height: number().def(400),
  // 宽高比
  aspectRatio: number().def(1),
  // 裁剪比例
  coverage: number().def(0.72),
  // 是否可移动
  movable: bool().def(true),
  // 是否圆角
  rounded: bool().def(true),
} as const;
