<script setup lang="ts">
import { venusUploadProps } from './props';
import { isValidImageType } from '~/utils/file-util';
import { ossActionApis, ossFetchApis, ossUploadApi } from '~/apis/oss';

const props = defineProps({
  ...venusUploadProps,
});

const model = defineModel<string | string[] | null>('value', { default: null });

const toast = useToast();

interface UploadFile {
  fileId: string
  url: string
  name: string
  status: 'uploading' | 'success' | 'error'
}

const fileList = ref<UploadFile[]>([]);
const fileInputRef = ref<HTMLInputElement>();
const dragging = ref(false);

const limit = computed(() => props.multiple ? (props.max ?? 5) : 1);
const accept = computed(() => props.fileType === 'image' ? 'image/*' : '*');

// 从 model 恢复 fileList
watch(
  () => model.value,
  async (value) => {
    if (!value) {
      fileList.value = [];
      return;
    }
    const ids = Array.isArray(value) ? value : [value];
    // 避免重复解析
    const existingIds = fileList.value.map(f => f.fileId);
    if (ids.length === existingIds.length && ids.every((id, i) => id === existingIds[i])) {
      return;
    }
    const files: UploadFile[] = [];
    for (const id of ids) {
      if (id.startsWith('http')) {
        files.push({ fileId: id, url: id, name: id.split('/').pop() || 'file', status: 'success' });
      } else {
        try {
          const { data } = await ossFetchApis().fetchVisitUrl({ params: { fileId: id } });
          const url = data.value as string || '';
          files.push({ fileId: id, url, name: url.split('/').pop() || 'file', status: 'success' });
        } catch {
          files.push({ fileId: id, url: '', name: 'file', status: 'error' });
        }
      }
    }
    fileList.value = files;
  },
  { immediate: true },
);

/**
 * 同步 model 值
 */
function syncModel() {
  const ids = fileList.value.filter(f => f.status === 'success').map(f => f.fileId);
  model.value = props.multiple ? ids : (ids[0] ?? null);
}

/**
 * 触发文件输入框点击事件
 */
function triggerFileInput() {
  if (props.disabled) return;
  fileInputRef.value?.click();
}

/**
 * 处理文件选择事件
 */
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    handleFiles(Array.from(files));
  }
  target.value = '';
}

/**
 * 处理拖放事件
 */
function handleDrop(event: DragEvent) {
  event.preventDefault();
  dragging.value = false;
  if (props.disabled || !props.draggable) return;
  const files = event.dataTransfer?.files;
  if (files) {
    handleFiles(Array.from(files));
  }
}

/**
 * 处理文件上传
 */
async function handleFiles(files: File[]) {
  const remaining = limit.value - fileList.value.length;
  if (remaining <= 0) return;
  const filesToUpload = files.slice(0, remaining);

  for (const file of filesToUpload) {
    if (props.fileType === 'image' && !isValidImageType(file)) {
      toast.add({ title: '仅支持 jpeg、png、jpg、bmp 格式的图片', color: 'error' });
      continue;
    }
    await uploadFile(file);
  }
}

/**
 * 上传文件
 *
 * @param file 文件
 */
async function uploadFile(file: File) {
  const uploadItem: UploadFile = {
    fileId: '',
    url: URL.createObjectURL(file),
    name: file.name,
    status: 'uploading',
  };
  fileList.value.push(uploadItem);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const { id, url } = await ossUploadApi().upload(formData, props.ossProvider, props.fileType) as OssMate;

    uploadItem.fileId = id;
    uploadItem.url = url;
    uploadItem.status = 'success';
    syncModel();
  } catch {
    uploadItem.status = 'error';
    toast.add({ title: '上传失败', color: 'error' });
  }
}

/**
 * 移除文件
 *
 * @param index 文件索引
 */
async function removeFile(index: number) {
  const file = fileList.value[index] as UploadFile;
  if (file.fileId && !file.fileId.startsWith('http')) {
    try {
      await ossActionApis().removeTempObject({ params: { fileId: file.fileId } });
    } catch {
      // 静默处理
    }
  }
  fileList.value.splice(index, 1);
  syncModel();
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <!-- 已上传文件列表 -->
    <div
      v-for="(file, index) of fileList"
      :key="file.fileId || index"
      class="relative group w-24 h-24 border border-default rounded-(--ui-radius) overflow-hidden"
    >
      <img
        v-if="props.fileType === 'image'"
        :src="file.url"
        :alt="file.name"
        class="size-full object-cover"
      >
      <div
        v-else
        class="size-full flex items-center justify-center text-xs text-muted p-1 text-center break-all"
      >
        {{ file.name }}
      </div>
      <!-- 加载中 -->
      <div
        v-if="file.status === 'uploading'"
        class="absolute inset-0 flex items-center justify-center bg-black/40"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="text-white text-xl animate-spin"
        />
      </div>
      <!-- 删除按钮 -->
      <div
        v-if="!props.disabled && file.status !== 'uploading'"
        class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        @click="removeFile(index)"
      >
        <UIcon
          name="i-lucide-trash-2"
          class="text-white text-lg"
        />
      </div>
    </div>

    <!-- 上传按钮 -->
    <div
      v-if="fileList.length < limit && !props.disabled"
      class="w-24 h-24 border-2 border-dashed border-default rounded-(--ui-radius) flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
      :class="{ 'border-primary bg-primary/5': dragging }"
      @click="triggerFileInput"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop="handleDrop"
    >
      <UIcon
        name="i-lucide-plus"
        class="text-2xl text-muted"
      />
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="props.multiple"
      class="hidden"
      @change="handleFileChange"
    >
  </div>
</template>
