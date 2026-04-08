import { apiGet, createFetchApi, defineApiModule } from '~/api/create-api';

const enumApiModule = defineApiModule({
  apis: {
    /**
     * 获取枚举选项列表
     */
    fetchOptions: apiGet<DataOption[]>('/enumeration/options'),
  },
});

/**
 * 枚举API
 */
export const enumApis = () => {
  return createFetchApi(enumApiModule);
};
