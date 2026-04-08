export interface AdminMenuItem {
  title: string
  icon: string
  path: string
}

export interface AdminMenuSection {
  title: string
  items: AdminMenuItem[]
}

export const adminMenuSections: AdminMenuSection[] = [
  {
    title: '首页',
    items: [
      {
        title: '仪表盘',
        icon: 'lucide:house',
        path: '/admin',
      },
    ],
  },
  {
    title: '系统管理',
    items: [
      {
        title: '系统配置',
        icon: 'lucide:settings-2',
        path: '/admin/system/config',
      },
      {
        title: '菜单管理',
        icon: 'lucide:menu-square',
        path: '/admin/system/menu',
      },
      {
        title: '角色管理',
        icon: 'lucide:shield-check',
        path: '/admin/system/role',
      },
      {
        title: '用户管理',
        icon: 'lucide:users',
        path: '/admin/system/user',
      },
      {
        title: '字典管理',
        icon: 'lucide:book-copy',
        path: '/admin/system/dict',
      },
      {
        title: '通知管理',
        icon: 'lucide:bell-ring',
        path: '/admin/system/notice',
      },
    ],
  },
  {
    title: '博客管理',
    items: [
      {
        title: '标签管理',
        icon: 'lucide:tags',
        path: '/admin/blog/tag',
      },
      {
        title: '文章管理',
        icon: 'lucide:book-text',
        path: '/admin/blog/article',
      },
      {
        title: '评论管理',
        icon: 'lucide:messages-square',
        path: '/admin/blog/comment',
      },
    ],
  },
];
