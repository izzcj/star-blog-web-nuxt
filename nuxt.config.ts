// https://nuxt.com/docs/api/configuration/nuxt-config
import { buildAutoImports } from './build/auto-imports';

const publicRuntimeConfig = {
  appTitle: process.env.NUXT_PUBLIC_APP_TITLE ?? '',
  apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? '',
  defaultOssProvider: process.env.NUXT_PUBLIC_DEFAULT_OSS_PROVIDER ?? '',
  instantMessageServerUrl: process.env.NUXT_PUBLIC_INSTANT_MESSAGE_SERVER_URL ?? '',
};

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],
  components: [
    {
      path: '~/components',
      extensions: ['.vue'],
    },
  ],
  imports: buildAutoImports(),
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/star-blog.svg' },
      ],
    },
  },
  css: ['~/assets/css/main.css', '~/styles/index.scss'],
  runtimeConfig: {
    public: publicRuntimeConfig,
  },
  routeRules: {
    '/': { redirect: '/home' },
  },
  compatibilityDate: '2026-04-01',
  nitro: {
    preset: 'node-server',
  },
  vite: {
    optimizeDeps: {
      include: ['lodash-es'],
      exclude: ['monaco-editor'],
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  icon: {
    customCollections: [{
      prefix: 'venus',
      dir: './app/assets/icons',
    }],
  },
});
