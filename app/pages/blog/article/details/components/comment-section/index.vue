<script setup lang="ts">
import CommentInput from './comment-input/index.vue';
import CommentItem from './comment-item/index.vue';
import { commentActionApis } from '~/apis/blog/comment';

interface CommentSectionProps {
  // 文章ID
  articleId: string
  // 文章作者ID
  authorId: string
}

const message = useMessage();

const props = defineProps<CommentSectionProps>();

// 评论状态
const commentState = reactive({
  comments: [] as CommentDetail[],
  currentPage: 1,
  pageSize: 5,
  total: 0,
  loading: false,
  hasMore: true,
});

/**
 * 加载评论列表
 *
 * @param append 是否追加到现有列表
 */
async function loadComments(append = false) {
  const { $api } = useNuxtApp();
  commentState.loading = true;
  try {
    const result = await $api<PageData<CommentDetail>>('/blog/comment/page', {
      params: {
        articleId: props.articleId,
        rootId: '0',
        page: commentState.currentPage,
        size: commentState.pageSize,
      },
    });

    const newComments = result.data;

    if (append) {
      commentState.comments.push(...newComments);
    } else {
      commentState.comments = newComments;
    }

    commentState.total = result.total;
    commentState.hasMore = commentState.comments.length < commentState.total;
  } finally {
    commentState.loading = false;
  }
}

/**
 * 加载更多评论
 */
async function loadMoreComments() {
  if (commentState.loading || !commentState.hasMore) {
    return;
  }
  commentState.currentPage++;
  await loadComments(true);
}

/**
 * 发表评论
 *
 * @param content 评论内容
 */
async function handleCommentSubmit(content: string) {
  try {
    await commentActionApis().create({
      data: {
        articleId: props.articleId,
        content,
        rootId: '',
        parentId: '',
        replyUserId: '',
      },
    });

    message.success('评论发表成功');

    // 重新加载第一页
    commentState.currentPage = 1;
    await loadComments(false);
  } catch {
    message.error('评论发表失败，请稍后重试');
  }
}

// 组件挂载时加载评论
onMounted(() => {
  loadComments();
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">评论 ({{ commentState.total }})</span>
      </div>
    </template>

    <!-- 加载状态 -->
    <div
      v-if="commentState.loading && commentState.currentPage === 1"
      class="flex justify-center py-8"
    >
      <UIcon
        name="lucide:loader-2"
        class="animate-spin text-gray-400"
        :size="28"
      />
    </div>

    <!-- 评论列表 -->
    <div v-else>
      <CommentItem
        v-for="comment of commentState.comments"
        :key="comment.id"
        :comment="comment"
        :article-id="articleId"
        :author-id="authorId"
        :reply-count="comment.replyCount"
      />
    </div>

    <!-- 评论输入框 -->
    <CommentInput
      mode="comment"
      placeholder="发表你的评论..."
      @submit="handleCommentSubmit"
    />

    <!-- 加载更多按钮 -->
    <div
      v-if="commentState.hasMore"
      class="flex justify-center py-4"
    >
      <UButton
        :loading="commentState.loading"
        variant="ghost"
        @click="loadMoreComments"
      >
        {{ commentState.loading ? '加载中...' : '更多' }}
      </UButton>
    </div>

    <!-- 空状态 -->
    <UEmpty
      v-if="commentState.total === 0 && !commentState.loading"
      icon="lucide:message-circle"
      title="暂无评论"
      description="快来发表第一条评论吧~"
    />
  </UCard>
</template>
