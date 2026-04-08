import type { BytemdPlugin } from 'bytemd';
import { visit } from 'unist-util-visit';

const clipboardCheckIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 15 2 2 4-4"/>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>`;
const successTip = `<span>复制成功!</span>`;

async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('复制代码失败', err);
    }
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('无法复制到剪贴板', err);
    }
    document.body.removeChild(textarea);
  }
}

export default function codeCopy(): BytemdPlugin {
  return {
    rehype: processor =>
      processor.use(() => (tree: any) => {
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'pre') {
            const codeNode = node.children.find((child: any) => child.tagName === 'code');
            const language
              = codeNode?.properties?.className
                ?.find((cls: any) => cls.startsWith('language-'))
                ?.replace('language-', '') || 'text';

            if (codeNode) {
              node.children.unshift({
                type: 'element',
                tagName: 'div',
                properties: { className: ['code-block-extension-header'] },
                children: [
                  {
                    type: 'element',
                    tagName: 'div',
                    properties: { className: ['code-block-extension-headerLeft'] },
                    children: [
                      {
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['code-block-extension-foldBtn'] },
                        children: [{ type: 'text', value: '▼' }],
                      },
                      {
                        type: 'element',
                        tagName: 'span',
                        properties: { className: ['code-block-extension-lang'] },
                        children: [{ type: 'text', value: language }],
                      },
                    ],
                  },
                  {
                    type: 'element',
                    tagName: 'div',
                    properties: { className: ['code-block-extension-headerRight'] },
                    children: [
                      {
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['code-block-extension-copyCodeBtn'] },
                        children: [{ type: 'text', value: '复制' }],
                      },
                    ],
                  },
                ],
              });
            }
          }
        });
      }),

    viewerEffect({ markdownBody }) {
      const copyButtons = markdownBody.querySelectorAll('.code-block-extension-copyCodeBtn');
      const foldButtons = markdownBody.querySelectorAll('.code-block-extension-foldBtn');

      copyButtons.forEach((button: Element) => {
        button.addEventListener('click', () => {
          const pre = button.closest('pre');
          const code = pre?.querySelector('code')?.textContent || '';
          void copyToClipboard(code);

          const tmp = button.innerHTML;
          button.innerHTML = clipboardCheckIcon + successTip;
          setTimeout(() => {
            button.innerHTML = tmp;
          }, 1500);
        });
      });

      foldButtons.forEach((foldButton: Element) => {
        foldButton.addEventListener('click', () => {
          foldButton.classList.toggle('code-block-extension-fold');
          const pre = foldButton.closest('pre');
          const code = pre?.querySelector('code');
          if (code) code.classList.toggle('code-block-extension-fold');
          const headerElement = pre?.querySelector('.code-block-extension-header');
          if (headerElement) headerElement.classList.toggle('code-block-extension-fold');
        });
      });
    },
  };
}
