import type { ImportsOptions } from 'nuxt/schema';

/**
 * 构建自动导入配置
 */
export function buildAutoImports(): ImportsOptions {
  return {
    dirs: ['@vueuse/core'],
    presets: [
      {
        from: 'lodash-es',
        imports: [
          'isString',
          'isBoolean',
          'isArray',
          'isNumber',
          'isFunction',
          'isPlainObject',
          'isEqual',
          'isNaN',
          'isNil',
          'isNull',
          'isUndefined',
          'isEmpty',
          'cloneDeep',
          'trim',
          'trimStart',
          'trimEnd',
          'merge',
          'omit',
          'pick',
          'chunk',
          'keys',
          'values',
          'camelCase',
          'kebabCase',
          'lowerCase',
          'snakeCase',
          'startCase',
          'upperCase',
          'upperFirst',
          'lowerFirst',
          'toLower',
          'toUpper',
          'groupBy',
          'debounce',
          'throttle',
          'last',
          'assign',
          'assignWith',
        ],
      },
    ],
  } as ImportsOptions;
}
