import type { Monaco } from '@monaco-editor/loader';

let monacoPromise: Promise<Monaco> | null = null;
let loaderConfigured = false;

async function getMonacoLoader() {
  const { default: loader } = await import('@monaco-editor/loader');

  if (!loaderConfigured) {
    loader.config({
      'paths': {
        vs: '/libs/monaco-editor',
      },
      'vs/nls': {
        availableLanguages: {
          '*': 'zh-cn',
        },
      },
    });

    loaderConfigured = true;
  }

  return loader;
}

/**
 * 初始化Monaco编辑器（单例）
 */
export async function initMonaco() {
  if (import.meta.server) {
    throw new Error('initMonaco can only be called on the client side.');
  }

  if (!monacoPromise) {
    monacoPromise = getMonacoLoader().then(async (loader) => {
      const monaco = await loader.init();

      monaco.editor.defineTheme('venus-dark', {
        base: 'vs-dark',
        inherit: true,
        colors: {},
        rules: [
          { token: 'keyword', fontStyle: 'bold' },
        ],
      });

      monaco.editor.defineTheme('venus-light', {
        base: 'vs',
        inherit: true,
        colors: {},
        rules: [
          { token: 'keyword', fontStyle: 'bold' },
        ],
      });

      return monaco;
    });
  }

  return monacoPromise;
}
