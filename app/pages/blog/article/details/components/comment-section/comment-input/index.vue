<script setup lang="ts">
interface CommentInputProps {
  // 模式：评论或回复
  mode: 'comment' | 'reply'
  // 占位符文本
  placeholder?: string
  // 最大长度
  maxLength?: number
}

const message = useMessage();

const props = withDefaults(defineProps<CommentInputProps>(), {
  placeholder: '发表评论...',
  maxLength: 500,
});

const emit = defineEmits<{
  submit: [content: string]
  cancel: []
}>();

const authStore = useAuthenticationStore();

// 输入内容
const content = ref('');
// 输入框引用
const textareaRef = ref();

// 剩余字符数
const remainingChars = computed(() => {
  return props.maxLength - content.value.length;
});

// 是否可提交
const canSubmit = computed(() => {
  return content.value.trim().length > 0 && content.value.length <= props.maxLength;
});

/**
 * 聚焦输入框
 */
function focus() {
  textareaRef.value?.focus();
}

/**
 * 提交评论
 */
function handleSubmit() {
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    message.warning('需要登录后才能评论');
    return;
  }

  // 验证内容
  if (!canSubmit.value) {
    return;
  }

  // 触发提交事件
  emit('submit', content.value.trim());

  // 清空内容
  content.value = '';
}

/**
 * 取消评论
 */
function handleCancel() {
  emit('cancel');
}

// 暴露方法给父组件
defineExpose({
  focus,
});
</script>

<template>
  <div class="mb-4">
    <UTextarea
      ref="textareaRef"
      v-model="content"
      class="w-full"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :rows="mode === 'comment' ? 4 : 3"
      :autosize="{ minRows: mode === 'comment' ? 4 : 3, maxRows: 8 }"
      show-word-limit
    />

    <div class="flex justify-between items-center mt-2">
      <span class="text-xs text-gray-400">
        剩余 {{ remainingChars }} 字
      </span>

      <div class="flex gap-2">
        <!-- 对于回复模式，添加取消按钮 -->
        <UButton
          v-if="mode === 'reply'"
          size="sm"
          @click="handleCancel"
        >
          取消
        </UButton>

        <UButton
          size="sm"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ mode === 'comment' ? '发表评论' : '发表回复' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
