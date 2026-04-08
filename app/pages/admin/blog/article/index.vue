<script setup lang="ts">
import DataOptionType from '~/enums/data-option-type';
import { articleActionApis, articleFetchApis } from '~/apis/blog/article';
import ArticleEditor from './components/article-editor.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  title: '文章管理',
});

interface ArticleQueryParams {
  category: string
  title: string
  status: string
}

const message = useMessage();
const confirm = useConfirm();

const queryParams = reactive<ArticleQueryParams>({
  category: '',
  title: '',
  status: '',
});

const pagination = reactive({
  page: 1,
  size: 10,
});

const editorOpen = ref(false);
const editingArticleId = ref<string | null>(null);

const { data, status, refresh } = await articleFetchApis().fetchPage({
  params: computed(() => ({
    page: pagination.page,
    size: pagination.size,
    type: queryParams.category || undefined,
    title: queryParams.title || undefined,
    status: queryParams.status || undefined,
  })),
  immediate: false,
});

const rows = computed<Article[]>(() => (data.value?.data ?? []) as Article[]);
const total = computed(() => data.value?.total ?? 0);

const tableColumns = [
  { accessorKey: 'title', header: '标题' },
  { accessorKey: 'categoryName', header: '分类' },
  { accessorKey: 'status', header: '状态' },
  { accessorKey: 'viewCount', header: '浏览量' },
  { accessorKey: 'createByName', header: '作者' },
  { accessorKey: 'publishTime', header: '发布时间' },
  { accessorKey: 'top', header: '置顶' },
  { accessorKey: 'recommended', header: '推荐' },
  { id: 'actions', header: '操作', meta: { class: { th: 'text-right' } } },
];

watch(() => [pagination.page, pagination.size], () => {
  void refresh();
});

onMounted(() => {
  void refresh();
});

function handleQuery() {
  pagination.page = 1;
  void refresh();
}

function handleReset() {
  queryParams.category = '';
  queryParams.title = '';
  queryParams.status = '';
  handleQuery();
}

function openCreate() {
  editingArticleId.value = null;
  editorOpen.value = true;
}

function openEdit(row: Article) {
  editingArticleId.value = row.id;
  editorOpen.value = true;
}

async function publishArticle(row: Article) {
  await articleActionApis().publish({ pathParams: { id: row.id } });
  message.success('文章发布成功');
  await refresh();
}

async function toggleTop(row: Article) {
  await articleActionApis().toggleTop({ pathParams: { id: row.id } });
  message.success(row.top ? '取消置顶成功' : '置顶成功');
  await refresh();
}

async function toggleRecommend(row: Article) {
  await articleActionApis().toggleRecommend({ pathParams: { id: row.id } });
  message.success(row.recommended ? '取消推荐成功' : '推荐成功');
  await refresh();
}

async function remove(row: Article) {
  const confirmed = await confirm.confirmDelete({ itemName: row.title });
  if (!confirmed) {
    return;
  }

  await articleActionApis().delete({ pathParams: { id: row.id } });
  message.success('文章删除成功');
  await refresh();
}
</script>

<template>
  <div class="space-y-4">
    <UCard>
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="grid gap-3 md:grid-cols-2 xl:flex xl:flex-wrap">
          <UInput
            v-model="queryParams.title"
            placeholder="按标题搜索"
            icon="i-lucide-search"
            class="min-w-64"
            @keyup.enter="handleQuery"
          />

          <VenusSelect
            v-model="queryParams.category"
            class="min-w-48"
            :option-type="DataOptionType.DICT"
            option-key="article-category"
            placeholder="请选择分类"
          />

          <VenusSelect
            v-model="queryParams.status"
            class="min-w-52"
            :option-type="DataOptionType.ENUM"
            option-key="com.ale.starblog.admin.blog.enums.ArticleStatus"
            placeholder="请选择状态"
          />

          <div class="flex gap-2">
            <UButton @click="handleQuery">
              查询
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="handleReset"
            >
              重置
            </UButton>
          </div>
        </div>

        <UButton
          icon="i-lucide-square-pen"
          @click="openCreate"
        >
          写文章
        </UButton>
      </div>
    </UCard>

    <UCard>
      <UTable
        :columns="tableColumns"
        :data="status === 'pending' ? [] : rows"
        :loading="status === 'pending'"
        empty="暂无文章数据。"
        loading-text="正在加载文章..."
      >
        <template #title-cell="{ row }">
          <div class="max-w-80 truncate font-medium text-highlighted">
            {{ row.original.title }}
          </div>
        </template>

        <template #categoryName-cell="{ row }">
          {{ row.original.categoryName || row.original.category }}
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="row.original.status === 'published' ? 'success' : 'neutral'"
            variant="soft"
          >
            {{ row.original.statusName || row.original.status || '未发布' }}
          </UBadge>
        </template>

        <template #viewCount-cell="{ row }">
          {{ row.original.viewCount ?? 0 }}
        </template>

        <template #createByName-cell="{ row }">
          {{ row.original.createByName || '-' }}
        </template>

        <template #publishTime-cell="{ row }">
          {{ row.original.publishTime || '-' }}
        </template>

        <template #top-cell="{ row }">
          <USwitch
            :model-value="Boolean(row.original.top)"
            @update:model-value="toggleTop(row.original)"
          />
        </template>

        <template #recommended-cell="{ row }">
          <USwitch
            :model-value="Boolean(row.original.recommended)"
            @update:model-value="toggleRecommend(row.original)"
          />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-2">
            <UButton
              size="sm"
              variant="soft"
              @click="openEdit(row.original)"
            >
              修改
            </UButton>
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              :disabled="row.original.status === 'published'"
              @click="publishArticle(row.original)"
            >
              发布
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="soft"
              @click="remove(row.original)"
            >
              删除
            </UButton>
          </div>
        </template>
      </UTable>

      <div class="mt-4 flex justify-end">
        <VenusPagination
          v-model:page="pagination.page"
          v-model:page-size="pagination.size"
          :total="total"
        />
      </div>
    </UCard>

    <ArticleEditor
      v-model:open="editorOpen"
      :article-id="editingArticleId"
      @saved="refresh()"
    />
  </div>
</template>
