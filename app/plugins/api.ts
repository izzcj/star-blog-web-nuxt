import RequestHeader from '~/enums/request-header';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api: typeof $fetch = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    onRequest({ options }) {
      const token = useCookie('token').value;

      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }

      if (options.body instanceof FormData) {
        // 删除默认 header
        options.headers.delete(RequestHeader.CONTENT_TYPE);
      }
    },

    onResponse({ response }) {
      const res = response._data as Partial<ApiResponse> | undefined;

      if (typeof res?.code !== 'number') {
        return;
      }

      if (res.code !== 200) {
        useMessage().error(res?.message ?? '请求失败');
        throw new Error(res.message);
      }

      response._data = res.data;
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo('/login');
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
