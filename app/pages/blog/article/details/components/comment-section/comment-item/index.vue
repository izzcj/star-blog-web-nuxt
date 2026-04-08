<script setup lang="ts">
import ReplySection from '../reply-section/index.vue';
import { commentActionApis } from '~/apis/blog/comment';

interface CommentItemProps {
  // 评论数据
  comment: CommentDetail
  // 文章ID
  articleId: string
  // 文章作者ID
  authorId: string
  // 回复数
  replyCount: number
}

const message = useMessage();

const props = defineProps<CommentItemProps>();

const authStore = useAuthenticationStore();
const appSettingsStore = useAppSettingsStore();

// 本地状态（用于乐观更新）
const localComment = ref({ ...props.comment });

// 是否展开回复区域
const showReplySection = ref(false);

// 控制是否显示回复输入框
const showReplyInput = ref(false);

// 回复数量（可能动态变化）
const replyCount = ref(props.replyCount);

// 点赞图标类名
const likeIconClass = computed(() => {
  return localComment.value.liked
    ? 'text-red-500!'
    : 'text-gray-400! hover:text-red-500!';
});

// 头像尺寸
const avatarSize = computed(() => {
  return appSettingsStore.isMobile ? 35 : 40;
});

/**
 * 点赞/取消点赞（防抖处理）
 */
const handleLike = debounce(async () => {
  // 检查登录
  if (!authStore.isLoggedIn) {
    message.warning('请先登录');
    return;
  }

  // 乐观更新
  const previousLiked = localComment.value.liked;
  const previousCount = localComment.value.likeCount;

  localComment.value.liked = !previousLiked;
  localComment.value.likeCount += previousLiked ? -1 : 1;

  try {
    if (previousLiked) {
      await commentActionApis().unLike({
        pathParams: { id: props.comment.id },
      });
    } else {
      await commentActionApis().like({
        pathParams: { id: props.comment.id },
      });
    }
  } catch (error) {
    console.log(error);
    // 回滚
    localComment.value.liked = previousLiked;
    localComment.value.likeCount = previousCount;
    message.error('操作失败，请稍后重试');
  }
}, 300);

/**
 * 切换回复区域
 */
function toggleReplySection() {
  showReplySection.value = !showReplySection.value;
}

/**
 * 显示回复输入框
 */
function showReplyInputHandler() {
  // 检查登录
  if (!authStore.isLoggedIn) {
    message.warning('请先登录后再回复');
    return;
  }

  showReplySection.value = true;
  showReplyInput.value = true;
}

/**
 * 关闭回复输入框
 */
function handleCloseReplyInput() {
  showReplyInput.value = false;
}

/**
 * 回复数量变化
 */
function handleReplyCountChange(count: number) {
  replyCount.value = count;
}
</script>

<template>
  <div class="py-4 border-b border-solid border-[#e8e8e8] last:border-none">
    <!-- 评论头部 -->
    <div class="flex gap-3">
      <!-- 头像 -->
      <VenusAvatar
        v-model:value="localComment.userAvatar"
        :name="localComment.userNickname"
        :size="avatarSize"
        :disabled="true"
        shape="circle"
      />

      <div class="flex-1 min-w-0">
        <!-- 用户名 -->
        <div class="flex items-center gap-1.5 mb-1">
          <span class="font-semibold text-sm text-gray-400">{{ localComment.userNickname }}</span>
          <span
            v-if="localComment.userId === authorId"
            class="text-[10px] leading-none px-1.5 py-0.5 rounded bg-gray-300 text-primary font-medium"
          >作者</span>
        </div>

        <!-- 评论内容 -->
        <div class="text-sm text-gray-700 mb-2">
          {{ localComment.content }}
        </div>

        <!-- 操作栏 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- 发表时间 -->
            <span class="text-gray-400 text-xs">{{ formatRelativeTime(localComment.createTime as string) }}</span>
            <!-- 回复 -->
            <UButton
              class="text-gray-400! hover:text-blue-500! transition-colors"
              variant="ghost"
              size="xs"
              @click="showReplyInputHandler"
            >
              回复
            </UButton>
          </div>
          <!-- 点赞 -->
          <UButton
            class="transition-colors"
            variant="ghost"
            size="xs"
            :class="likeIconClass"
            @click="handleLike"
          >
            <UIcon name="ant-design:like-outlined" />
            <span>{{ localComment.likeCount }}</span>
          </UButton>
        </div>

        <div v-if="replyCount > 0">
          <!-- 回复数量 -->
          <span
            class="text-xs text-blue-500 cursor-pointer"
            @click="toggleReplySection"
          >
            {{ replyCount }} 条回复 {{ showReplySection ? '▲' : '▼' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 回复区域 -->
    <ReplySection
      v-if="showReplySection"
      :comment-id="comment.id as string"
      :article-id="articleId"
      :author-id="authorId"
      :reply-count="replyCount"
      :show-input="showReplyInput"
      @reply-count-change="handleReplyCountChange"
      @close-input="handleCloseReplyInput"
    />
  </div>
</template>

<style scoped lang="scss">
</style>
