/**
 * 计算html元素顶部到视窗底部的距离
 *
 * @param el html元素
 * @return 距离顶部的距离
 */
export function calculateElTopToViewportDistance(el: Element | null) {
  if (!el) {
    return 0;
  }
  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return viewportHeight - rect.top;
}
