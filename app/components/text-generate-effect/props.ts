import { bool, number, string } from 'vue-types';

export const textGenerateEffectProps = {
  // 内容
  words: string().def(''),
  // 模糊效果
  filter: bool().def(true),
  // 持续时间
  duration: number().def(0.7),
  // 延迟时间
  delay: number().def(0),
  // class
  class: string().def(''),
} as const;
