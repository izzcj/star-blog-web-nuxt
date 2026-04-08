<script setup lang="ts">
import { userProfileFetchApis } from '~/apis/system/user-profile';

const masterInfo: Pick<UserProfile, 'nickname' | 'avatar' | 'remark' | 'email'> = reactive({
  nickname: '',
  avatar: '',
  remark: '',
  email: '',
});
const textShineRef = ref<HTMLElement | null>(null);

/**
 * 更新文本闪烁效果的背景距离
 */
const updateTextShine = async () => {
  await nextTick();
  if (!textShineRef.value) {
    return;
  }

  const textWidth = textShineRef.value.offsetWidth;
  textShineRef.value.style.setProperty('--shine-distance', `${textWidth}px`);
};

const { data } = await userProfileFetchApis().fetchMasterInfo();
if (data.value) {
  const { nickname, avatar, remark, email } = data.value;
  Object.assign(masterInfo, { nickname, avatar, remark, email });
}

onMounted(updateTextShine);
watch(() => masterInfo.nickname, updateTextShine);
</script>

<template>
  <div class="group card-wrapper">
    <UCard
      class="rounded-xl!"
      :ui="{ body: 'p-6' }"
    >
      <div class="flex flex-col items-center text-center">
        <div class="relative mb-4">
          <VenusAvatar
            v-model:value="masterInfo.avatar as string"
            :size="100"
            class="transition-transform duration-300 ease-out group-hover:scale-105 group-hover:rotate-[5deg]"
          />
          <div class="avatar-ring" />
        </div>
        <p
          ref="textShineRef"
          class="mb-3 text-xl text-shine"
        >
          {{ masterInfo.nickname }}
        </p>
        <div
          v-if="masterInfo.remark"
          class="mb-4 text-[14px] leading-normal text-[#666] max-w-50"
        >
          <TextGenerateEffect
            :words="masterInfo.remark as string"
            :duration="3"
          />
        </div>
        <div class="group flex items-center gap-1.5 text-sm text-gray-500 px-4 py-2 bg-gray-100 rounded-full transition duration-200 hover:bg-gray-200 hover:text-blue-500">
          <UIcon
            name="lucide:mail"
            :size="16"
            class="text-gray-500 transition-colors duration-200 group-hover:text-blue-500"
          />
          <span class="font-medium">{{ masterInfo.email }}</span>
        </div>
        <div class="flex items-center gap-3 mt-3">
          <a
            href="https://github.com/izzcj"
            target="_blank"
            rel="noopener noreferrer"
            class="git-link"
          >
            <UIcon
              :size="16"
              name="ant-design:github-filled"
            />
          </a>
          <a
            href="https://gitee.com/izzcj"
            target="_blank"
            rel="noopener noreferrer"
            class="git-link"
          >
            <UIcon
              :size="16"
              name="ri:gitee-fill"
            />
          </a>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style scoped lang="scss">
.card-wrapper {
  background: linear-gradient(163deg, #b5f6d4 0%, #9276fd 100%);
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 16px;
  transition: all 0.4s ease-in-out;

  &:hover {
    box-shadow: 0 12px 40px rgba(146, 118, 253, 0.4);

    .avatar-ring {
      transform: scale(1.2);
      opacity: 0.8;
    }
  }
}

.avatar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 2px solid rgba(146, 118, 253, 0.3);
  z-index: 1;
  transition: all 0.3s ease-in-out;
}

.text-shine {
  color: #fff;
  background: linear-gradient(to right, #9f9f9f 0, #fff 10%, #868686 20%) 0;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  animation: shine 5s infinite linear;
  --shine-distance: 100%;
}

@keyframes shine {
  0% {
    background-position: 0;
  }
  100% {
    background-position: var(--shine-distance);
  }
}

.git-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  padding: 6px 14px;
  background-color: #f5f7fa;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background-color: #e8ebf0;
    color: #409eff;
  }
}

.master-email {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #888;
  padding: 8px 16px;
  background-color: #f5f7fa;
  border-radius: 20px;
  transition: all 0.2s;

  &:hover {
    background-color: #e8ebf0;
    color: #409eff;

    .email-icon {
      color: #409eff;
    }
  }
}
</style>
