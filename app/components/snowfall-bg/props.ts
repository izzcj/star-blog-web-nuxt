import { number, string } from 'vue-types';

export const snowfallBgProps = {
  // 颜色
  color: string().def('#FFFFFFFF'),
  // 数量
  quantity: number().def(100),
  // 速度
  speed: number().def(1),
  // 最大半径
  maxRadius: number().def(3),
  // 最小半径
  minRadius: number().def(1),
  // class
  class: string().def(''),
} as const;
