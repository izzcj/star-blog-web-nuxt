/**
 * 根据分类名称生成一致的Tailwind CSS颜色类名
 *
 * @param category 分类名称
 */
export function getCategoryColor(category: string): string {
  const colors = [
    'bg-red-500/80',
    'bg-orange-500/80',
    'bg-amber-500/80',
    'bg-green-500/80',
    'bg-blue-500/80',
    'bg-indigo-500/80',
    'bg-purple-500/80',
    'bg-pink-500/80',
  ];

  // 使用简单的哈希算法确保相同分类返回相同颜色
  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length] as string;
}

/**
 * 根据分类名称生成一致的Tailwind CSS文本颜色类名
 *
 * @param category 分类名称
 */
export function getCategoryTextColor(category: string): string {
  const colors = [
    'text-red-600',
    'text-orange-600',
    'text-amber-600',
    'text-green-600',
    'text-blue-600',
    'text-indigo-600',
    'text-purple-600',
    'text-pink-600',
  ];

  const hash = category.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length] as string;
}
