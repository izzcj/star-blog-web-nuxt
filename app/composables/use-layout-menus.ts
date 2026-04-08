import type { NavigationMenuItem } from '@nuxt/ui';
import { menuFetchApis } from '~/apis/system/menu';
import CommonRouterPath from '~/enums/common-router-path';

export async function useLayoutMenus() {
  const route = useRoute();

  const fallbackItems = computed<NavigationMenuItem[]>(() => [
    {
      label: '起始页',
      to: CommonRouterPath.START,
      icon: 'venus:search',
    },
    {
      label: '首页',
      to: CommonRouterPath.HOME,
      icon: 'venus:home',
      active: route.path === CommonRouterPath.HOME,
    },
    {
      label: '文章',
      to: '/blog/article',
      icon: 'venus:article',
      active: route.path === '/blog/article',
    },
  ]);

  const { data: routes, refresh, error, status } = await menuFetchApis().fetchRoutes();

  const menuItems = computed<NavigationMenuItem[]>(() => {
    if (!routes.value) {
      return fallbackItems.value;
    }

    const dynamicItems = buildNavigationMenuItems(routes.value, route.path);

    return [...fallbackItems.value, ...dynamicItems];
  });

  return {
    routes,
    menuItems,
    error,
    refresh,
    status,
  };
}

/**
 * 构建导航菜单项
 *
 * @param menus 菜单
 * @param currentPath 当前路径
 */
function buildNavigationMenuItems(
  menus: MenuRouterInfo[] = [],
  currentPath: string,
): NavigationMenuItem[] {
  return menus
    .filter(menu => !menu.hidden)
    .map(menu => buildNavigationItem(menu, currentPath));
}

/**
 * 构建导航菜单项
 *
 * @param menu 菜单
 * @param currentPath 当前路径
 * @param basePath 基础路径
 */
function buildNavigationItem(
  menu: MenuRouterInfo,
  currentPath: string,
  basePath = '',
): NavigationMenuItem {
  const currentMenuPath = resolveMenuPath(menu, basePath);
  const nextBasePath = joinPath(basePath, menu.uri);
  const visibleChildren = getVisibleChildren(menu.children);
  const shouldCollapseChildren = menu.topLevel && visibleChildren.length === 1;
  const childItems = shouldCollapseChildren
    ? []
    : visibleChildren.map(child => buildNavigationItem(child, currentPath, nextBasePath));
  const isActive = isCurrentPathActive(currentPath, currentMenuPath)
    || childItems.some(item => Boolean(item.active));

  return {
    label: menu.name,
    to: currentMenuPath,
    icon: menu.icon,
    active: isActive,
    defaultOpen: isActive,
    children: childItems.length > 0 ? childItems : undefined,
  } satisfies NavigationMenuItem;
}

/**
 * 解析菜单路径
 *
 * @param menu 菜单
 * @param basePath 基础路径
 */
function resolveMenuPath(menu: MenuRouterInfo, basePath = '') {
  if (menu.redirectUri) {
    return joinPath(basePath, menu.redirectUri as string);
  }

  return joinPath(basePath, menu.uri as string);
}

/**
 * 判断当前路径是否与目标路径匹配
 *
 * @param currentPath 当前路径
 * @param targetPath 目标路径
 */
function isCurrentPathActive(currentPath: string, targetPath?: string) {
  if (!targetPath || isExternalLink(targetPath)) {
    return false;
  }

  if (targetPath === '/') {
    return currentPath === '/';
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

/**
 * 获取可见的子菜单项
 *
 * @param children 子菜单项
 */
function getVisibleChildren(children?: MenuRouterInfo[]) {
  return (children ?? []).filter(child => !child.hidden);
}
