<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { articleActionApis, articleFetchApis } from '~/apis/blog/article';
import { tagFetchApis } from '~/apis/blog/tag';

interface ArticleEditorForm {
  id?: string
  category: string
  title: string
  summary: string
  content: string
  coverImage: string
  top: boolean
  recommended: boolean
  tagIds: string[]
}

interface Props {
  articleId?: string | null
}

const props = defineProps<Props>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
  saved: []
}>();

const message = useMessage();

const loading = ref(false);
const settingsOpen = ref(false);

const defaultForm = (): ArticleEditorForm => ({
  id: '',
  category: '',
  title: '',
  summary: '',
  content: '',
  coverImage: '',
  top: false,
  recommended: false,
  tagIds: [],
});

const formData = reactive<ArticleEditorForm>(defaultForm());

const currentArticleId = computed(() => props.articleId || '');

const { data: tagOptionsData, refresh: refreshTagOptions } = await tagFetchApis().fetchOptions({
  immediate: false,
});

const { data: articleDetailData, refresh: refreshArticleDetail } = await articleFetchApis().fetchDetail({
  pathParams: computed(() => ({ id: currentArticleId.value })),
  immediate: false,
});

const tagOptions = computed<DataOption[]>(() => tagOptionsData.value ?? []);
const isEdit = computed(() => Boolean(props.articleId));

watch(() => open.value, async (visible) => {
  if (!visible) {
    return;
  }

  await refreshTagOptions();

  if (!props.articleId) {
    Object.assign(formData, defaultForm());
    return;
  }

  loading.value = true;

  try {
    await refreshArticleDetail();

    const detail = articleDetailData.value as ArticleDetail | null;
    if (!detail) {
      return;
    }

    Object.assign(formData, {
      id: detail.id,
      category: detail.category || '',
      title: detail.title || '',
      summary: detail.summary || '',
      content: detail.content || '',
      coverImage: detail.coverImage || '',
      top: Boolean(detail.top),
      recommended: Boolean(detail.recommended),
      tagIds: detail.tags?.map(tag => tag.id).filter(Boolean) ?? [],
    } satisfies ArticleEditorForm);
  } finally {
    loading.value = false;
  }
}, { immediate: true });

function resetForm() {
  Object.assign(formData, defaultForm());
}

function validateForm(state: ArticleEditorForm) {
  const errors: Array<{ name: keyof ArticleEditorForm, message: string }> = [];

  if (!state.title.trim()) {
    errors.push({ name: 'title', message: '请输入文章标题' });
  }

  if (!state.category) {
    errors.push({ name: 'category', message: '请选择文章分类' });
  }

  if (!state.content.trim()) {
    errors.push({ name: 'content', message: '请输入文章内容' });
  }

  return errors;
}

async function handleSubmit() {
  loading.value = true;

  try {
    const payload = {
      ...formData,
      id: formData.id || undefined,
    };

    if (isEdit.value) {
      await articleActionApis().modify({ data: payload });
      message.success('文章保存成功');
    } else {
      await articleActionApis().create({ data: payload });
      message.success('文章创建成功');
    }

    open.value = false;
    emit('saved');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? '编辑文章' : '写文章'"
    :ui="{ content: 'sm:max-w-[96vw] xl:max-w-[1480px] h-[94vh]' }"
  >
    <template #body>
      <UForm
        :state="formData"
        :validate="validateForm"
        class="flex h-full min-h-0 flex-col gap-4"
        @submit="handleSubmit"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1 space-y-3">
            <UInput
              v-model="formData.title"
              size="xl"
              class="w-2/3"
              placeholder="输入文章标题..."
              icon="i-lucide-file-text"
              :ui="{
                base: 'rounded-2xl text-base',
                leadingIcon: 'size-5',
              }"
            />
          </div>

          <div class="flex gap-2">
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-settings-2"
              @click="settingsOpen = true"
            >
              文章设置
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              @click="resetForm"
            >
              清空
            </UButton>
            <UButton
              :loading="loading"
              icon="i-lucide-save"
              @click="handleSubmit"
            >
              保存
            </UButton>
          </div>
        </div>

        <UFormField
          name="content"
          class="min-h-0 flex-1"
        >
          <div class="min-h-0 flex-1 overflow-hidden rounded-2xl bg-default ring-1 ring-default">
            <VenusByteMdEditor v-model="formData.content" />
          </div>
        </UFormField>
      </UForm>

      <USlideover
        v-model:open="settingsOpen"
        side="right"
        title="文章设置"
        :ui="{ content: 'w-full sm:max-w-xl' }"
      >
        <template #body>
          <div class="space-y-4 p-1">
            <UFormField
              label="分类"
              name="category"
              required
            >
              <VenusSelect
                v-model="formData.category"
                class="w-full"
                :option-type="DataOptionType.DICT"
                option-key="article-category"
                placeholder="请选择分类"
              />
            </UFormField>

            <UFormField
              label="标签"
              name="tagIds"
            >
              <VenusSelect
                v-model="formData.tagIds"
                class="w-full"
                :option-type="DataOptionType.CONST"
                :option-key="tagOptions"
                placeholder="请选择标签"
                :multiple="true"
              />
            </UFormField>

            <UFormField
              label="封面"
              name="coverImage"
            >
              <VenusUpload v-model:value="formData.coverImage" />
            </UFormField>

            <UFormField
              label="摘要"
              name="summary"
            >
              <UTextarea
                v-model="formData.summary"
                class="w-full"
                :rows="5"
                placeholder="请输入文章摘要"
              />
            </UFormField>

            <div class="grid gap-4 rounded-2xl border border-default p-4 sm:grid-cols-2">
              <UFormField label="置顶">
                <USwitch v-model="formData.top" />
              </UFormField>

              <UFormField label="推荐">
                <USwitch v-model="formData.recommended" />
              </UFormField>
            </div>
          </div>
        </template>
      </USlideover>
    </template>
  </UModal>
</template>
