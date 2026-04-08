<script setup lang="ts">
import type { FormError, FormSubmitEvent, TabsItem } from '@nuxt/ui';
import DataOptionType from '~/enums/data-option-type';
import { userProfileActionApis } from '~/apis/system/user-profile';

interface ProfileFormData {
  avatar: string
  nickname: string
  sex: string
  mobile: string
  email: string
  remark: string
}

interface PasswordFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const userInfoStore = useUserInfoStore();
const message = useMessage();

const profileSubmitting = ref(false);
const passwordSubmitting = ref(false);

const tabs = [
  { label: '个人信息', slot: 'profile' as const, icon: 'i-lucide-user-round' },
  { label: '修改密码', slot: 'password' as const, icon: 'i-lucide-key-round' },
] satisfies TabsItem[];

const profileForm = reactive<ProfileFormData>(createEmptyProfileForm());
const passwordForm = reactive<PasswordFormData>(createEmptyPasswordForm());
const profileSnapshot = ref<ProfileFormData>(createEmptyProfileForm());

const accountLabel = computed(() => userInfoStore.account?.trim() || '-');
const displayName = computed(() => profileForm.nickname?.trim() || accountLabel.value);

function createEmptyProfileForm(): ProfileFormData {
  return {
    avatar: '',
    nickname: '',
    sex: '',
    mobile: '',
    email: '',
    remark: '',
  };
}

function createEmptyPasswordForm(): PasswordFormData {
  return {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

function syncProfileForm() {
  Object.assign(profileForm, {
    avatar: userInfoStore.avatar || '',
    nickname: userInfoStore.nickname || '',
    sex: userInfoStore.sex || '',
    mobile: userInfoStore.mobile || '',
    email: userInfoStore.email || '',
    remark: userInfoStore.remark || '',
  });

  profileSnapshot.value = { ...profileForm };
}

function validateProfile(state: Partial<ProfileFormData>): FormError[] {
  const errors: FormError[] = [];

  if (!state.nickname?.trim()) {
    errors.push({ name: 'nickname', message: '请输入昵称' });
  } else if (state.nickname.trim().length < 2 || state.nickname.trim().length > 20) {
    errors.push({ name: 'nickname', message: '昵称长度需为 2-20 个字符' });
  }

  if (state.mobile && !/^1[3-9]\d{9}$/.test(state.mobile)) {
    errors.push({ name: 'mobile', message: '请输入正确的手机号' });
  }

  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ name: 'email', message: '请输入正确的邮箱地址' });
  }

  if (state.remark && state.remark.length > 200) {
    errors.push({ name: 'remark', message: '简介不能超过 200 个字符' });
  }

  return errors;
}

function validatePassword(state: Partial<PasswordFormData>): FormError[] {
  const errors: FormError[] = [];

  if (!state.oldPassword) {
    errors.push({ name: 'oldPassword', message: '请输入旧密码' });
  }

  if (!state.newPassword) {
    errors.push({ name: 'newPassword', message: '请输入新密码' });
  } else if (state.newPassword.length < 6) {
    errors.push({ name: 'newPassword', message: '新密码至少需要 6 位' });
  } else if (!/[A-Za-z]/.test(state.newPassword) || !/\d/.test(state.newPassword)) {
    errors.push({ name: 'newPassword', message: '新密码需包含字母和数字' });
  }

  if (!state.confirmPassword) {
    errors.push({ name: 'confirmPassword', message: '请再次输入新密码' });
  } else if (state.confirmPassword !== state.newPassword) {
    errors.push({ name: 'confirmPassword', message: '两次输入的新密码不一致' });
  }

  return errors;
}

async function submitProfile(event: FormSubmitEvent<ProfileFormData>) {
  profileSubmitting.value = true;

  try {
    await userProfileActionApis().modify({
      data: {
        nickname: event.data.nickname,
        sex: event.data.sex,
        mobile: event.data.mobile,
        email: event.data.email,
        avatar: event.data.avatar,
        remark: event.data.remark,
      },
    });

    userInfoStore.$patch({
      avatar: event.data.avatar,
      nickname: event.data.nickname,
      sex: event.data.sex,
      mobile: event.data.mobile,
      email: event.data.email,
      remark: event.data.remark,
    });

    syncProfileForm();
    message.success('个人信息保存成功');
  } finally {
    profileSubmitting.value = false;
  }
}

