# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (uses .env.production)
pnpm preview      # Preview production build
pnpm postinstall  # Run nuxt prepare (generates types)
```

No test runner or lint CLI is configured. ESLint runs via `@nuxt/eslint` module with stylistic rules (semicolons required, `@stylistic/brace-style` off, `no-explicit-any` allowed).

## Architecture

BFF pattern: Browser → Nuxt (SSR + client) → Backend API (Java/Go/Node)

### API Layer (3 tiers)

1. **API Definitions** (`app/apis/`) — Declarative `ApiModule` objects mapping method names to `ApiDescriptor` (uri, method, fixedParams, fixedHeaders). Path params use `{key}` format.
2. **API Factory** (`app/apis/create-api.ts`) — `createApi()` takes an `ApiModule` and returns a typed object where each key becomes a callable function. GET requests use reactive `useApi()` (useFetch wrapper), POST/PUT/DELETE use imperative `$api` ($fetch instance).
3. **Plugin** (`app/plugins/api.ts`) — Creates the `$api` fetch instance with baseURL from `runtimeConfig.public.apiBaseUrl`. Injects Authorization header from `token` cookie, unwraps `ApiResponse` data, and redirects to `/login` on 401.

### Runtime Config

Defined in `nuxt.config.ts`, values come from `.env` (dev) / `.env.production` (build):
- `apiBaseUrl` — Backend API base URL
- `appTitle`, `defaultOssProvider`, `instantMessageServerUrl`, `showRapidDuplicateRequestWarning`

### Key Directories

- `app/apis/{module}/` — API module definitions per domain (e.g., `system/user.ts`)
- `app/composables/api/` — `use-api.ts` (reactive GET wrapper), `use-{name}-api.ts` (per-domain composables)
- `app/enums/` — TypeScript string enums (RequestMethod, ApiResultCode, CommonRouterPath, etc.)
- `app/utils/` — Utility modules
- `app/stores/` — Pinia stores (app-settings-store, app-status-store)
- `app/config/` — App constants (`apiSuccessCode=200`, `apiUnauthorizedCode=403`, `apiTokenExpiredCode=410`)
- `shared/types/venus-shared.d.ts` — Global types shared between client and server (ApiDescriptor, ApiResponse, domain models)
- `app/types/venus.d.ts` — Client-only type augmentations
- `build/auto-imports/` — lodash-es auto-import config (isString, isEmpty, keys, merge, etc.)

## Conventions

- **Utils**: `app/utils/{name}-util.ts` — named export object (e.g., `stringUtil`)
- **Composables**: `app/composables/use-{name}.ts`
- **Stores**: `app/stores/{name}-store.ts`
- **Enums**: `app/enums/{name}.ts` — string enums
- **API modules**: `app/apis/{domain}/{name}.ts`
- Path params in API URIs use `{key}` format, replaced by `replaceTemplate()` from string-util
- `ApiDescriptor.method` uses `RequestMethod` enum values (GET/POST/PUT/DELETE)
- lodash-es functions are auto-imported globally — no need to import them manually
- Semicolons are required (ESLint enforced)
- You need to use the context7 MCP to obtain the latest technical documents.
- Use the components encapsulated by Venus as much as possible.

## Stack

Nuxt 4.3, Nuxt UI 4, Vue 3, TypeScript, Pinia, @nuxt/ui, Tailwind CSS 4, @vueuse/nuxt, lodash-es (auto-imported), pnpm, bytemd (markdown editor), monaco-editor, date-fns, mitt (event bus), animate.css/animejs/motion-v (animations), Cropper.js (image cropping)
