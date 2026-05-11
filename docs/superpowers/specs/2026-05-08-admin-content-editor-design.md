# 管理后台内容编辑器 — 设计文档

## Context

当前个人主页的内容（博客、生活笔记）以 MDX 文件存放在 `content/` 目录，通过 `lib/content.ts` 在构建时导入并静态生成页面。每新增或修改一篇文章都需要编辑文件、提交 Git、等待构建部署。

需要添加一个 Web 管理后台，让用户可以直接在浏览器中编辑和发布文章，即时生效。

## 决策记录

| 决策 | 选择 |
|------|------|
| 编辑范围 | 仅博客 (`blog`) 和生活笔记 (`life`) |
| 使用者 | 仅站点所有者一人 |
| 编辑器风格 | Typora 模式 — 所见即所得的 Markdown 编辑 |
| 编辑器库 | `typora-web`（ProseMirror 封装） |
| 后台入口 | `/admin` 路由，与前台共用同一 Next.js 项目 |
| 认证方式 | 复用 CV 访问码模式：`NEXT_PUBLIC_CV_ACCESS_CODE` + cookie |
| 数据持久化 | 混合模式：已有 MDX 文件保持静态生成，新文章存入 Neon Postgres |
| 数据库 | Neon Postgres（Vercel Marketplace） |

## 架构

```
前台（不改动）                      后台（新增）
───────────────────────────       ───────────────────────
content/**/*.mdx                   app/admin/
  ↓ import                           /page.tsx          → 重定向到 /admin/articles
lib/content.ts                       /login/page.tsx    → 访问码验证
  getArticles()                      /articles/page.tsx → 文章列表
  getArticle()                       /articles/new/page.tsx → 新建
  getAllArticles()                   /articles/[id]/edit/page.tsx → 编辑
  ↓                               lib/db.ts
app/[lang]/...                       connectDb()
  (SSG for MDX,                      getDbArticles()
   Dynamic for DB)                   getDbArticle()
                                   createArticle()
                                   updateArticle()
Neon Postgres                        deleteArticle()
  articles 表                     
```

**内容合并逻辑** (`lib/content.ts` 改造后)：查询优先数据库，未命中回退到 MDX 文件，再未命中返回 404。前端页面对此透明。

## 数据库 Schema

```sql
CREATE TABLE articles (
  id            TEXT PRIMARY KEY,      -- "{kind}-{locale}-{slug}"
  kind          TEXT NOT NULL,          -- "blog" | "life"
  locale        TEXT NOT NULL,          -- "en" | "zh"
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  date          TEXT NOT NULL,          -- ISO 8601
  tags          JSONB NOT NULL DEFAULT '[]',
  cover_image   TEXT,
  location      TEXT,
  reading_time  TEXT,
  content       TEXT NOT NULL,          -- Markdown 原文
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_articles_kind_locale_slug
  ON articles (kind, locale, slug);
```

## 路由设计

| 路由 | 说明 |
|------|------|
| `/admin` | 重定向到 `/admin/articles` |
| `/admin/login` | 访问码验证页 |
| `/admin/articles` | 文章列表（Server Component，服务端检查 cookie） |
| `/admin/articles/new` | 新建文章 |
| `/admin/articles/[id]/edit` | 编辑文章 |

所有 `/admin` 路由**不经过 `[lang]`**，独立于前台的多语言路由体系。登录保护通过服务端 `cookies()` 检查 `cv-verified` cookie。

## 组件树

```
app/admin/layout.tsx              → AdminShell（检查 cookie，未登录重定向 /admin/login）
  /login/page.tsx                 → CvGate（复用现有组件）
  /articles/page.tsx              → ArticleList（服务端查询 DB + MDX 合并列表）
  /articles/new/page.tsx          → ArticleEditor（新建模式）
  /articles/[id]/edit/page.tsx    → ArticleEditor（编辑模式，预填数据）

components/article-editor.tsx     → "use client"，typora-web 编辑器 + metadata 表单
components/admin-shell.tsx        → 管理后台的导航壳
components/article-list.tsx       → 文章列表（含新建、编辑、删除按钮）
```

