/**
 * 替换模板中参数
 *
 * @param template 模板
 * @param params   参数
 * @return 替换后的模板
 */
export function replaceTemplate(template: string, params: Recordable<Undefinable<string | number>>) {
  let result = template;
  for (const key of keys(params)) {
    const value = params[key];
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * 转换为kebab-case
 *
 * @param value 字符串
 */
export function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/**
 * 判断是否为外部链接
 *
 * @param url url
 */
export function isExternalLink(url: string) {
  return /^https?:\/\//i.test(url);
}

/**
 * 标准化路径
 *
 * @param path 路径
 */
export function normalizePath(path: string) {
  const normalized = path.replace(/\/+/g, '/').replace(/\/$/, '');

  return normalized || '/';
}

/**
 * 拼接路径
 *
 * @param basePath 基础路径
 * @param path     路径
 */
export function joinPath(basePath: string, path: string) {
  if (!path) {
    return normalizePath(basePath || '/');
  }

  if (isExternalLink(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  const fullPath = [basePath, path]
    .filter(Boolean)
    .join('/');

  return normalizePath(fullPath.startsWith('/') ? fullPath : `/${fullPath}`);
}
