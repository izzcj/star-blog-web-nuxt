<script setup lang="ts">
import { userFetchApis } from '~/apis/system/user';

const props = defineProps<{
  authorId: string
}>();

// 作者信息
const authorInfo = ref<Omit<User, 'sort' | 'account'>>({
  id: '',
  sex: '',
  avatar: '',
  nickname: '',
  remark: '',
  email: '',
  mobile: '',
  createTime: '',
  updateTime: '',
});
const loading = ref(false);

const { data, status } = await userFetchApis().fetchOne({
  pathParams: { id: props.authorId },
});

if (status.value == 'success') {
  Object.assign(authorInfo.value, data.value);
  loading.value = false;
}
</script>

<template>
  <UCard
    class="border border-gray-100/60 hover:shadow-lg transition-all duration-300 rounded-xl"
  >
    <USkeleton
      v-if="loading"
    />

    <div
      v-else-if="authorInfo.id"
      class="flex flex-col items-center text-center p-2"
    >
      <!-- 头像 -->
      <div class="relative mb-4">
        <VenusAvatar
          v-model:value="authorInfo.avatar"
          size="large"
          class="transition-transform duration-300 ease-out hover:scale-105"
        />
      </div>

      <!-- 昵称 -->
      <h3 class="text-lg font-bold text-gray-800 mb-2">
        {{ authorInfo.nickname }}
      </h3>

      <!-- 简介 -->
      <p class="text-sm text-gray-600 leading-relaxed">
        {{ authorInfo.remark || '暂无简介' }}
      </p>
    </div>

    <div
      v-else
      class="text-center text-sm text-gray-500 py-4"
    >
      作者信息加载失败
    </div>
  </UCard>
</template>

<style scoped lang="scss">
</style>
