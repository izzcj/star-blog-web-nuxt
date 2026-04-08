import DataOptionType from '~/enums/data-option-type';
import type { UseApiReturn } from '~/composables/api/use-api';
import { enumApis } from '~/apis/enum';
import { dictDataFetchApis } from '~/apis/system/dict-data';

/**
 * 将静态常量列表标准化为 DataOption / DataOptionsGroup
 */
function normalizeConstOptions<T extends DataOption | DataOptionsGroup>(list: T[]): T[] {
  return list.map((item: any) => {
    if ('options' in item && Array.isArray(item.options)) {
      return {
        label: item.label,
        key: item.key ?? item.label,
        options: item.options.map((opt: any) => ({
          label: opt.label ?? opt.value ?? opt,
          value: opt.value ?? opt.label ?? opt,
        })),
      } as DataOptionsGroup;
    }
    return {
      label: item.label ?? item.value ?? item,
      value: item.value ?? item.label ?? item,
    } as DataOption;
  }) as T[];
}

/**
 * 数据选项加载 Composable
 *
 * @param optionType 选项类型
 * @param optionKey  选项key
 * @param autoLoad   是否在参数变化时自动加载，默认 true
 */
export function useLoadDataOptions<T extends DataOption | DataOptionsGroup>(
  optionType: ComputedRef<DataOptionType>,
  optionKey: ComputedRef<string | T[] | undefined>,
  autoLoad = true,
) {
  // DICT 请求
  const dictKey = ref('');
  const dictResult = dictDataFetchApis().fetchOptions({
    params: computed(() => ({ dictKey: dictKey.value })),
    immediate: false,
  }) as UseApiReturn<T[]>;

  // ENUM 请求
  const enumClass = ref('');
  const enumResult = enumApis().fetchOptions({
    params: computed(() => ({ class: enumClass.value })),
    immediate: false,
  }) as UseApiReturn<T[]>;

  // 聚合数据
  const data = computed<T[]>(() => {
    switch (optionType.value) {
      case DataOptionType.DICT:
        return dictResult.data.value ?? [];
      case DataOptionType.ENUM:
        return enumResult.data.value ?? [];
      case DataOptionType.CONST:
        return Array.isArray(optionKey.value) ? normalizeConstOptions(optionKey.value) : [];
      default:
        return [];
    }
  });

  const loading = computed(() => {
    if (optionType.value === DataOptionType.CONST) return false;
    return optionType.value === DataOptionType.DICT ? dictResult.status.value === 'pending' : enumResult.status.value === 'pending';
  });

  const error = computed(() => {
    if (optionType.value === DataOptionType.CONST) return null;
    return optionType.value === DataOptionType.DICT ? dictResult.error.value : enumResult.error.value;
  });

  // 加载数据
  const loadData = async () => {
    if (optionKey.value === undefined || optionKey.value === null) return;
    if (optionType.value === DataOptionType.CONST) return;

    if (optionType.value === DataOptionType.DICT) {
      dictKey.value = optionKey.value as string;
      await dictResult.refresh();
    } else if (optionType.value === DataOptionType.ENUM) {
      enumClass.value = optionKey.value as string;
      await enumResult.refresh();
    }
  };

  // 首次加载
  void loadData();

  // 自动监听参数变化
  if (autoLoad) {
    watch(
      [optionType, optionKey],
      () => {
        void loadData();
      },
      { deep: true },
    );
  }

  return {
    data,
    loading,
    error,
    loadData,
  };
}
