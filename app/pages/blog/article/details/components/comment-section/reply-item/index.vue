<script setup lang="ts">
import { commentActionApis } from '~/apis/blog/comment';

interface ReplyItemProps {
  // 回复数据
  reply: CommentDetail
  // 文章ID
  articleId: string
  // 文章作者ID
  authorId: string
  // 根评论ID
  rootCommentId: string
}

const message = useMessage();

const props = defineProps<ReplyItemProps>();

const emit = defineEmits<{
  reply: [target: { userId: string, userNickname: string, commentId: string }]
}>();

const authStore = useAuthenticationStore();

// 本地状态
const localReply = ref({ ...props.reply });

// 点赞图标类名
const likeIconClass = computed(() => {
  return localReply.value.liked
    ? 'text-red-500!'
    : 'text-gray-400! hover:text-red-500!';
});

/**
 * 点赞/取消点赞（防抖处理）
 */
const handleLike = debounce(async () => {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录');
    return;
  }

  const previousLiked = localReply.value.liked;
  const previousCount = localReply.value.likeCount;

  localReply.value.liked = !previousLiked;
  localReply.value.likeCount += previousLiked ? -1 : 1;

  try {
    if (previousLiked) {
      await commentActionApis().unLike({
        pathParams: { id: props.reply.id },
      });
    } else {
      await commentActionApis().like({
        pathParams: { id: props.reply.id },
      });
    }
  } catch (error) {
    console.log(error);
    localReply.value.liked = previousLiked;
    localReply.value.likeCount = previousCount;
    message.error('操作失败，请稍后重试');
  }
}, 300);

/**
 * 点击回复
 */
function handleReply() {
  if (!authStore.isLoggedIn) {
    message.warning('请先登录后再回复');
    return;
  }

  emit('reply', {
    userId: props.reply.userId,
    userNickname: props.reply.userNickname,
    commentId: props.reply.id,
  });
}
</script>

<template>
  <div class="py-3 border-b border-solid border-[#e8e8e8] last:border-none">
    <!-- 回复头部 -->
    <div class="flex gap-3">
      <!-- 头像 -->
      <VenusAvatar
        v-model:value="localReply.userAvatar"
        :name="localReply.userNickname"
        :size="40"
        :disabled="true"
        shape="circle"
      />

      <div class="flex-1 min-w-0">
        <!-- 用户名 -->
        <div class="flex items-center gap-1.5 mb-1">
          <span class="font-semibold text-sm text-gray-400">{{ localReply.userNickname }}</span>
          <span
            v-if="localReply.userId === authorId"
            class="text-[10px] leading-none px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium"
          >作者</span>
        </div>

        <!-- 回复内容 -->
        <div class="text-sm text-gray-700 mb-2">
          <span v-if="localReply.replyUserNickname">
            回复
            <span class="text-gray-400 font-medium">
              {{ `${localReply.replyUserNickname}：` }}
            </span>
          </span>
          {{ localReply.content }}
        </div>

        <!-- 操作栏 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- 发表时间 -->
            <span class="text-gray-400 text-xs">{{ formatRelativeTime(localReply.createTime as string) }}</span>
            <!-- 回复 -->
            <UButton
              class="text-gray-400! hover:text-blue-500! transition-colors"
              variant="ghost"
              size="xs"
              @click="handleReply"
            >
              回复
            </UButton>
          </div>
          <!-- 点赞 -->
          <UButton
            class="transition-colors"
            :class="likeIconClass"
            variant="ghost"
            size="xs"
            @click="handleLike"
          >
            <UIcon name="ant-design:like-outlined" />
            <span>{{ localReply.likeCount }}</span>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
</style>
