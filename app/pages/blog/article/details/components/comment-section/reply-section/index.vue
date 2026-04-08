<script setup lang="ts">
import CommentInput from '../comment-input/index.vue';
import ReplyItem from '../reply-item/index.vue';
import { commentActionApis } from '~/apis/blog/comment';

interface ReplySectionProps {
  // 一级评论ID
  commentId: string
  // 文章ID
  articleId: string
  // 文章作者ID
  authorId: string
  // 回复数量
  replyCount: number | string
  // 是否显示输入框
  showInput?: boolean
}

const message = useMessage();

const props = withDefaults(defineProps<ReplySectionProps>(), {
  showInput: false,
});

const emit = defineEmits<{
  replyCountChange: [count: number]
  // 输入框关闭事件
  closeInput: []
}>();

// 回复状态
const replyState = reactive({
  replies: [] as CommentDetail[],
  currentPage: 1,
  pageSize: 10,
  total: 0,
  loading: false,
});

// 回复输入框状态
const replyInputState = reactive({
  show: props.showInput,
  target: null as { userId: string, userNickname: string, commentId: string } | null,
});

// 监听 showInput 属性变化
watch(() => props.showInput, newVal => {
  replyInputState.show = newVal;
});

// 输入框占位符
const inputPlaceholder = computed(() => {
  return replyInputState.target
    ? `回复 @${replyInputState.target.userNickname}`
    : '发表回复...';
});

/**
 * 加载回复列表
 */
async function loadReplies() {
  const { $api } = useNuxtApp();
  replyState.loading = true;
  try {
    const result = await $api<PageData<CommentDetail>>('/blog/comment/page', {
      params: {
        rootId: props.commentId,
        page: replyState.currentPage,
        size: replyState.pageSize,
      },
    });

    replyState.replies = result.data;
    replyState.total = result.total;

    // 通知父组件回复数量变化
    if (replyState.total !== props.replyCount) {
      emit('replyCountChange', replyState.total);
    }
  } finally {
    replyState.loading = false;
  }
}

/**
 * 页码变化
 */
async function handlePageChange(event: { page: number, pageSize: number }) {
  replyState.currentPage = event.page;
  await loadReplies();
}

/**
 * 点击回复按钮
 */
function handleReplyClick(target: { userId: string, userNickname: string, commentId: string }) {
  replyInputState.show = true;
  replyInputState.target = target;
}

/**
 * 取消回复
 */
function handleCancelReply() {
  replyInputState.show = false;
  replyInputState.target = null;
  emit('closeInput');
}

/**
 * 发表回复
 */
async function handleReplySubmit(content: string) {
  await commentActionApis().create({
    data: {
      articleId: props.articleId,
      content,
      rootId: props.commentId,
      parentId: replyInputState.target?.commentId || props.commentId,
      replyUserId: replyInputState.target?.userId || '',
    },
  });

  message.success('回复发表成功');

  // 重置输入框状态
  replyInputState.target = null;
  replyInputState.show = false;

  // 通知父组件关闭输入框
  emit('closeInput');

  // 重新加载第一页
  replyState.currentPage = 1;
  await loadReplies();
}

// 组件挂载时加载回复
onMounted(() => {
  loadReplies();
});
</script>

<template>
  <div class="mt-3 bg-[#F5F7FA] p-3 rounded-sm">
    <!-- 回复列表 -->
    <div class="mt-3 relative">
      <!-- 加载遮罩 -->
      <div
        v-if="replyState.loading"
        class="absolute inset-0 flex items-center justify-center bg-white/60 z-10"
      >
        <UIcon
          name="lucide:loader-2"
          class="animate-spin text-gray-400"
          :size="24"
        />
      </div>

      <ReplyItem
        v-for="reply of replyState.replies"
        :key="reply.id"
        :reply="reply"
        :article-id="articleId"
        :author-id="authorId"
        :root-comment-id="commentId"
        @reply="handleReplyClick"
      />
    </div>

    <!-- 回复输入框 -->
    <CommentInput
      v-if="replyInputState.show"
      mode="reply"
      :placeholder="inputPlaceholder"
      @submit="handleReplySubmit"
      @cancel="handleCancelReply"
    />

    <!-- 分页器 -->
    <div
      v-if="replyState.total > replyState.pageSize"
      class="flex justify-center mt-4 pt-3 border-t border-solid border-t-[#e8e8e8]"
    >
      <VenusPagination
        :page="replyState.currentPage"
        :page-size="replyState.pageSize"
        :total="replyState.total"
        size="sm"
        @change="handlePageChange"
      />
    </div>

    <!-- 空状态 -->
    <div
      v-if="replyState.total === 0 && !replyState.loading"
      class="text-center py-5"
    >
      <span class="text-xs text-gray-400">暂无回复</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
