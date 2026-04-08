import type { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';

export default function autolinkHeading(): BytemdPlugin {
  return {
    rehype: processor =>
      processor.use(() => {
        return (tree: any) => {
          let index = 0;
          visit(tree, 'element', (node: any) => {
            const tag = node.tagName;
            if (/^h[1-6]$/.test(tag)) {
              node.properties = node.properties || {};
              if (!node.properties.id) {
                node.properties.id = `heading-${index++}`;
              }
            }
          });
        };
      }),
  };
}
