import { bool } from 'vue-types';

export const avatarUploaderProps = {
  // 是否启用
  enabled: bool().def(true),
  // 是否已有头像
  hasAvatar: bool().def(false),
} as const;