## 数据流

### 新建文章
1. 用户点击 "新建文章"，选择 kind 和 locale
2. 进入编辑页面，metadata 字段为空，编辑器内容为空
3. 用户填写内容，点击 "发布"
4. Server Action 将文章写入 `articles` 表
5. 重定向到文章列表

### 编辑文章
1. 文章列表点击 "编辑"
2. 服务端从数据库查询文章，传递给编辑器
3. 编辑器预填 metadata 和 content
4. 用户修改，点击 "保存"
5. Server Action 更新 `articles` 表中对应行
6. 前台页面访问时自动显示最新内容

### 前台读取
1. 读者访问 `/[lang]/blog/[slug]`
2. `lib/content.ts` 先查数据库该 slug 是否有文章
3. 有 → 返回数据库版本
4. 无 → 回退 MDX 文件
5. 再无 → 404

## 关键文件变更

### 新建文件
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/login/page.tsx`
- `app/admin/articles/page.tsx`
- `app/admin/articles/new/page.tsx`
- `app/admin/articles/[id]/edit/page.tsx`
- `components/article-editor.tsx`
- `components/admin-shell.tsx`
- `components/article-list.tsx`
- `lib/db.ts`

### 修改文件
- `lib/content.ts` — 合并数据库查询
- `lib/content-types.ts` — 可能需要 `published` 字段调整
- `app/[lang]/blog/[slug]/page.tsx` — 数据库优先的查找逻辑
- `app/[lang]/life/[slug]/page.tsx` — 同上
- `app/[lang]/blog/page.tsx` — 列表合并
- `app/[lang]/life/page.tsx` — 同上
- `package.json` — 添加 `typora-web`、`@neondatabase/serverless`

## 技术细节

### 动态路由处理

`app/[lang]/blog/[slug]/page.tsx` 和 `app/[lang]/life/[slug]/page.tsx` 目前设置了 `dynamicParams = false`，只接受 `generateStaticParams()` 返回的 MDX slug。改为 `dynamicParams = true`，让数据库中的文章也可以被动态渲染。

同理，列表页 (`blog/page.tsx`、`life/page.tsx`) 的年份归档需要合并 DB 和 MDX 文章后统一计算。

### `lib/content.ts` 改造

```ts
// getArticle() — 数据库优先
export async function getArticle(kind, locale, slug) {
  const dbArticle = await getDbArticle(kind, locale, slug);
  if (dbArticle) return dbArticle;
  return getStaticArticle(kind, locale, slug); // 原 MDX 查找
}

// getArticles() — 合并排序
export async function getArticles(kind, locale) {
  const dbArticles = await getDbArticles(kind, locale);
  const staticArticles = getStaticArticles(kind, locale);
  // 合并，按日期排序，DB 同 slug 覆盖 MDX
  return mergeAndSort(dbArticles, staticArticles);
}
```

### `typora-web` 集成

编辑器组件封装 `createEditor()`：

```tsx
// components/article-editor.tsx
"use client";
import { createEditor } from "typora-web";
import "typora-web/widgets.css";
import "typora-web/theme-typora.css";

// 挂载到 ref，暴露 getMarkdown() / setMarkdown()
// metadata 表单单独管理（title, summary, date, tags...）
// 保存时调用 Server Action
```

## 不做的

- 不上传图片（前台已有 `public/` 目录手动管理）
- 不做草稿/发布状态（直接发布）
- 不做版本历史（Git 已有）
- 不做协作/多用户
- 不迁移已有 MDX 文章到数据库

## 验证

1. `npm run build` 构建通过
2. 访问 `/admin`，未登录时重定向到 `/admin/login`
3. 输入正确访问码后进入文章列表
4. 新建文章、编辑文章、删除文章
5. 前台页面正确显示数据库中的文章
6. 已有 MDX 文章不受影响
7. 前台页面仍可静态生成（非数据库文章）
