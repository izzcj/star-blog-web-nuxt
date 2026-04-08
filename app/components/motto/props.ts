import { bool, number, string } from 'vue-types';

export const mottoProps = {
  // motto
  motto: string().def(''),
  // 持续时间
  duration: number().def(150),
  // 延迟时间
  delay: number().def(3000),
  // 播放
  play: bool().def(true),
  // 是否只执行一次
  once: bool().def(false),
} as const;
