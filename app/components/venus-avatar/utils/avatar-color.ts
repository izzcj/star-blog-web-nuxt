/**
 * 字符串哈希函数
 *
 * @param str 输入字符串
 * @returns 哈希值
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * 根据用户名生成确定性背景色
 *
 * @param name 用户名
 * @returns HSL 颜色字符串
 */
export function generateAvatarColor(name: string): string {
  if (!name) {
    return 'hsl(200, 70%, 60%)';
  }

  const hash = stringToHash(name);
  const hue = hash % 360;

  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * 提取用户名首字符
 *
 * @param name 用户名
 * @returns 首字符（中文/英文/数字，最多2个字符）
 */
export function getAvatarText(name: string): string {
  if (!name) {
    return '';
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return '';
  }

  // 中文字符取前两个字
  if (/[\u4E00-\u9FA5]/.test(trimmedName)) {
    return trimmedName.slice(0, 2);
  }

  // 英文字符取前两个字母的大写
  const letters = trimmedName.match(/[a-z]/gi);
  if (letters && letters.length > 0) {
    return letters.slice(0, 2).join('')
      .toUpperCase();
  }

  // 数字或其他字符取前两个
  return trimmedName.slice(0, 2);
}
