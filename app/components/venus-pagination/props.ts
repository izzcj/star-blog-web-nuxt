import { array, number, oneOf } from 'vue-types';

export const venusPaginationProps = {
  // 组件大小
  size: oneOf(['xs', 'sm', 'md', 'lg', 'xl']).def('md'),
  // 总数
  total: number().isRequired,
  // 当前页
  page: number().def(1),
  // 每页条数
  pageSize: number().def(10),
  // 每页条数选项
  pageSizeOptions: array<number>().def([6, 12, 20, 50]),
} as const;
