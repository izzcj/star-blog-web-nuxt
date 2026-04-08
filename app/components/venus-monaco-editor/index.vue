<script setup lang="ts">
import { venusMonacoEditorProps } from './props';
import { initMonaco } from './init';

const props = defineProps({
  ...venusMonacoEditorProps,
});

const model = defineModel<string>({ default: '' });

const editorContainer = ref<HTMLElement>();

const height = computed(() => {
  if (isString(props.height)) {
    return props.height;
  }
  return `${props.height ?? 400}px`;
});

const disabled = computed(() => props.disabled ?? false);

const editorOptions = computed(() => ({
  theme: props.theme ?? 'venus-light',
  language: props.language,
  readOnly: disabled.value,
  fontSize: props.fontSize ?? 18,
  lineNumbers: (props.showLineNumber ?? true) ? 'on' as const : 'off' as const,
}));

let monacoEditor: any = null;

onMounted(async () => {
  const monaco = await initMonaco();
  if (editorContainer.value) {
    const instance = monaco.editor.create(editorContainer.value, {
      lineHeight: 1.5,
      value: model.value,
      fontFamily: 'Consolas, monospace',
      tabIndex: 2,
      folding: false,
      contextmenu: false,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      formatOnPaste: true,
      mouseWheelZoom: true,
      autoClosingQuotes: 'always',
      ...editorOptions.value,
    });
    monacoEditor = instance;
    instance.onDidChangeModelContent(() => {
      const currentContent = instance.getValue();
      if (currentContent !== model.value) {
        model.value = currentContent;
      }
    });
  }
});

onBeforeUnmount(() => {
  monacoEditor?.dispose();
  monacoEditor = null;
});

watch(editorOptions, (options) => {
  monacoEditor?.updateOptions({ ...options });
});

watch(
  () => model.value,
  (value) => {
    if (monacoEditor && monacoEditor.getValue() !== value) {
      monacoEditor.setValue(value ?? '');
    }
  },
);

const borderStyle = computed(() => {
  if (props.border ?? false) {
    return {
      padding: '10px 10px 10px 0',
      borderWidth: '1px',
      borderColor: 'black',
      borderRadius: '20px',
    };
  }
  return {};
});
</script>

<template>
  <div
    ref="editorContainer"
    class="overflow-hidden"
    :style="{ height, width: '100%', ...borderStyle }"
  />
</template>