function resetProfile() {
  Object.assign(profileForm, { ...profileSnapshot.value });
}

async function submitPassword(event: FormSubmitEvent<PasswordFormData>) {
  passwordSubmitting.value = true;

  try {
    await userProfileActionApis().changePassword({
      data: {
        oldPassword: event.data.oldPassword,
        newPassword: event.data.newPassword,
      },
    });

    resetPassword();
    message.success('密码修改成功');
  } finally {
    passwordSubmitting.value = false;
  }
}

function resetPassword() {
  Object.assign(passwordForm, createEmptyPasswordForm());
}

syncProfileForm();
</script>

<template>
  <UTabs
    :items="tabs"
    :ui="{ trigger: 'cursor-pointer' }"
  >
    <template #profile>
      <div class="grid gap-6 pt-4 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <div class="flex flex-col items-center gap-4">
          <VenusAvatar
            v-model:value="profileForm.avatar"
            :size="120"
            mode="edit"
            :enable-crop="true"
            :name="displayName"
          />

          <div class="space-y-1 text-center">
            <p class="text-base font-semibold text-highlighted">
              {{ displayName || '未设置昵称' }}
            </p>
            <p class="text-sm text-muted">
              {{ accountLabel }}
            </p>
          </div>
        </div>

        <UForm
          :state="profileForm"
          :validate="validateProfile"
          class="space-y-4"
          @submit="submitProfile"
        >
          <div class="grid gap-4 md:grid-cols-2">
            <UFormField label="账号">
              <UInput
                :model-value="accountLabel"
                disabled
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="昵称"
              name="nickname"
              required
            >
              <UInput
                v-model="profileForm.nickname"
                class="w-full"
                placeholder="请输入昵称"
              />
            </UFormField>

            <UFormField
              label="性别"
              name="sex"
            >
              <VenusSelect
                v-model="profileForm.sex"
                class="w-full"
                :option-type="DataOptionType.DICT"
                option-key="sex"
                placeholder="请选择性别"
              />
            </UFormField>

            <UFormField
              label="手机号"
              name="mobile"
            >
              <UInput
                v-model="profileForm.mobile"
                class="w-full"
                placeholder="请输入手机号"
              />
            </UFormField>

            <UFormField
              label="邮箱"
              name="email"
              class="md:col-span-2"
            >
              <UInput
                v-model="profileForm.email"
                class="w-full"
                placeholder="请输入邮箱地址"
              />
            </UFormField>
          </div>

          <UFormField
            label="个人简介"
            name="remark"
          >
            <UTextarea
              v-model="profileForm.remark"
              class="w-full"
              :rows="4"
              placeholder="请输入个人简介"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="resetProfile"
            >
              重置
            </UButton>
            <UButton
              type="submit"
              :loading="profileSubmitting"
            >
              保存信息
            </UButton>
          </div>
        </UForm>
      </div>
    </template>

    <template #password>
      <div class="space-y-4 pt-4">
        <div>
          <h3 class="text-base font-semibold text-highlighted">
            修改密码
          </h3>
          <p class="mt-1 text-sm text-muted">
            新密码至少需要 6 位，并同时包含字母和数字。
          </p>
        </div>

        <UForm
          :state="passwordForm"
          :validate="validatePassword"
          class="space-y-4"
          @submit="submitPassword"
        >
          <UFormField
            label="旧密码"
            name="oldPassword"
            required
          >
            <UInput
              v-model="passwordForm.oldPassword"
              type="password"
              class="w-full"
              placeholder="请输入旧密码"
            />
          </UFormField>

          <UFormField
            label="新密码"
            name="newPassword"
            required
          >
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full"
              placeholder="请输入新密码"
            />
          </UFormField>

          <UFormField
            label="确认密码"
            name="confirmPassword"
            required
          >
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full"
              placeholder="请再次输入新密码"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="resetPassword"
            >
              重置
            </UButton>
            <UButton
              type="submit"
              :loading="passwordSubmitting"
            >
              确认修改
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UTabs>
</template>
