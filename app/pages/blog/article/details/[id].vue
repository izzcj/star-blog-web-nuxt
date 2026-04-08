<script setup lang="ts">
import { stagger } from 'animejs';
import { articleActionApis, articleFetchApis } from '~/apis/blog/article';
import AuthorSidebar from './components/author-sidebar/index.vue';
import ArticleContent from './components/article-content/index.vue';
import ArticleToc from './components/article-toc/index.vue';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const requestUrl = useRequestURL();

const articleId = route.params.id as string;

definePageMeta({
  name: 'ArticleDetails',
});

const { observeElements, fadeInLeftConfig, fadeInRightConfig } = useScrollAnimation();

const {
  data: articleDetail,
  status,
  error,
} = await articleFetchApis().fetchDetail({ pathParams: { id: articleId } });

if (error.value && !articleDetail.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '文章不存在或已下线',
  });
}

const isLoading = computed(() => status.value === 'pending');

const siteTitle = computed(() => runtimeConfig.public.appTitle || 'Star Blog');
const seoTitle = computed(() => articleDetail.value?.title
  ? `${articleDetail.value.title} - ${siteTitle.value}`
  : `文章详情 - ${siteTitle.value}`);

function stripMarkdown(content?: string) {
  if (!content) {
    return '';
  }

  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const seoDescription = computed(() => {
  const summary = stripMarkdown(articleDetail.value?.summary);
  if (summary) {
    return summary.slice(0, 160);
  }

  return stripMarkdown(articleDetail.value?.content).slice(0, 160);
});

const canonicalUrl = computed(() => {
  const pathname = route.fullPath.split('#')[0] || '/blog/article';
  return new URL(pathname, requestUrl.origin).toString();
});

const seoImage = computed(() => articleDetail.value?.coverImage || undefined);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'article',
  ogUrl: () => canonicalUrl.value,
  ogImage: () => seoImage.value,
  twitterCard: () => (seoImage.value ? 'summary_large_image' : 'summary'),
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value,
});

function initEnterAnimations() {
  nextTick(() => {
    setTimeout(() => {
      observeElements('#author-sidebar-col > *', {
        ...fadeInLeftConfig,
        delay: stagger(100),
      });

      observeElements('#article-toc-col > *', {
        ...fadeInRightConfig,
        delay: stagger(100),
      });
    }, 100);
  });
}

onMounted(() => {
  articleActionApis().incrementViewCount({ pathParams: { id: articleId } }).catch(() => undefined);

  if (articleDetail.value) {
    initEnterAnimations();
  }
});
</script>

<template>
  <main class="min-h-dvh bg-default">
    <div class="mx-auto w-full max-w-450 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 2xl:px-10">
      <div
        v-if="articleDetail"
        id="article-detail"
        class="grid grid-cols-1 gap-6 md:grid-cols-24 xl:gap-8"
      >
        <aside class="hidden xl:block xl:col-span-5">
          <div
            id="author-sidebar-col"
            class="space-y-6"
          >
            <AuthorSidebar
              :author-id="articleDetail.createBy"
              :current-article-id="articleDetail.id"
            />
          </div>
        </aside>

        <section
          id="article-content-col"
          class="min-w-0 md:col-span-24 lg:col-span-17 xl:col-span-14"
        >
          <UCard
            :ui="{
              root: 'overflow-hidden rounded-2xl border border-(--ui-border)/60 shadow-sm',
              body: 'p-0',
            }"
          >
            <ArticleContent :article-detail="articleDetail" />
          </UCard>
        </section>

        <aside class="hidden lg:block lg:col-span-7 xl:col-span-5">
          <div class="sticky top-24">
            <div
              id="article-toc-col"
              class="space-y-6"
            >
              <ArticleToc :content="articleDetail.content" />
            </div>
          </div>
        </aside>
      </div>

      <UCard
        v-else-if="isLoading"
        :ui="{
          root: 'overflow-hidden rounded-2xl border border-(--ui-border)/60 shadow-sm',
          body: 'space-y-6 p-6 sm:p-8',
        }"
      >
        <div class="space-y-4">
          <USkeleton class="h-8 w-2/3" />
          <div class="flex flex-wrap gap-3">
            <USkeleton class="h-5 w-20" />
            <USkeleton class="h-5 w-24" />
            <USkeleton class="h-5 w-28" />
          </div>
        </div>
        <USkeleton class="h-52 w-full rounded-xl" />
        <div class="space-y-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-11/12" />
          <USkeleton class="h-4 w-10/12" />
          <USkeleton class="h-4 w-8/12" />
        </div>
      </UCard>

      <UCard
        v-else
        :ui="{
          root: 'overflow-hidden rounded-2xl border border-(--ui-border)/60 shadow-sm',
          body: 'flex min-h-[320px] flex-col items-center justify-center gap-3 p-8 text-center',
        }"
      >
        <UIcon
          name="lucide:file-warning"
          class="size-10 text-dimmed"
        />
        <div>
          <p class="text-base font-medium text-highlighted">
            文章加载失败
          </p>
          <p class="mt-1 text-sm text-muted">
            当前文章可能已下线，或链接已失效。
          </p>
        </div>
      </UCard>
    </div>
  </main>
</template>
