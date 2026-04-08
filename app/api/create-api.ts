import RequestMethod from '@/enums/request-method';
import { useApi, type UseApiOptions, type UseApiReturn } from '@/composables/api/use-api';

declare const apiResponseTypeSymbol: unique symbol;
declare const apiRequestDataTypeSymbol: unique symbol;
declare const apiRequestParamsTypeSymbol: unique symbol;
declare const apiPathParamsTypeSymbol: unique symbol;

// 定义 API 请求参数类型。
type ApiRequestParams = NonNullable<ApiRequest['params']>;
// 定义 API 路径参数类型。
type ApiRequestPathParams = NonNullable<ApiRequest['pathParams']>;
// 定义 API 描述符集合。
type ApiDefinitions = Record<string, Readonly<ApiDescriptor>>;
// 定义 API 模块。
type ApiModuleLike<TApis extends ApiDefinitions = ApiDefinitions> = Omit<ApiModule, 'apis'> & {
  apis: TApis
};

// 定义简化类型。
type Simplify<T> = {
  [K in keyof T]: T[K];
} & {};

// 定义提取路径参数键。
type ExtractPathParamKeys<Uri extends string>
  = Uri extends `${string}{${infer Param}}${infer Rest}`
    ? Param | ExtractPathParamKeys<Rest>
    : never;

// 定义从 URI 推断路径参数类型。
type InferPathParamsFromUri<Uri extends string>
  = [ExtractPathParamKeys<Uri>] extends [never]
    ? undefined
    : Record<ExtractPathParamKeys<Uri>, Undefinable<string | number>>;

// 定义根据请求方法过滤 API 描述符。
type FilterApisByMethod<TApis extends ApiDefinitions, TMethod extends RequestMethod> = {
  [K in keyof TApis as TApis[K] extends { method: infer M } ? M extends TMethod ? K : never : never]: TApis[K];
};

// 定义API描述符类型。
export type TypedApiDescriptor<
  Method extends RequestMethod = RequestMethod,
  Response = unknown,
  Data extends Recordable | undefined = undefined,
  Params extends ApiRequestParams | undefined = undefined,
  PathParams extends ApiRequestPathParams | undefined = undefined,
  Uri extends string = string,
> = Readonly<Omit<ApiDescriptor, 'uri' | 'method'> & {
  uri: Uri
  method: Method
}> & {
  readonly [apiResponseTypeSymbol]?: Response
  readonly [apiRequestDataTypeSymbol]?: Data
  readonly [apiRequestParamsTypeSymbol]?: Params
  readonly [apiPathParamsTypeSymbol]?: PathParams
};

// 定义从 API 描述符推断响应类型。
type InferApiResponse<T extends ApiDescriptor>
  = T extends { readonly [apiResponseTypeSymbol]?: infer Response }
    ? Response
    : unknown;

// 定义从 API 描述符推断请求数据类型。
type InferApiData<T extends ApiDescriptor>
  = T extends { readonly [apiRequestDataTypeSymbol]?: infer Data extends Recordable | undefined }
    ? Data
    : Recordable;

// 定义从 API 描述符推断请求参数类型。
type InferApiParams<T extends ApiDescriptor>
  = T extends { readonly [apiRequestParamsTypeSymbol]?: infer Params extends ApiRequestParams | undefined }
    ? Params
    : ApiRequestParams;

// 定义从 API 描述符推断路径参数类型。
type InferApiPathParams<T extends ApiDescriptor>
  = T extends { readonly [apiPathParamsTypeSymbol]?: infer PathParams extends ApiRequestPathParams | undefined }
    ? PathParams
    : T extends { uri: infer Uri extends string }
      ? InferPathParamsFromUri<Uri>
      : undefined;

// 定义Fetch类API请求输入类型
type FetchApiRequestInput<T extends ApiDescriptor> = Simplify<
  Omit<ActionApiRequestInput<T>, 'params'>
  & Omit<UseApiOptions<InferApiResponse<T>>, '$fetch' | 'method'>
  & (
  [InferApiParams<T>] extends [undefined]
    ? {}
    : { params?: MaybeRefOrGetter<InferApiParams<T>> }
  )
>;

// 定义Action类API请求输入类型。
type ActionApiRequestInput<T extends ApiDescriptor> = Simplify<
  Omit<ApiRequest<Exclude<InferApiData<T>, undefined>>, 'params' | 'pathParams'>
  & (
  [InferApiParams<T>] extends [undefined]
    ? {}
    : { params?: InferApiParams<T> }
  )
  & (
  [InferApiPathParams<T>] extends [undefined]
    ? {}
    : { pathParams?: MaybeRefOrGetter<InferApiPathParams<T>> }
  )
