import { bool, number, oneOf, string } from 'vue-types';

export const venusVdEditorProps = {
  // OSS实现(图片上传使用)
  ossProvider: string().def(''),
  // 模式 sv-（分屏预览）markdown ir-（即时渲染）markdown wysiwyg-（所见即所得）富文本模式
  mode: oneOf(['sv', 'ir', 'wysiwyg'] as const).def('wysiwyg'),
  // 是否仅预览
  preview: bool().def(false),
  // 编辑器高度
  height: number().def(800),
  // 是否输出为html
  outputHtml: bool().def(false),
} as const;
