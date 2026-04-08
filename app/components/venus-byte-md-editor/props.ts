import { bool, string } from 'vue-types';

export const venusMdEditorProps = {
  // OSS实现(图片上传使用)
  ossProvider: string().def(''),
  // 是否仅预览
  preview: bool().def(false),
} as const;
