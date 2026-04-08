<script setup lang="ts">
import { venusVdEditorProps } from './props';
import { isValidImageType } from '~/utils/file-util';
import { ossUploadApi } from '~/apis/oss';

const props = defineProps({
  ...venusVdEditorProps,
});

const model = defineModel<string | null>();
const toast = useToast();

const venusEditor = ref<any>(null);

/**
 * 处理图片上传
 */
function handleUploadImage(files: File[]): Nullable<string> {
  const formData = new FormData();
  for (let i = files.length - 1; i >= 0; i--) {
    if (!isValidImageType(files[i] as File)) {
      return '仅支持jpeg,png,jpg,bmp格式的图片';
    }
    formData.append(`file${i}`, files[i] as File);
  }

  ossUploadApi().upload(formData, props.ossProvider).then(res => {
    if (files.length === 1 && !isArray(res)) {
      venusEditor.value?.insertValue(`![${files[0]?.name}](${res.url})\n`);
    } else if (isArray(res)) {
      for (let i = 0; i < files.length; i++) {
        venusEditor.value?.insertValue(`![${files[i]?.name}](${res[i]?.url})\n`);
      }
    }
  }).catch((error: any) => {
    toast.add({ title: '图片上传失败', color: 'error' });
    console.error(error);
  });

  return null;
}

/**
 * 处理blur事件
 */
function handleBlur(value: string) {
  if (props.outputHtml || props.mode === 'wysiwyg') {
    model.value = venusEditor.value?.getHTML();
  } else {
    model.value = value;
  }
}

onMounted(async () => {
  const Vditor = (await import('vditor')).default;
  await import('vditor/dist/index.css');

  if (props.preview) {
    await Vditor.preview(document.getElementById('venus-previewer') as HTMLDivElement, model.value || '', {
      mode: 'light',
      theme: {
        current: 'fancy',
        path: '/vditor-theme',
      },
    });
  } else {
    venusEditor.value = new Vditor('venus-editor', {
      height: props.height,
      width: '100%',
      mode: props.mode,
      value: model.value || '',
      preview: {
        theme: {
          current: 'fancy',
          path: '/vditor-theme',
        },
        markdown: {
          toc: true,
        },
      },
      upload: {
        handler: (files: File[]) => handleUploadImage(files),
        accept: 'image/*',
      },
      customWysiwygToolbar: () => {},
      toolbar: [
        'emoji',
        'headings',
        'bold',
        'italic',
        'strike',
        '|',
        'line',
        'quote',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        'code',
        'inline-code',
        'insert-after',
        'insert-before',
        'undo',
        'redo',
        'upload',
        'link',
        'table',
        'edit-mode',
        'both',
        'preview',
        'fullscreen',
        'outline',
        'export',
      ],
      blur: (value: string) => handleBlur(value),
      cache: { enable: false },
    });
  }
});

onUnmounted(() => {
  if (venusEditor.value) {
    venusEditor.value.destroy();
  }
});
</script>

<template>
  <div class="size-full">
    <div
      v-if="props.preview"
      id="venus-previewer"
    />
    <div
      v-else
      id="venus-editor"
    />
  </div>
</template>
