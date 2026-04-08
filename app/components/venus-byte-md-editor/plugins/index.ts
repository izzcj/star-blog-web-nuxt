import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import frontMatter from '@bytemd/plugin-frontmatter';
import math from '@bytemd/plugin-math';
import mermaid from '@bytemd/plugin-mermaid';
import gEmoji from '@bytemd/plugin-gemoji';
import breaks from '@bytemd/plugin-breaks';
import mediumZoom from '@bytemd/plugin-medium-zoom';
import autolinkHeading from './autolink-heading';

export const plugins = [
  highlight(),
  frontMatter(),
  gEmoji(),
  breaks(),
  mediumZoom(),
  autolinkHeading(),
  gfm({
    locale: {
      table: '表格',
      task: '任务',
      strike: '自动链接文字',
    },
  }),
  math({
    locale: {
      inline: '内联',
      block: '块级',
    },
  }),
  mermaid({
    locale: {
      mermaid: '图表',
      flowchart: '流程图',
      sequence: '时序图',
      class: '类图',
      state: '状态图',
      er: 'E-R图',
      uj: 'UJ图',
      gantt: '甘特图',
      pie: '饼图',
      mindmap: '思维导图',
      timeline: '时间轴',
    },
  }),
];
