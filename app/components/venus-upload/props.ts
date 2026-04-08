import { bool, integer, oneOf, string } from 'vue-types';

export const venusUploadProps = {
  // OSS实现
  ossProvider: string().def(''),
  // 文件类型
  fileType: oneOf(['image', 'file'] as const).def('image'),
  // 是否批量上传
  multiple: bool().def(false),
  // 最大上传文件数量
  max: integer().def(1),
  // 是否可以拖拽上传
  draggable: bool().def(true),
  // 是否禁用
  disabled: bool().def(false),
} as const;
