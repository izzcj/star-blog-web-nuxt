import { number, string } from 'vue-types';

export const venusBackTopProps = {
  // 触发容器的CSS选择器，默认为window
  target: string().def(''),
  // 滚动高度达到此参数值时才出现
  visibilityHeight: number().def(200),
  // 距离页面右侧的距离
  right: number().def(40),
  // 距离页面底部的距离
  bottom: number().def(40),
} as const;
