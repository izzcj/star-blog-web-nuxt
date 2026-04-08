import { apiDelete, apiGet, apiPost, createActionApi, createFetchApi, defineApiModule } from '~/api/create-api';

const ossApiModule = defineApiModule({
  namespace: '/oss',
  apis: {
    /**
     * 获取访问地址
     */
    fetchVisitUrl: apiGet<string>('/visit-url'),
    /**
     * 上传
     */
    uploadObject: apiPost<OssMate | OssMate[]>('/upload/{ossProvider}/{fileType}'),
    /**
     * 下载
     */
    downloadObject: apiGet('/download'),
    /**
     * 删除临时对象
     */
    removeTempObject: apiDelete(),
  },
});

/**
 * Fetch类OSSAPI
 */
export const ossFetchApis = () => {
  return createFetchApi(ossApiModule);
};

/**
 * Action类OSSAPI
 */
export const ossActionApis = () => {
  return createActionApi(ossApiModule);
};

/**
 * 简化OSS上传API
 */
export const ossUploadApi = () => {
  const config = useRuntimeConfig();

  const upload = (
    formData: FormData,
    ossProvider?: string,
    fileType = 'image',
  ) => {
    if (!ossProvider) {
      ossProvider = config.public.defaultOssProvider;
    }
    return ossActionApis().uploadObject({ data: formData, pathParams: { ossProvider, fileType } });
  };

  return {
    upload,
  };
};
