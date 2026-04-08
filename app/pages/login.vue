<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { systemConfigFetchApis } from '~/apis/system/system-config';
import LoginType from '~/enums/login-type';
import CommonRouterPath from '~/enums/common-router-path';

definePageMeta({
  layout: 'none',
});

const router = useRouter();
const route = useRoute();
const redirectUri = route.query.redirect as string | undefined;

const authenticationStore = useAuthenticationStore();
const showPassword = ref(false);

const loading = ref(false);
const rememberMe = ref(false);
const bgLoaded = ref(false);
const rememberedAccount = useLocalStorage<string>('rememberedAccount', '');
const { data: loginBgConfig } = await systemConfigFetchApis().fetchOne({
  params: { key: 'login-bg' },
});

const loginBg = computed(() => (loginBgConfig.value?.value as string | undefined) ?? '');

const state = reactive<LoginData>({
  account: '',
  password: '',
  loginType: LoginType.ACCOUNT_PASSWORD,
});

const validate = (formState: Partial<LoginData>) => {
  const errors: { name: string, message: string }[] = [];
  if (!formState.account) {
    errors.push({ name: 'account', message: '请输入账号' });
  }
  if (!formState.password) {
    errors.push({ name: 'password', message: '请输入密码' });
  }
  return errors;
};

onMounted(() => {
  const savedAccount = rememberedAccount.value;
  if (savedAccount) {
    state.account = savedAccount;
    rememberMe.value = true;
  }
});

watch(loginBg, () => {
  bgLoaded.value = false;
});
/**
 * 提交登录表单
 *
 * @param event 表单事件
 */
async function onSubmit(event: FormSubmitEvent<LoginData>) {
  loading.value = true;
  try {
    await authenticationStore.login(event.data);

    if (rememberMe.value) {
      rememberedAccount.value = state.account;
    } else {
      rememberedAccount.value = '';
    }

    if (redirectUri) {
      await router.replace({ path: decodeURIComponent(redirectUri) });
    } else {
      await router.replace({ path: CommonRouterPath.HOME });
    }
  } catch {
    loading.value = false;
  }
}
</script>

<template>
  <div class="relative w-dvw h-dvh overflow-hidden flex items-center justify-center">
    <!-- 背景图片 -->
    <VenusImage
      v-if="loginBg"
      :src="loginBg"
      class="login-bg fixed! top-0 left-0 w-dvw h-dvh object-cover"
      :class="[{ 'is-loaded': bgLoaded }]"
      fit="cover"
      @load="bgLoaded = true"
    />

    <!-- 渐变蒙版 -->
    <div class="gradient-overlay" />

    <!-- 返回按钮 -->
    <div class="absolute top-5 left-5 z-10">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        class="text-white/90! hover:text-white! hover:-translate-x-1 transition-all duration-300 backdrop-blur-sm"
        @click="router.back()"
      >
        返回
      </UButton>
    </div>

    <!-- 主登录卡片 -->
    <div class="w-full flex items-center justify-center p-5 animate-fade-in-up">
      <div class="glass-card glass-card-hover w-full max-w-112.5 px-10 py-12 rounded-3xl max-md:max-w-[90%] max-md:px-7 max-md:py-9 max-sm:px-5 max-sm:py-7 max-sm:rounded-[20px]">
        <!-- 标题区域 -->
        <div class="text-center mb-8 max-sm:mb-6">
          <h1 class="text-[32px] font-bold text-white/95 mb-2 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] max-md:text-[28px] max-sm:text-2xl">
            欢迎回来
          </h1>
          <p class="text-[15px] text-white/75 font-normal m-0 max-md:text-sm">
            登录到您的账户
          </p>
        </div>

        <!-- 登录表单 -->
        <UForm
          :state="state"
          :validate="validate"
          :validate-on="['blur']"
          class="space-y-5"
          @submit="onSubmit"
        >
          <!-- 账号 -->
          <UFormField name="account">
            <UInput
              v-model="state.account"
              placeholder="请输入账号"
              icon="lucide:user"
              size="xl"
              class="w-full glass-input rounded-xl border-white/30"
            />
          </UFormField>

          <!-- 密码 -->
          <UFormField name="password">
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              icon="lucide:lock"
              size="xl"
              class="w-full glass-input rounded-xl border-white/30"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  :aria-pressed="showPassword"
                  aria-controls="password"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- 记住我 & 忘记密码 -->
          <div class="flex justify-between items-center">
            <UCheckbox
              v-model="rememberMe"
              label="记住我"
              :ui="{
                label: 'text-white/85! text-sm',
              }"
            />
            <UButton
              variant="link"
              class="forgot-password cursor-pointer"
            >
              忘记密码？
            </UButton>
          </div>

          <!-- 登录按钮 -->
          <UButton
            type="submit"
            :loading="loading"
            block
            size="xl"
            class="login-button cursor-pointer"
          >
            {{ loading ? '登录中...' : '登录' }}
          </UButton>
        </UForm>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-bg {
  opacity: 0;
  transform: scale(1.05);
}

.login-bg.is-loaded {
  animation: bgFadeIn 1.2s ease forwards, bgZoom 20s ease-in-out 1.2s infinite alternate;
}

@keyframes bgFadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bgZoom {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.08) translate(-1%, -1%);
  }
}

// 登录按钮
:deep(.login-button) {
  height: 48px;
  background: linear-gradient(135deg, #1677ff 0%, #0ea5e9 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow:
    0 4px 16px rgba(22, 119, 255, 0.4),
    0 8px 24px rgba(22, 119, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 6px 20px rgba(22, 119, 255, 0.5),
      0 12px 32px rgba(22, 119, 255, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

:deep(.forgot-password) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  padding: 0;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.85);
    transition: width 0.3s ease;
  }

  &:hover {
    color: rgba(255, 255, 255, 1);

    &::after {
      width: 100%;
    }
  }
}

@media (max-width: 768px) {
  .login-button {
    height: 44px;
    font-size: 15px;
  }
}
</style>
