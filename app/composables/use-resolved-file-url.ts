import { ossFetchApis } from '~/apis/oss';

export const useResolvedFileUrl = (src: Ref<string | undefined>) => {
  const resolvedSrc = ref('');
  let latestRequestId = 0;

  watch(
    src,
    async (value, _, onCleanup) => {
      const requestId = ++latestRequestId;
      let isCancelled = false;

      onCleanup(() => {
        isCancelled = true;
      });

      if (!value) {
        resolvedSrc.value = '';
        return;
      }

      if (value.startsWith('http')) {
        resolvedSrc.value = value;
        return;
      }

      resolvedSrc.value = '';

      try {
        const { data } = await ossFetchApis().fetchVisitUrl({
          params: { fileId: value },
        });

        if (isCancelled || requestId !== latestRequestId) {
          return;
        }

        resolvedSrc.value = data.value ?? '';
      } catch {
        if (isCancelled || requestId !== latestRequestId) {
          return;
        }

        resolvedSrc.value = '';
      }
    },
    { immediate: true },
  );

  return resolvedSrc;
};
