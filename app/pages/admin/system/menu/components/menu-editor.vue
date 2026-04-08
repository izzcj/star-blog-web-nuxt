<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';

interface MenuEditorForm {
  id?: string
  parentId: string
  name: string
  component: string
  uri: string
  redirectUri: string
  icon: string
  topLevel: boolean
  keepAlive: boolean
  hidden: boolean
  enabled: boolean
  common: boolean
  sort: number
  remark: string
}

interface Props {
  isEdit: boolean
  menuOptions: DataOption[]
  pending?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
});

const model = defineModel<MenuEditorForm>({ required: true });

const emit = defineEmits<{
  submit: []
}>();

function validateForm(state: MenuEditorForm) {
  const errors: Array<{ name: keyof MenuEditorForm, message: string }> = [];

  if (!state.name.trim()) {
    errors.push({ name: 'name', message: '请输入菜单名称' });
  }

  if (!state.component.trim()) {
    errors.push({ name: 'component', message: '请输入组件名称' });
  }

  if (!state.uri.trim()) {
    errors.push({ name: 'uri', message: '请输入路由路径' });
  }

  if (Number.isNaN(Number(state.sort))) {
    errors.push({ name: 'sort', message: '排序必须为数字' });
  }

  return errors;
}

function handleSubmit() {
  emit('submit');
}
</script>

<template>
  <UForm
    :state="model"
    :validate="validateForm"
    class="space-y-4"
    @submit="handleSubmit"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <UFormField
        label="父级菜单"
        name="parentId"
      >
        <VenusSelect
          v-model="model.parentId"
          class="w-full"
          :option-type="DataOptionType.CONST"
          :option-key="props.menuOptions"
          placeholder="请选择父级菜单"
        />
      </UFormField>

      <UFormField
        label="菜单名称"
        name="name"
        required
      >
        <UInput
          v-model="model.name"
          class="w-full"
          placeholder="请输入菜单名称"
        />
      </UFormField>

      <UFormField
        label="组件名称"
        name="component"
        required
      >
        <UInput
          v-model="model.component"
          class="w-full"
          placeholder="例如：SystemUser"
        />
      </UFormField>

      <UFormField
        label="路由路径"
        name="uri"
        required
      >
        <UInput
          v-model="model.uri"
          class="w-full"
          placeholder="例如：/admin/system/user"
        />
      </UFormField>

      <UFormField
        label="重定向路径"
        name="redirectUri"
      >
        <UInput
          v-model="model.redirectUri"
          class="w-full"
          placeholder="可选"
        />
      </UFormField>

      <UFormField
        label="菜单图标"
        name="icon"
      >
        <IconSelector v-model="model.icon" />
      </UFormField>

      <UFormField
        label="排序号"
        name="sort"
      >
        <UInputNumber
          v-model="model.sort"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UFormField label="顶级菜单">
        <USwitch v-model="model.topLevel" />
      </UFormField>

      <UFormField label="启用缓存">
        <USwitch v-model="model.keepAlive" />
      </UFormField>

      <UFormField label="是否启用">
        <USwitch v-model="model.enabled" />
      </UFormField>

      <UFormField label="是否隐藏">
        <USwitch v-model="model.hidden" />
      </UFormField>

      <UFormField label="公共菜单">
        <USwitch v-model="model.common" />
      </UFormField>
    </div>

    <UFormField
      label="备注"
      name="remark"
    >
      <UTextarea
        v-model="model.remark"
        class="w-full"
        :rows="3"
        placeholder="请输入备注"
      />
    </UFormField>

    <div class="flex justify-end gap-2 pt-2">
      <UButton
        type="submit"
        :loading="props.pending"
      >
        {{ props.isEdit ? '保存修改' : '创建菜单' }}
      </UButton>
    </div>
  </UForm>
</template>