>;

// 定义Fetch类API请求处理程序类型
type FetchApiHandler<T extends ApiDescriptor>
  = (apiRequest?: FetchApiRequestInput<T>) => UseApiReturn<InferApiResponse<T>>;

// 定义Action类API请求处理程序类型
type ActionApiHandler<T extends ApiDescriptor>
  = (apiRequest?: ActionApiRequestInput<T>) => Promise<InferApiResponse<T>>;

// 定义Fetch类API工厂结果类型
export type FetchApiFactoryResult<TApis extends ApiDefinitions> = {
  [K in keyof FilterApisByMethod<TApis, RequestMethod.GET>]: FetchApiHandler<FilterApisByMethod<TApis, RequestMethod.GET>[K]>
};

// 定义Action类API工厂结果类型
export type ActionApiFactoryResult<TApis extends ApiDefinitions> = {
  [K in keyof FilterApisByMethod<TApis, Exclude<RequestMethod, RequestMethod.GET>>]: ActionApiHandler<FilterApisByMethod<TApis, Exclude<RequestMethod, RequestMethod.GET>>[K]>
};

// API描述符额外选项（除 uri/method 外的可选字段）
type ApiDescriptorOptions = Pick<ApiDescriptor, 'fixedParams' | 'fixedData' | 'fixedHeaders' | 'isEncrypt'>;

/**
 * 定义 GET 类型的 API 描述。
 *
 * @example
 * fetchPage: apiGet<PageData<User>>('/page'),
 * fetchOne: apiGet<User>('/{id}'),
 */
export function apiGet<
  Response = unknown,
  Params extends ApiRequestParams = ApiRequestParams,
  const Uri extends string = string,
>(uri?: Uri, options?: ApiDescriptorOptions) {
  return { ...options, uri, method: RequestMethod.GET } as TypedApiDescriptor<
    RequestMethod.GET, Response, undefined, Params, InferPathParamsFromUri<Uri>, Uri
  >;
}

/**
 * 定义 POST 类型的 API 描述。
 *
 * @example
 * create: apiPost<void, Recordable<string>>(''),
 * login: apiPost<void, Recordable<string>>('/auth/login'),
 */
export function apiPost<
  Response = unknown,
  Data extends Recordable = Recordable,
  const Uri extends string = string,
>(uri?: Uri, options?: ApiDescriptorOptions) {
  return { ...options, uri, method: RequestMethod.POST } as TypedApiDescriptor<
    RequestMethod.POST, Response, Data, undefined, InferPathParamsFromUri<Uri>, Uri
  >;
}

/**
 * 定义 PUT 类型的 API 描述。
 *
 * @example
 * modify: apiPut<void, Recordable<string>>(''),
 * resetPassword: apiPut<void, Recordable<string>>('/{id}/password'),
 */
export function apiPut<
  Response = unknown,
  Data extends Recordable = Recordable,
  const Uri extends string = string,
>(uri?: Uri, options?: ApiDescriptorOptions) {
  return { ...options, uri, method: RequestMethod.PUT } as TypedApiDescriptor<
    RequestMethod.PUT, Response, Data, undefined, InferPathParamsFromUri<Uri>, Uri
  >;
}

/**
 * 定义 DELETE 类型的 API 描述。
 *
 * @example
 * delete: apiDelete('/{id}'),
 */
export function apiDelete<
  Response = unknown,
  const Uri extends string = string,
>(uri?: Uri, options?: ApiDescriptorOptions) {
  return { ...options, uri, method: RequestMethod.DELETE } as TypedApiDescriptor<
    RequestMethod.DELETE, Response, undefined, undefined, InferPathParamsFromUri<Uri>, Uri
  >;
}

/**
 * 定义 API 模块并保留字面量类型，便于工厂方法自动推断每个方法。
 */
export function defineApiModule<const TApis extends ApiDefinitions>(module: ApiModuleLike<TApis>) {
  return module;
}

/**
 * 创建写请求 API 调用对象，仅包含 `POST / PUT / DELETE`。
 */
