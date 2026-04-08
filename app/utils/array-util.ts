/**
 * 统一转数组
 */
export function normalizeToArray(val: string | string[] | null | undefined): string[] {
  if (!val) {
    return [];
  }
  return Array.isArray(val) ? val : [val];
}
