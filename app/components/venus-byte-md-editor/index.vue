<script setup lang="ts">
import 'bytemd/dist/index.css';
import 'juejin-markdown-themes/dist/fancy.min.css';
import 'highlight.js/styles/atom-one-dark.css';
import zhHans from 'bytemd/locales/zh_Hans.json';
import { venusMdEditorProps } from './props';
import { plugins } from './plugins';
import codeCopy from './plugins/code-operation';
import './plugins/code-operation.css';
import { isValidImageType } from '~/utils/file-util';
import { ossUploadApi } from '~/apis/oss';

const props = defineProps({
  ...venusMdEditorProps,
});

const model = defineModel<string | null>();
const toast = useToast();

const ByteMdEditor = defineAsyncComponent(async () => ((await import('@bytemd/vue-next')) as any).Editor);
const ByteMdViewer = defineAsyncComponent(async () => ((await import('@bytemd/vue-next')) as any).Viewer);

const viewerPlugins = [
  ...plugins,
  codeCopy(),
];

async function handleUploadImage(files: File[]) {
  const uploadedImages: Recordable[] = [];
  const formData = new FormData();
  for (let i = files.length - 1; i >= 0; i--) {
    if (!isValidImageType(files[i] as File)) {
      toast.add({ title: '仅支持jpeg,png,jpg,bmp格式的图片', color: 'error' });
      return uploadedImages;
    }
    formData.append(`file${i}`, files[i] as File);
  }

  try {
    const result = await ossUploadApi().upload(formData, props.ossProvider);

    if (Array.isArray(result)) {
      result.forEach((mate: OssMate) => {
        uploadedImages.push({ url: mate.url });
      });
    } else {
      uploadedImages.push({ url: result.url });
    }
  } catch (e) {
    console.log(e);
    toast.add({ title: '图片上传失败', color: 'error' });
  }

  return uploadedImages;
}

function handleContentChange(content: string) {
  model.value = content;
}
</script>

<template>
  <div class="size-full">
    <ByteMdViewer
      v-if="props.preview"
      :value="model"
      :plugins="viewerPlugins"
    />
    <ClientOnly v-else>
      <ByteMdEditor
        :locale="zhHans"
        :value="model"
        :plugins="plugins"
        :upload-images="handleUploadImage"
        @change="handleContentChange"
      />
    </ClientOnly>
  </div>
</template>

<style scoped lang="scss">
:deep(.bytemd) {
  height: calc(100vh - 210px);
}
:deep(.bytemd-body) {
  height: calc(100% - 70px);
}
:deep(.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child) {
  display: none;
}
</style>