export function createActionApi<TApis extends ApiDefinitions>(module: ApiModuleLike<TApis>): ActionApiFactoryResult<TApis> {
  const apis = module.apis;
  const api = {} as Partial<ActionApiFactoryResult<TApis>>;
  const { $api } = useNuxtApp();

  for (const key of Object.keys(apis) as Array<keyof TApis>) {
    const apiDescriptor = apis[key] as ApiDescriptor;
    if (apiDescriptor.method === RequestMethod.GET) {
      continue;
    }

    (api as Record<keyof TApis, unknown>)[key] = ((apiRequest?: ActionApiRequestInput<typeof apiDescriptor>) => {
      const { uri, method, apiRequest: mergedApiRequest } = mergedRequestInfo(apiDescriptor, apiRequest, module.namespace);

      return $api<InferApiResponse<typeof apiDescriptor>>(
        toValue(uri),
        {
          ...mergedApiRequest,
          method,
          headers: toValue(mergedApiRequest.headers),
          params: toValue(mergedApiRequest.params),
          body: toValue(mergedApiRequest.body),
        },
      );
    }) as ActionApiHandler<typeof apiDescriptor>;
  }

  return api as ActionApiFactoryResult<TApis>;
}

/**
 * 创建获取数据类 API 调用对象，仅包含 `GET`，并返回 `useApi()` 结果以支持 `useFetch` 特性。
 */
export function createFetchApi<TApis extends ApiDefinitions>(module: ApiModuleLike<TApis>): FetchApiFactoryResult<TApis> {
  const apis = module.apis;
  const api = {} as Partial<FetchApiFactoryResult<TApis>>;

  for (const key of Object.keys(apis) as Array<keyof TApis>) {
    const apiDescriptor = apis[key] as ApiDescriptor;
    if (apiDescriptor.method !== RequestMethod.GET) {
      continue;
    }

    (api as Record<keyof TApis, unknown>)[key] = ((apiRequest?: FetchApiRequestInput<typeof apiDescriptor>) => {
      const { uri, apiRequest: mergedApiRequest } = mergedRequestInfo(apiDescriptor, apiRequest as any, module.namespace);

      return useApi<InferApiResponse<typeof apiDescriptor>>(
        uri,
        mergedApiRequest,
      );
    }) as FetchApiHandler<typeof apiDescriptor>;
  }

  return api as FetchApiFactoryResult<TApis>;
}

/**
 * 合并请求信息。
 * 将发起请求时携带的参数或请求头与 api 定义的固定参数或请求头合并。
 * params / headers / body 均以 computed 形式返回，保留响应式追踪能力，使 useFetch 能自动感知变化并重新请求。
 */
function mergedRequestInfo<
  D extends Recordable = Recordable,
  TApiRequest extends ApiRequest<D> = ApiRequest<D>,
>(
  api: ApiDescriptor,
  apiRequest?: TApiRequest,
  namespace?: string,
) {
  const mergedHeaders = computed(() => {
    let headers = toValue(apiRequest?.headers) ?? {};
    if (isPlainObject(api.fixedHeaders)) {
      headers = { ...api.fixedHeaders, ...headers };
    }
    return headers;
  });

  const mergedParams = computed(() => {
    let params = toValue((apiRequest as any)?.params) ?? {};
    if (isPlainObject(api.fixedParams)) {
      params = { ...api.fixedParams, ...params };
    }
    return params;
  });

  const mergedBody = computed(() => {
    let body = toValue(apiRequest?.data);
    if ((api.method === RequestMethod.POST || api.method === RequestMethod.PUT) && isPlainObject(api.fixedData)) {
      body = { ...api.fixedData, ...body } as D;
    }
    return body;
  });

  // 从 restApiRequest 中排除已单独处理的字段，避免与 computed 版本冲突
  const {
    pathParams,
    params: _params,
    data: _data,
    headers: _headers,
    ...restApiRequest
  } = (apiRequest ?? {}) as TApiRequest & { params?: unknown, data?: unknown, headers?: unknown };

  const uri = computed(() => {
    const resolvedPathParams = toValue(pathParams);
    let resolvedUri = api.uri;

    if (resolvedPathParams) {
      resolvedUri = replaceTemplate(api.uri, resolvedPathParams);
    }

    if (namespace) {
      resolvedUri = joinPath(namespace, resolvedUri);
    }

    return resolvedUri;
  });

  return {
    uri,
    method: api.method,
    apiRequest: {
      ...restApiRequest,
      headers: mergedHeaders,
      params: mergedParams,
      body: mergedBody,
    },
  };
}
