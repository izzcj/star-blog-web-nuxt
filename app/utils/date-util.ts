import { format, differenceInMinutes, differenceInCalendarDays } from 'date-fns';

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

/**
 * 格式化相对时间
 *
 * @param date       日期
 * @param formatDays 触发格式化天数
 */
export function formatRelativeTime(date: string | Date, formatDays?: number): string {
  if (!formatDays) {
    formatDays = 3;
  }
  const target = new Date(toValue(date));
  const now = new Date();

  const diffMinutes = differenceInMinutes(now, target);

  // 未来时间兜底（可选）
  if (diffMinutes < 0) {
    return format(target, 'yyyy-MM-dd HH:mm');
  }

  // 超过指定天数，显示绝对时间
  if (diffMinutes >= formatDays * MINUTES_PER_DAY) {
    const isSameYear = target.getFullYear() === now.getFullYear();
    return format(target, isSameYear ? 'MM-dd' : 'yyyy-MM-dd');
  }

  // 刚刚
  if (diffMinutes < 1) {
    return '刚刚';
  }

  // 分钟前
  if (diffMinutes < MINUTES_PER_HOUR) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.floor(diffMinutes / MINUTES_PER_HOUR);

  // 小时前（24小时内）
  if (diffHours < HOURS_PER_DAY) {
    return `${diffHours} 小时前`;
  }

  const diffCalendarDays = differenceInCalendarDays(now, target);

  // 昨天
  if (diffCalendarDays === 1) {
    return `昨天 ${format(target, 'HH:mm')}`;
  }

  // 前天
  return `前天 ${format(target, 'HH:mm')}`;
}

/**
 * 格式化日期时间
 *
 * @param value 日期时间字符串
 */
export function formatDateTime(value: string) {
  if (!value) {
    return '';
  }

  return `${formatDate(value)}:00`;
}

/**
 * 格式化日期
 *
 * @param value 日期字符串
 */
export function formatDate(value: string) {
  if (!value) {
    return '';
  }

  return value.replace('T', ' ');
}
