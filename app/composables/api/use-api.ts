export type UseApiOptions<T> = Parameters<typeof useFetch<T>>[1];
export type UseApiReturn<T> = ReturnType<typeof useFetch<T>>;

/**
 * useApi 用于发起获取数据的请求
 *
 * @param url 请求地址
 * @param options useFetch 配置
 */
export const useApi = <T>(url: MaybeRefOrGetter<string>, options?: UseApiOptions<T>) => {
  const { $api } = useNuxtApp();

  return useFetch<T>(url, {
    ...options,
    $fetch: $api,
  });
};
