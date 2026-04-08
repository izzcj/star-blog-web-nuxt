/**
 * 本地图标集合前缀
 */
export const LOCAL_ICON_PREFIX = 'venus';

/**
 * 图标项
 */
export interface IconItem {
  /** 图标全名（Iconify 格式，如 ant-design:home-outlined / venus:article） */
  name: string
  /** 显示名称 */
  displayName?: string
}

/**
 * 获取本地 SVG 图标列表
 * 读取 app/assets/icons 目录下的所有 SVG 文件，返回 venus:xxx 格式的图标名
 */
export function getLocalIcons(): IconItem[] {
  const svgModules = import.meta.glob('~/assets/icons/*.svg', { eager: true });
  return Object.keys(svgModules)
    .map((path) => {
      const match = path.match(/\/([^/]+)\.svg$/);
      return match ? match[1] : '';
    })
    .filter(Boolean)
    .map(name => ({
      name: `${LOCAL_ICON_PREFIX}:${name}`,
      displayName: name,
    }));
}

/**
 * 将 i-venus-xxx 格式转换为 venus:xxx 格式
 * 兼容 UnoCSS class 写法和 Iconify name 写法
 */
export function normalizeIconName(value: string): string {
  if (!value) return '';
  // i-venus-xxx → venus:xxx
  if (value.startsWith('i-venus-')) {
    return `venus:${value.slice(8)}`;
  }
  return value;
}

/**
 * 判断是否为本地图标
 */
export function isLocalIcon(name: string): boolean {
  const normalized = normalizeIconName(name);
  return normalized.startsWith(`${LOCAL_ICON_PREFIX}:`);
}

/**
 * 搜索图标（大小写不敏感模糊匹配）
 */
export function searchIcons(icons: IconItem[], keyword: string): IconItem[] {
  if (!keyword) return icons;
  const lower = keyword.toLowerCase();
  return icons.filter(icon =>
    icon.name.toLowerCase().includes(lower)
    || icon.displayName?.toLowerCase().includes(lower),
  );
}
