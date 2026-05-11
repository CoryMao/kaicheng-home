# Admin Content Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web admin panel at `/admin` for creating/editing blog posts and life notes, with Typora-style Markdown editing, persisted to Neon Postgres.

**Architecture:** Hybrid content mode — existing MDX files stay static (SSG), new/edited articles go to a Neon Postgres `articles` table. `lib/content.ts` becomes async and merges both sources (DB-first, MDX-fallback). Admin routes live under `app/admin/` outside `[lang]`, protected by an independent access code (`ADMIN_ACCESS_CODE` + `admin-verified` cookie).

**Tech Stack:** Next.js 16 App Router, `typora-web` (ProseMirror), `@neondatabase/serverless`, Neon Postgres, Tailwind CSS v4.

---

## File Structure

```
New files:
  lib/db.ts                           — DB connection + CRUD helpers
  components/admin-gate.tsx           — Access code gate (similar to CvGate)
  components/admin-shell.tsx          — Admin layout shell (nav + auth check)
  components/article-list-client.tsx  — Client table with edit/delete buttons
  components/article-editor.tsx       — typora-web wrapper + metadata form
  app/admin/layout.tsx                — Admin root layout (checks admin-verified cookie)
  app/admin/page.tsx                  — Redirect to /admin/articles
  app/admin/login/page.tsx            — Login page (renders AdminGate)
  app/admin/articles/page.tsx         — Article list (Server Component)
  app/admin/articles/new/page.tsx     — New article (Server Component → Client Editor)
  app/admin/articles/[id]/edit/page.tsx — Edit article (Server Component → Client Editor)

Modified files:
  lib/content.ts                      — Add async DB-aware getArticles/getArticle
  lib/content-types.ts                — Add DbArticle type
  app/[lang]/blog/[slug]/page.tsx     — dynamicParams = true, await getArticle()
  app/[lang]/life/[slug]/page.tsx     — Same
  app/[lang]/blog/page.tsx            — await getArticles()
  app/[lang]/life/page.tsx            — await getArticles()
  app/sitemap.ts                      — await getAllArticles() for DB articles
  app/[lang]/page.tsx                 — await getArticles() (homepage)
  package.json                        — Add typora-web, @neondatabase/serverless
  .env.local                          — Add placeholder for DATABASE_URL, ADMIN_ACCESS_CODE

Not modified:
  Existing MDX files, profile.ts, research.ts, route-availability.ts, all other components
```

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install typora-web and @neondatabase/serverless**

```bash
npm install typora-web @neondatabase/serverless
```

- [ ] **Step 2: Verify install**

```bash
node -e "require('@neondatabase/serverless'); console.log('neon OK')"
node -e "require('typora-web'); console.log('typora-web OK')"
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add typora-web and @neondatabase/serverless dependencies"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 2: Create database layer

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Write lib/db.ts**

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import type { ArticleKind, ArticleMetadata } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

export type DbArticle = {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  cover_image: string | null;
  location: string | null;
  reading_time: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

function sql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  return neon(databaseUrl);
}

export async function getDbArticles(kind: ArticleKind, locale: Locale): Promise<DbArticle[]> {
  const rows = await sql()`
    SELECT * FROM articles
    WHERE kind = ${kind} AND locale = ${locale}
    ORDER BY date DESC
  `;
  return rows as DbArticle[];
}

export async function getDbArticle(kind: ArticleKind, locale: Locale, slug: string): Promise<DbArticle | null> {
  const rows = await sql()`
    SELECT * FROM articles
    WHERE kind = ${kind} AND locale = ${locale} AND slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as DbArticle) ?? null;
}

export async function createDbArticle(article: {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
}): Promise<void> {
  await sql()`
    INSERT INTO articles (id, kind, locale, slug, title, summary, date, tags, cover_image, location, reading_time, content)
    VALUES (
      ${article.id},
      ${article.kind},
      ${article.locale},
      ${article.slug},
      ${article.title},
      ${article.summary},
      ${article.date},
      ${JSON.stringify(article.tags)}::jsonb,
      ${article.coverImage ?? null},
      ${article.location ?? null},
      ${article.readingTime ?? null},
      ${article.content}
    )
  `;
}

export async function updateDbArticle(article: {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
}): Promise<void> {
  await sql()`
    UPDATE articles SET
      title = ${article.title},
      summary = ${article.summary},
      date = ${article.date},
      tags = ${JSON.stringify(article.tags)}::jsonb,
      cover_image = ${article.coverImage ?? null},
      location = ${article.location ?? null},
      reading_time = ${article.readingTime ?? null},
      content = ${article.content},
      updated_at = NOW()
    WHERE id = ${article.id}
  `;
}

export async function deleteDbArticle(id: string): Promise<void> {
  await sql()`DELETE FROM articles WHERE id = ${id}`;
}

export async function getAllDbArticles(kind?: ArticleKind): Promise<DbArticle[]> {
  if (kind) {
    const rows = await sql()`SELECT * FROM articles WHERE kind = ${kind} ORDER BY date DESC`;
    return rows as DbArticle[];
  }
  const rows = await sql()`SELECT * FROM articles ORDER BY date DESC`;
  return rows as DbArticle[];
}

function dbArticleToSummary(row: DbArticle): { kind: ArticleKind; locale: Locale; slug: string; metadata: ArticleMetadata } {
  return {
    kind: row.kind,
    locale: row.locale,
    slug: row.slug,
    metadata: {
      title: row.title,
      date: row.date,
      summary: row.summary,
      tags: row.tags,
      coverImage: row.cover_image ?? undefined,
      location: row.location ?? undefined,
      readingTime: row.reading_time ?? undefined,
      published: true,
    },
  };
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit lib/db.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add database layer for articles CRUD"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 3: Create AdminGate component

**Files:**
- Create: `components/admin-gate.tsx`

- [ ] **Step 1: Write components/admin-gate.tsx**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";

const COOKIE_NAME = "admin-verified";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; samesite=lax`;
}

export function AdminGate() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const correctCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctCode || input.trim() === correctCode) {
      setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Lock aria-hidden="true" className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          管理后台
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          请输入管理后台访问码以继续。
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="输入访问码"
            autoFocus
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {error ? (
            <p className="mt-3 text-sm text-accent-strong">访问码不正确</p>
          ) : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-accent"
          >
            确认
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit components/admin-gate.tsx
```

- [ ] **Step 3: Commit**

```bash
git add components/admin-gate.tsx
git commit -m "feat: add AdminGate component with separate access code"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 4: Create admin layout with auth check

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `components/admin-shell.tsx`

- [ ] **Step 1: Write components/admin-shell.tsx**

```tsx
import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/admin/articles"
              className="text-sm font-semibold tracking-[0.18em] text-foreground"
            >
              管理后台
            </Link>
            <nav className="flex items-center gap-3 text-sm text-muted">
              <Link href="/en" className="hover:text-foreground">
                前台
              </Link>
              <a href="/admin/logout" className="hover:text-foreground">
                退出
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Write app/admin/layout.tsx**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import "../../app/globals.css";

export const metadata = {
  title: "管理后台",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = await getPathname();
  
  // Allow login page without auth
  if (pathname === "/admin/login" || pathname === "/admin/logout") {
    return <AdminShell>{children}</AdminShell>;
  }

  const cookieStore = await cookies();
  const verified = cookieStore.get("admin-verified")?.value === "1";

  if (!verified) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}

// Read pathname from headers (Next.js App Router pattern)
import { headers } from "next/headers";
async function getPathname() {
  const headersList = await headers();
  const pathname = headersList.get("x-nextjs-current-pathname") ?? "";
  return pathname;
}
```

Wait, let me reconsider this. The `x-nextjs-current-pathname` header is internal and not always available. Let me use a simpler approach — put the auth check in each page/route segment rather than the layout. Or use a route group with a middleware check.

Actually, the simplest approach: check auth in the layout with a regex or path matching, without relying on internal headers.

Let me rewrite the layout:

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import "../../app/globals.css";

export const metadata = {
  title: "管理后台",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
```

And then each protected page does its own cookie check. Or better — use a layout group:

- `app/admin/layout.tsx` — just the shell (html, body, header)
- `app/admin/login/page.tsx` — no auth check
- `app/admin/(protected)/layout.tsx` — checks cookie, redirects to /admin/login if missing
- `app/admin/(protected)/articles/page.tsx` — lives inside protected group

This is the clean Next.js pattern. Let me use route groups.

Actually, for simplicity let me just put the check in each page's layout or the page itself. With only a few admin pages, this is fine.

Let me reconsider the cleanest approach:

1. `app/admin/layout.tsx` — Shell only (html, body, header, imports globals.css)
2. `app/admin/login/page.tsx` — Login page, no auth needed
3. `app/admin/logout/route.ts` — Clears cookie and redirects
4. `app/admin/articles/layout.tsx` — Auth check layout (just for /admin/articles/*)
5. `app/admin/articles/page.tsx` — List
6. `app/admin/articles/new/page.tsx` — New
7. `app/admin/articles/[id]/edit/page.tsx` — Edit

This way the auth check is in `app/admin/articles/layout.tsx` and shared by all articles pages. Let me rewrite the plan.

- [ ] **Step 2 (revised): Write app/admin/layout.tsx**

```tsx
import { AdminShell } from "@/components/admin-shell";
import "../../app/globals.css";

export const metadata = {
  title: "管理后台",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
```

- [ ] **Step 3: Write app/admin/articles/layout.tsx (auth check)**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin-verified")?.value === "1";

  if (!verified) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Write app/admin/logout/route.ts**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.set("admin-verified", "", { maxAge: 0, path: "/" });
  redirect("/admin/login");
}
```

Wait, `cookies().set()` is not available in Next.js 16 — we need to use `NextResponse` or set the `Set-Cookie` header. Let me use a different approach for logout:

```tsx
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET() {
  redirect("/admin/login");
}
```

And in the layout, the cookie check already works. To clear the cookie, we can add a client-side script on a logout page, or simply redirect to login (the cookie auto-expires after 30 days, and the user can just not log in).

Actually, the simplest logout: a route handler that sets the cookie to empty.

```tsx
import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(new URL("/admin/login", "http://localhost"));
  response.cookies.set("admin-verified", "", { maxAge: 0, path: "/" });
  return response;
}
```

That's cleaner. Let me use this in the plan.

Actually, I realize I should simplify this plan significantly. Instead of writing out every file, let me focus on the key non-obvious parts and provide the critical code. The plan is getting too long for a conversational post.

Let me rewrite it more concisely but still with concrete steps.

OK, let me just write the plan now with the right level of detail. I'll skip the full file contents that are repetitive (like the login page being nearly identical to CvGate) and focus on the unique/important parts.<｜end▁of▁thinking｜>

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="Write">
<｜｜DSML｜｜parameter name="content" string="true"># Admin Content Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Web admin panel at `/admin` for creating/editing blog posts and life notes with Typora-style Markdown editing, persisted to Neon Postgres.

**Architecture:** Hybrid content — MDX files stay static (SSG), new/edited articles go to Neon `articles` table. `lib/content.ts` becomes async (DB-first, MDX-fallback). Admin routes under `app/admin/` outside `[lang]`, protected by independent access code.

**Tech Stack:** `typora-web` (ProseMirror), `@neondatabase/serverless`, Neon Postgres, Next.js 16 App Router, Tailwind CSS v4.

---

### Task 1: Install dependencies

**Files:** Modify `package.json`

- [ ] **Step 1: Install**

```bash
npm install typora-web @neondatabase/serverless
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add typora-web and @neondatabase/serverless"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 2: Create database layer (`lib/db.ts`)

**Files:** Create `lib/db.ts`

- [ ] **Step 1: Write lib/db.ts**

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import type { ArticleKind, ArticleMetadata } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

export type DbArticle = {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  cover_image: string | null;
  location: string | null;
  reading_time: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

function sql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");
  return neon(databaseUrl);
}

function dbArticleToSummary(
  row: DbArticle,
): { kind: ArticleKind; locale: Locale; slug: string; metadata: ArticleMetadata } {
  return {
    kind: row.kind,
    locale: row.locale,
    slug: row.slug,
    metadata: {
      title: row.title,
      date: row.date,
      summary: row.summary,
      tags: row.tags,
      coverImage: row.cover_image ?? undefined,
      location: row.location ?? undefined,
      readingTime: row.reading_time ?? undefined,
      published: true,
    },
  };
}

export async function getDbArticles(
  kind: ArticleKind,
  locale: Locale,
): Promise<DbArticle[]> {
  return (await sql()`
    SELECT * FROM articles
    WHERE kind = ${kind} AND locale = ${locale}
    ORDER BY date DESC
  `) as DbArticle[];
}

export async function getDbArticle(
  kind: ArticleKind,
  locale: Locale,
  slug: string,
): Promise<DbArticle | null> {
  const rows = await sql()`
    SELECT * FROM articles
    WHERE kind = ${kind} AND locale = ${locale} AND slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as DbArticle) ?? null;
}

export async function getAllDbArticles(
  kind?: ArticleKind,
): Promise<DbArticle[]> {
  if (kind) {
    return (await sql()`
      SELECT * FROM articles WHERE kind = ${kind} ORDER BY date DESC
    `) as DbArticle[];
  }
  return (await sql()`
    SELECT * FROM articles ORDER BY date DESC
  `) as DbArticle[];
}

export async function createDbArticle(article: {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
}): Promise<void> {
  await sql()`
    INSERT INTO articles
      (id, kind, locale, slug, title, summary, date, tags,
       cover_image, location, reading_time, content)
    VALUES (
      ${article.id}, ${article.kind}, ${article.locale}, ${article.slug},
      ${article.title}, ${article.summary}, ${article.date},
      ${JSON.stringify(article.tags)}::jsonb,
      ${article.coverImage ?? null}, ${article.location ?? null},
      ${article.readingTime ?? null}, ${article.content}
    )
  `;
}

export async function updateDbArticle(article: {
  id: string;
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
}): Promise<void> {
  await sql()`
    UPDATE articles SET
      title = ${article.title}, summary = ${article.summary},
      date = ${article.date},
      tags = ${JSON.stringify(article.tags)}::jsonb,
      cover_image = ${article.coverImage ?? null},
      location = ${article.location ?? null},
      reading_time = ${article.readingTime ?? null},
      content = ${article.content},
      updated_at = NOW()
    WHERE id = ${article.id}
  `;
}

export async function deleteDbArticle(id: string): Promise<void> {
  await sql()`DELETE FROM articles WHERE id = ${id}`;
}

export { dbArticleToSummary };
```

- [ ] **Step 2: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add database layer for articles CRUD"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 3: Create AdminGate and admin shell

**Files:**
- Create: `components/admin-gate.tsx`
- Create: `components/admin-shell.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/logout/route.ts`

- [ ] **Step 1: Write components/admin-gate.tsx**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";

const COOKIE_NAME = "admin-verified";
const COOKIE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toUTCString();
  document.cookie =
    `${name}=${value}; expires=${expires}; path=/; samesite=lax`;
}

export function AdminGate() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const correctCode = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correctCode || input.trim() === correctCode) {
      setCookie(COOKIE_NAME, "1", COOKIE_DAYS);
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <Lock aria-hidden="true" className="mx-auto size-10 text-accent" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          管理后台
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          请输入管理后台访问码以继续。
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="输入访问码"
            autoFocus
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-center text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {error && (
            <p className="mt-3 text-sm text-accent-strong">访问码不正确</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:bg-accent"
          >
            确认
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write components/admin-shell.tsx**

```tsx
import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/articles"
            className="text-sm font-semibold tracking-[0.18em] text-foreground"
          >
            管理后台
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/en" className="hover:text-foreground">
              前台
            </Link>
            <a href="/admin/logout" className="hover:text-foreground">
              退出
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Write app/admin/layout.tsx**

```tsx
import { AdminShell } from "@/components/admin-shell";
import "../../app/globals.css";

export const metadata = {
  title: "管理后台",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Write app/admin/page.tsx**

```tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/articles");
}
```

- [ ] **Step 5: Write app/admin/login/page.tsx**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminGate } from "@/components/admin-gate";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin-verified")?.value === "1";

  if (verified) {
    redirect("/admin/articles");
  }

  return <AdminGate />;
}
```

- [ ] **Step 6: Write app/admin/logout/route.ts**

```tsx
import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  );
  response.cookies.set("admin-verified", "", { maxAge: 0, path: "/" });
  return response;
}
```

- [ ] **Step 7: Commit**

```bash
git add components/admin-gate.tsx components/admin-shell.tsx \
        app/admin/layout.tsx app/admin/page.tsx app/admin/login/page.tsx \
        app/admin/logout/route.ts
git commit -m "feat: add admin layout, login gate, and logout route"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 4: Create article editor component

**Files:** Create `components/article-editor.tsx`

This is the Typora-web editor wrapper — the core UI component.

- [ ] **Step 1: Write components/article-editor.tsx**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

type EditorState = {
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string;
  coverImage: string;
  location: string;
  readingTime: string;
};

type Props = {
  mode: "new" | "edit";
  initial?: {
    id?: string;
    kind: ArticleKind;
    locale: Locale;
    slug: string;
    metadata: {
      title: string;
      date: string;
      summary: string;
      tags: string[];
      coverImage?: string;
      location?: string;
      readingTime?: string;
    };
    content: string;
  };
  saveAction: (
    data: EditorState & { content: string; id?: string },
  ) => Promise<{ success: boolean; error?: string }>;
};

export function ArticleEditor({ mode, initial, saveAction }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<{
    getMarkdown: () => string;
    setMarkdown: (md: string) => void;
    destroy: () => void;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<EditorState>({
    kind: initial?.kind ?? "blog",
    locale: initial?.locale ?? "en",
    slug: initial?.slug ?? "",
    title: initial?.metadata.title ?? "",
    summary: initial?.metadata.summary ?? "",
    date: initial?.metadata.date ?? new Date().toISOString().slice(0, 10),
    tags: initial?.metadata.tags?.join(", ") ?? "",
    coverImage: initial?.metadata.coverImage ?? "",
    location: initial?.metadata.location ?? "",
    readingTime: initial?.metadata.readingTime ?? "",
  });

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { createEditor } = await import("typora-web");
      await import("typora-web/widgets.css");
      await import("typora-web/theme-typora.css");

      if (!mounted || !editorRef.current) return;

      const editor = createEditor(editorRef.current, {
        initialContent: initial?.content ?? "",
      });
      editorInstance.current = editor;
    }

    init();

    return () => {
      mounted = false;
      editorInstance.current?.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(field: keyof EditorState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const content = editorInstance.current?.getMarkdown() ?? "";

    const result = await saveAction({
      ...form,
      content,
      id: initial?.id,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    if (result.success) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError(result.error ?? "保存失败");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {mode === "new" ? "新建文章" : "编辑文章"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/articles")}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent disabled:opacity-50"
          >
            {saving ? "保存中..." : "发布"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-accent-strong/30 bg-accent-strong/10 p-3 text-sm text-accent-strong">
          {error}
        </div>
      )}

      {/* Metadata form */}
      <div className="mb-6 grid gap-4 rounded-lg border border-border bg-surface p-5 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            类型
          </label>
          <select
            value={form.kind}
            onChange={(e) => updateField("kind", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="blog">Blog</option>
            <option value="life">Life</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            语言
          </label>
          <select
            value={form.locale}
            onChange={(e) => updateField("locale", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="en">EN</option>
            <option value="zh">ZH</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            标题
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="文章标题"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            Slug
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="url-slug"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            日期
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            标签 (逗号分隔)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="tag1, tag2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            摘要
          </label>
          <input
            type="text"
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="文章摘要"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            封面图 URL (可选)
          </label>
          <input
            type="text"
            value={form.coverImage}
            onChange={(e) => updateField("coverImage", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="/media/cover.jpg"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            位置 (可选)
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">
            阅读时长 (可选)
          </label>
          <input
            type="text"
            value={form.readingTime}
            onChange={(e) => updateField("readingTime", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="5 min"
          />
        </div>
      </div>

      {/* Editor area */}
      <div className="rounded-lg border border-border bg-surface">
        <div
          ref={editorRef}
          className="prose prose-zinc dark:prose-invert max-w-none p-6 min-h-[400px]"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/article-editor.tsx
git commit -m "feat: add Typora-web article editor component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 5: Create admin article pages (list + new + edit)

**Files:**
- Create: `app/admin/articles/layout.tsx`
- Create: `app/admin/articles/page.tsx`
- Create: `app/admin/articles/new/page.tsx`
- Create: `app/admin/articles/[id]/edit/page.tsx`
- Create: `components/article-list-client.tsx`

- [ ] **Step 1: Write app/admin/articles/layout.tsx (auth guard)**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const verified = cookieStore.get("admin-verified")?.value === "1";

  if (!verified) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Write app/admin/articles/page.tsx (list — Server Component)**

```tsx
import Link from "next/link";
import { ArticleListClient } from "@/components/article-list-client";
import { getStaticArticles } from "@/lib/content";
import { getAllDbArticles, dbArticleToSummary } from "@/lib/db";
import type { ArticleSummary } from "@/lib/content-types";

export default async function AdminArticlesPage() {
  const dbArticles = await getAllDbArticles();
  const staticArticles = getStaticArticles();

  const dbSummaries = dbArticles.map(dbArticleToSummary);

  // Merge: DB + MDX, DB takes priority for same slug
  const merged = [...staticArticles];
  for (const db of dbSummaries) {
    const idx = merged.findIndex(
      (s) => s.kind === db.kind && s.locale === db.locale && s.slug === db.slug,
    );
    if (idx >= 0) {
      merged[idx] = { ...db, _source: "db" as const };
    } else {
      merged.push({ ...db, _source: "db" as const });
    }
  }

  const articles = merged.map((a) => ({
    ...a,
    _source: ("_source" in a ? a._source : "mdx") as "db" | "mdx",
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          文章管理
        </h1>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent"
        >
          + 新建文章
        </Link>
      </div>
      <ArticleListClient articles={articles} />
    </div>
  );
}
```

- [ ] **Step 3: Write components/article-list-client.tsx**

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { ArticleSummary } from "@/lib/content-types";

type ArticleRow = ArticleSummary & { _source: "db" | "mdx" };

export function ArticleListClient({
  articles: initialArticles,
}: {
  articles: ArticleRow[];
}) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [localeFilter, setLocaleFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    if (kindFilter !== "all" && a.kind !== kindFilter) return false;
    if (localeFilter !== "all" && a.locale !== localeFilter) return false;
    return true;
  });

  async function handleDelete(id: string) {
    if (!confirm("确定删除这篇文章？")) return;
    setDeleting(id);
    const res = await fetch(`/admin/articles/${id}/delete`, { method: "POST" });
    if (res.ok) {
      setArticles((prev) =>
        prev.filter((a) => `${a.kind}-${a.locale}-${a.slug}` !== id),
      );
    }
    setDeleting(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="all">全部类型</option>
          <option value="blog">Blog</option>
          <option value="life">Life</option>
        </select>
        <select
          value={localeFilter}
          onChange={(e) => setLocaleFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="all">全部语言</option>
          <option value="en">EN</option>
          <option value="zh">ZH</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted">
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">语言</th>
              <th className="px-4 py-3">来源</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const id = `${a.kind}-${a.locale}-${a.slug}`;
              return (
                <tr key={id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {a.metadata.title}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {a.kind === "blog" ? "博客" : "生活"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {a.metadata.date}
                  </td>
                  <td className="px-4 py-3 text-muted uppercase">
                    {a.locale}
                  </td>
                  <td className="px-4 py-3">
                    {a._source === "mdx" ? (
                      <span className="rounded-md bg-surface-alt px-2 py-0.5 text-xs text-muted">
                        MDX (只读)
                      </span>
                    ) : (
                      <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        数据库
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a._source === "mdx" ? (
                      <Link
                        href={`/${a.locale}/${a.kind}/${a.slug}`}
                        className="text-xs text-muted hover:text-foreground"
                      >
                        查看
                      </Link>
                    ) : (
                      <span className="flex gap-3 justify-end">
                        <Link
                          href={`/admin/articles/${id}/edit`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          编辑
                        </Link>
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deleting === id}
                          className="text-xs font-medium text-accent-strong hover:underline disabled:opacity-50"
                        >
                          删除
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted">
            暂无文章
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write app/admin/articles/new/page.tsx**

```tsx
"use client";

import { ArticleEditor } from "@/components/article-editor";

export default function NewArticlePage() {
  async function saveAction(data: {
    kind: "blog" | "life";
    locale: "en" | "zh";
    slug: string;
    title: string;
    summary: string;
    date: string;
    tags: string[];
    coverImage: string;
    location: string;
    readingTime: string;
    content: string;
  }) {
    "use server";
    const { createDbArticle } = await import("@/lib/db");
    try {
      await createDbArticle({
        id: `${data.kind}-${data.locale}-${data.slug}`,
        kind: data.kind,
        locale: data.locale,
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        date: data.date,
        tags: data.tags,
        coverImage: data.coverImage || undefined,
        location: data.location || undefined,
        readingTime: data.readingTime || undefined,
        content: data.content,
      });
      return { success: true as const };
    } catch (e) {
      return {
        success: false as const,
        error: e instanceof Error ? e.message : "保存失败",
      };
    }
  }

  return <ArticleEditor mode="new" saveAction={saveAction} />;
}
```

Wait — `"use server"` inside a `"use client"` component doesn't work well. Server Actions need to be defined in a separate file or at module level with `"use server"` directive. Let me restructure.

The correct approach: define server actions in a separate file, import them into the client component.

Let me create `lib/admin-actions.ts` for all admin server actions.

- [ ] **Step 4 (revised): Write lib/admin-actions.ts**

```ts
"use server";

import { revalidatePath } from "next/cache";
import {
  createDbArticle,
  updateDbArticle,
  deleteDbArticle,
} from "@/lib/db";
import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

type ArticleInput = {
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
};

export async function createArticle(data: ArticleInput) {
  try {
    await createDbArticle({
      id: `${data.kind}-${data.locale}-${data.slug}`,
      ...data,
    });
    revalidatePath(`/${data.locale}/${data.kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "保存失败",
    };
  }
}

export async function updateArticle(id: string, data: ArticleInput) {
  try {
    await updateDbArticle({ id, ...data });
    revalidatePath(`/${data.locale}/${data.kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "保存失败",
    };
  }
}

export async function deleteArticle(id: string, kind: ArticleKind, locale: Locale) {
  try {
    await deleteDbArticle(id);
    revalidatePath(`/${locale}/${kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "删除失败",
    };
  }
}
```

- [ ] **Step 5: Write app/admin/articles/new/page.tsx**

```tsx
import { ArticleEditor } from "@/components/article-editor";
import { createArticle } from "@/lib/admin-actions";

export default function NewArticlePage() {
  return <ArticleEditor mode="new" saveAction={createArticle} />;
}
```

- [ ] **Step 6: Write app/admin/articles/[id]/edit/page.tsx**

```tsx
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/article-editor";
import { updateArticle } from "@/lib/admin-actions";
import { getDbArticle } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [kind, locale, ...slugParts] = id.split("-");
  const slug = slugParts.join("-");

  if (!kind || !locale || !slug) notFound();

  const article = await getDbArticle(
    kind as "blog" | "life",
    locale as "en" | "zh",
    slug,
  );
  if (!article) notFound();

  const initial = {
    id: article.id,
    kind: article.kind,
    locale: article.locale,
    slug: article.slug,
    metadata: {
      title: article.title,
      date: article.date,
      summary: article.summary,
      tags: article.tags,
      coverImage: article.cover_image ?? undefined,
      location: article.location ?? undefined,
      readingTime: article.reading_time ?? undefined,
    },
    content: article.content,
  };

  return (
    <ArticleEditor
      mode="edit"
      initial={initial}
      saveAction={(data) => updateArticle(id, data)}
    />
  );
}
```

- [ ] **Step 7: Write app/admin/articles/[id]/delete/route.ts (delete API)**

```tsx
import { NextResponse } from "next/server";
import { deleteDbArticle } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await deleteDbArticle(id);
  revalidatePath("/admin/articles");
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 8: Commit**

```bash
git add app/admin/articles/ components/article-list-client.tsx lib/admin-actions.ts
git commit -m "feat: add admin article list, new, edit, and delete pages"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 6: Make lib/content.ts hybrid (DB + MDX)

**Files:** Modify `lib/content.ts`

The key transformation: `getArticles()` and `getArticle()` become async, merging DB results with static MDX records.

- [ ] **Step 1: Refactor lib/content.ts**

```ts
import "server-only";

import type { ComponentType } from "react";
import type { MDXProps } from "mdx/types";

import BlogProjectSurvivalAnalysisEn, {
  metadata as blogProjectSurvivalAnalysisEnMetadata,
} from "@/content/blog/en/project-1-survival-analysis.mdx";
import LifeDeskLightEn, {
  metadata as lifeDeskLightEnMetadata,
} from "@/content/life/en/desk-light.mdx";
import LifeWeekendWalkEn, {
  metadata as lifeWeekendWalkEnMetadata,
} from "@/content/life/en/weekend-walk.mdx";
import LifeWeekendWalkZh, {
  metadata as lifeWeekendWalkZhMetadata,
} from "@/content/life/zh/weekend-walk.mdx";
import type {
  ArticleKind,
  ArticleMetadata,
  ArticleSummary,
} from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

type ArticleRecord = ArticleSummary & {
  Component: ComponentType<MDXProps>;
};

const staticRecords: ArticleRecord[] = [
  article(
    "blog",
    "en",
    "project-1-survival-analysis",
    blogProjectSurvivalAnalysisEnMetadata,
    BlogProjectSurvivalAnalysisEn,
  ),
  article(
    "life",
    "en",
    "weekend-walk",
    lifeWeekendWalkEnMetadata,
    LifeWeekendWalkEn,
  ),
  article(
    "life",
    "zh",
    "weekend-walk",
    lifeWeekendWalkZhMetadata,
    LifeWeekendWalkZh,
  ),
  article("life", "en", "desk-light", lifeDeskLightEnMetadata, LifeDeskLightEn),
];

function article(
  kind: ArticleKind,
  locale: Locale,
  slug: string,
  metadata: ArticleMetadata,
  Component: ComponentType<MDXProps>,
): ArticleRecord {
  return { kind, locale, slug, metadata, Component };
}

function isPublished(r: ArticleRecord) {
  return r.metadata.published !== false;
}

/* ---------- Static (MDX) helpers — synchronous ---------- */

export function getStaticArticles(kind?: ArticleKind): ArticleSummary[] {
  return staticRecords
    .filter((r) => (!kind || r.kind === kind) && isPublished(r))
    .map(({ Component: _, ...summary }) => summary)
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    );
}

export function getStaticArticle(
  kind: ArticleKind,
  locale: Locale,
  slug: string,
) {
  return staticRecords.find(
    (r) =>
      r.kind === kind && r.locale === locale && r.slug === slug && isPublished(r),
  );
}

/* ---------- Hybrid helpers — async, DB-first ---------- */

function mergeSummaries(staticList: ArticleSummary[], dbList: ArticleSummary[]): ArticleSummary[] {
  const merged = [...staticList];
  for (const db of dbList) {
    const idx = merged.findIndex(
      (s) => s.kind === db.kind && s.locale === db.locale && s.slug === db.slug,
    );
    if (idx >= 0) merged[idx] = db;
    else merged.push(db);
  }
  return merged.sort(
    (a, b) =>
      new Date(b.metadata.date).getTime() -
      new Date(a.metadata.date).getTime(),
  );
}

export async function getArticles(
  kind: ArticleKind,
  locale: Locale,
): Promise<ArticleSummary[]> {
  const { getDbArticles, dbArticleToSummary } = await import("@/lib/db");
  const staticList = getStaticArticles(kind).filter((s) => s.locale === locale);
  const dbList = (await getDbArticles(kind, locale)).map(dbArticleToSummary);
  return mergeSummaries(staticList, dbList);
}

export async function getArticle(kind: ArticleKind, locale: Locale, slug: string) {
  // DB first
  const { getDbArticle } = await import("@/lib/db");
  const dbArticle = await getDbArticle(kind, locale, slug);
  if (dbArticle) {
    // Return as ArticleSummary (no Component — dynamic rendering handles content)
    const { dbArticleToSummary } = await import("@/lib/db");
    return dbArticleToSummary(dbArticle);
  }
  // Fallback to MDX
  return getStaticArticle(kind, locale, slug);
}

export async function getAllArticles(kind?: ArticleKind): Promise<ArticleSummary[]> {
  const { getAllDbArticles, dbArticleToSummary } = await import("@/lib/db");
  const staticList = getStaticArticles(kind);
  const dbList = (await getAllDbArticles(kind)).map(dbArticleToSummary);
  return mergeSummaries(staticList, dbList);
}

export function getArticleStaticParams(kind: ArticleKind) {
  return getStaticArticles(kind).map((r) => ({
    lang: r.locale,
    slug: r.slug,
  }));
}
```

Wait — there's an issue. The article detail pages currently destructure `{ Component, ...summary }` from the result of `getArticle()`, then render `<Component />`. But DB articles don't have a `Component` — they have raw markdown `content` that needs to be rendered at runtime.

This means the detail pages need to handle two cases:
1. MDX article: has `Component`, render it directly
2. DB article: has `content` (markdown string), render it via MDX runtime compilation

For DB articles, I need either:
- `next-mdx-remote/rsc` to compile the markdown at runtime
- Or a custom MDX renderer

`next-mdx-remote` is the standard approach. Let me add it.

Actually wait, `next-mdx-remote` has a `compileMDX` function that works in RSC. Let me add that dependency and create a helper.

Hmm, but adding another dependency complicates things. Let me think of a simpler approach.

Actually, the simplest approach: use the existing `@mdx-js/mdx` and `@mdx-js/react` (already installed) to compile markdown at runtime in the server component. Or even simpler — use a markdown-to-HTML library and render it with `dangerouslySetInnerHTML`.

But that loses the MDX component overrides (custom `<a>`, `<img>`). 

Let me add `next-mdx-remote` for clean runtime MDX compilation. It's the standard tool for this.

Actually, let me reconsider. The simplest approach that preserves the MDX component overrides:

Install `next-mdx-remote` and use its `MDXRemote` component in the article detail pages for DB articles.

Let me update the plan. I'll add a Task for handling DB article rendering.

Actually, let me simplify even further. For DB articles, I can use `@mdx-js/mdx` evaluate function which is already installed as a transitive dependency. But `next-mdx-remote` is purpose-built for this.

OK, let me just add `next-mdx-remote` and create a simple component for rendering DB articles. This keeps the plan clean.

Let me continue writing the plan, acknowledging this dependency.

- [ ] **Step 2: Commit**

```bash
git add lib/content.ts
git commit -m "feat: make content.ts hybrid — merge DB articles with static MDX"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 7: Update blog/life detail pages for DB articles

**Files:**
- Modify: `app/[lang]/blog/[slug]/page.tsx`
- Modify: `app/[lang]/life/[slug]/page.tsx`
- Modify: `app/[lang]/blog/page.tsx`
- Modify: `app/[lang]/life/page.tsx`
- Modify: `app/[lang]/page.tsx`
- Modify: `app/sitemap.ts`
- Create: `components/db-article-renderer.tsx`
- Install: `next-mdx-remote`

- [ ] **Step 1: Install next-mdx-remote**

```bash
npm install next-mdx-remote
```

- [ ] **Step 2: Write components/db-article-renderer.tsx**

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentPropsWithoutRef } from "react";

function MdxAnchor(props: ComponentPropsWithoutRef<"a">) {
  const isExternal =
    typeof props.href === "string" && /^https?:\/\//.test(props.href);
  return (
    <a
      {...props}
      target={isExternal ? "_blank" : props.target}
      rel={isExternal ? "noreferrer" : props.rel}
    />
  );
}

function MdxImage(props: ComponentPropsWithoutRef<"img">) {
  return (
    <img
      {...props}
      className={[
        "my-8 w-full rounded-lg border border-border object-cover",
        props.className,
      ]
        .filter(Boolean)
        .join(" ")}
      alt={props.alt ?? ""}
    />
  );
}

const components = { a: MdxAnchor, img: MdxImage };

export function DbArticleRenderer({ source }: { source: string }) {
  return (
    <div className="prose prose-zinc mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-semibold prose-a:text-accent prose-img:rounded-lg dark:prose-invert">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
```

- [ ] **Step 3: Modify app/[lang]/blog/[slug]/page.tsx**

Change `dynamicParams = false` to `true`. Make `getArticle()` async. Handle DB articles (no Component, use DbArticleRenderer instead).

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShell } from "@/components/article-shell";
import { DbArticleRenderer } from "@/components/db-article-renderer";
import { getArticle, getArticleStaticParams } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return getArticleStaticParams("blog");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const article = await getArticle("blog", locale, slug);

  if (!article) return {};

  const languageAlternates = Object.fromEntries(
    (
      await Promise.all(
        locales.map(async (l) => {
          const a = await getArticle("blog", l, slug);
          return a ? [l, `/${l}/blog/${slug}`] : null;
        }),
      )
    ).filter(Boolean) as [string, string][],
  ) as Partial<Record<Locale, string>>;

  return createPageMetadata({
    locale,
    title: article.metadata.title,
    description: article.metadata.summary,
    path: `/blog/${article.slug}`,
    image: article.metadata.coverImage,
    languageAlternates,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const article = await getArticle("blog", locale, slug);

  if (!article) notFound();

  const { metadata, kind, locale: aLocale, slug: aSlug } = article;

  return (
    <ArticleShell
      article={{ kind, locale: aLocale, slug: aSlug, metadata }}
      locale={locale}
      backHref={`/${locale}/blog`}
      backLabel={dictionary.common.backToBlog}
    >
      {"content" in article && typeof (article as any).content === "string" ? (
        <DbArticleRenderer source={(article as any).content} />
      ) : "Component" in article ? (
        <(article as any).Component />
      ) : null}
    </ArticleShell>
  );
}
```

Hmm, this is getting ugly with the type casting. The issue is that `getArticle()` returns different shapes for MDX vs DB articles. Let me think of a cleaner approach.

Better approach: Have `getArticle()` return a unified type that always has the content. For MDX articles, we keep the Component. For DB articles, we have a `content` string. The detail page checks which one.

Actually the cleanest approach: have `getArticle()` always return `ArticleSummary & { content?: string; Component?: ComponentType }`. The page checks `Component` first (MDX), then `content` (DB).

Let me define this properly:

```ts
// In lib/content.ts, export type:
export type ArticleResult = ArticleSummary & {
  Component?: ComponentType<MDXProps>;
  content?: string;
};
```

And update the return types. Let me finalize the plan with this cleaner approach. I'm spending too long on this though — let me just write the tasks concisely and let the implementation handle the details.

Let me finalize the plan document and commit.<｜end▁of▁thinking｜>

<｜｜DSML｜｜tool_calls>
<｜｜DSML｜｜invoke name="Write">
<｜｜DSML｜｜parameter name="content" string="true"># Admin Content Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Web admin panel at `/admin` for creating/editing blog posts and life notes with Typora-style Markdown editing, persisted to Neon Postgres.

**Architecture:** Hybrid content — MDX files stay static (SSG), new/edited articles go to Neon `articles` table. `lib/content.ts` becomes async (DB-first, MDX-fallback). Admin routes under `app/admin/` outside `[lang]`, protected by independent `ADMIN_ACCESS_CODE`.

**Tech Stack:** `typora-web` (ProseMirror), `@neondatabase/serverless`, `next-mdx-remote`, Neon Postgres, Next.js 16 App Router.

---

## New Files

| File | Purpose |
|------|---------|
| `lib/db.ts` | DB connection, CRUD, `DbArticle` type |
| `lib/admin-actions.ts` | Server Actions for create/update/delete |
| `components/admin-gate.tsx` | Access code gate (like CvGate, own cookie) |
| `components/admin-shell.tsx` | Admin layout shell (header, nav) |
| `components/article-editor.tsx` | typora-web wrapper + metadata form |
| `components/article-list-client.tsx` | Client table with filter/edit/delete |
| `components/db-article-renderer.tsx` | Renders DB markdown via `next-mdx-remote/rsc` |
| `app/admin/layout.tsx` | Root admin layout (html, body, globals.css) |
| `app/admin/page.tsx` | Redirect `/admin` → `/admin/articles` |
| `app/admin/login/page.tsx` | Login page, renders AdminGate |
| `app/admin/logout/route.ts` | Clears cookie, redirects to login |
| `app/admin/articles/layout.tsx` | Auth guard (checks `admin-verified` cookie) |
| `app/admin/articles/page.tsx` | List all articles (DB + MDX merged) |
| `app/admin/articles/new/page.tsx` | New article (Server Comp → ArticleEditor) |
| `app/admin/articles/[id]/edit/page.tsx` | Edit article (loads from DB → ArticleEditor) |
| `app/admin/articles/[id]/delete/route.ts` | Delete API route |

## Modified Files

| File | Change |
|------|--------|
| `lib/content.ts` | Split into sync static helpers + async hybrid wrappers (DB-first merge) |
| `app/[lang]/blog/[slug]/page.tsx` | `dynamicParams = true`, `await getArticle()`, handle DB articles |
| `app/[lang]/life/[slug]/page.tsx` | Same |
| `app/[lang]/blog/page.tsx` | `await getArticles()` |
| `app/[lang]/life/page.tsx` | `await getArticles()` |
| `app/[lang]/page.tsx` | `await getArticles()` |
| `app/sitemap.ts` | `await getAllArticles()` |
| `package.json` | Add `typora-web`, `@neondatabase/serverless`, `next-mdx-remote` |
| `.env.local` | Add `DATABASE_URL`, `NEXT_PUBLIC_ADMIN_ACCESS_CODE` |

---

### Task 1: Install dependencies

```bash
npm install typora-web @neondatabase/serverless next-mdx-remote
```

Commit: `feat: add typora-web, @neondatabase/serverless, next-mdx-remote`

---

### Task 2: Create `lib/db.ts`

Database layer with Neon serverless driver. Schema matches the design spec (`articles` table with `id TEXT PRIMARY KEY` = `kind-locale-slug`).

```ts
import "server-only";
import { neon } from "@neondatabase/serverless";
import type { ArticleKind, ArticleMetadata } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

export type DbArticle = {
  id: string;
  kind: ArticleKind; locale: Locale; slug: string;
  title: string; summary: string; date: string;
  tags: string[]; cover_image: string | null;
  location: string | null; reading_time: string | null;
  content: string; created_at: string; updated_at: string;
};

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export function dbArticleToSummary(row: DbArticle): { kind: ArticleKind; locale: Locale; slug: string; metadata: ArticleMetadata } {
  return {
    kind: row.kind, locale: row.locale, slug: row.slug,
    metadata: { title: row.title, date: row.date, summary: row.summary, tags: row.tags, coverImage: row.cover_image ?? undefined, location: row.location ?? undefined, readingTime: row.reading_time ?? undefined, published: true },
  };
}

export async function getDbArticles(kind: ArticleKind, locale: Locale): Promise<DbArticle[]> {
  return (await sql()`SELECT * FROM articles WHERE kind = ${kind} AND locale = ${locale} ORDER BY date DESC`) as DbArticle[];
}

export async function getDbArticle(kind: ArticleKind, locale: Locale, slug: string): Promise<DbArticle | null> {
  const rows = await sql()`SELECT * FROM articles WHERE kind = ${kind} AND locale = ${locale} AND slug = ${slug} LIMIT 1`;
  return (rows[0] as DbArticle) ?? null;
}

export async function getAllDbArticles(kind?: ArticleKind): Promise<DbArticle[]> {
  if (kind) return (await sql()`SELECT * FROM articles WHERE kind = ${kind} ORDER BY date DESC`) as DbArticle[];
  return (await sql()`SELECT * FROM articles ORDER BY date DESC`) as DbArticle[];
}

export async function createDbArticle(a: { id: string; kind: ArticleKind; locale: Locale; slug: string; title: string; summary: string; date: string; tags: string[]; coverImage?: string; location?: string; readingTime?: string; content: string }): Promise<void> {
  await sql()`INSERT INTO articles (id,kind,locale,slug,title,summary,date,tags,cover_image,location,reading_time,content) VALUES (${a.id},${a.kind},${a.locale},${a.slug},${a.title},${a.summary},${a.date},${JSON.stringify(a.tags)}::jsonb,${a.coverImage??null},${a.location??null},${a.readingTime??null},${a.content})`;
}

export async function updateDbArticle(a: { id: string; kind: ArticleKind; locale: Locale; slug: string; title: string; summary: string; date: string; tags: string[]; coverImage?: string; location?: string; readingTime?: string; content: string }): Promise<void> {
  await sql()`UPDATE articles SET title=${a.title},summary=${a.summary},date=${a.date},tags=${JSON.stringify(a.tags)}::jsonb,cover_image=${a.coverImage??null},location=${a.location??null},reading_time=${a.readingTime??null},content=${a.content},updated_at=NOW() WHERE id=${a.id}`;
}

export async function deleteDbArticle(id: string): Promise<void> {
  await sql()`DELETE FROM articles WHERE id = ${id}`;
}
```

Commit: `feat: add database layer for articles CRUD`

---

### Task 3: Create admin auth + shell

Create `components/admin-gate.tsx` — identical structure to `CvGate` but uses `NEXT_PUBLIC_ADMIN_ACCESS_CODE` and cookie `admin-verified`.

Create `components/admin-shell.tsx` — header with "管理后台" link, "前台" link, "退出" link.

Create `app/admin/layout.tsx` — renders `<html>`, `<body>`, imports `globals.css`, wraps children in `AdminShell`. `metadata: { robots: "noindex, nofollow" }`.

Create `app/admin/page.tsx` — `redirect("/admin/articles")`.

Create `app/admin/login/page.tsx` — checks `admin-verified` cookie; if verified → redirect to articles; else → render `<AdminGate />`.

Create `app/admin/logout/route.ts` — clears `admin-verified` cookie, redirects to `/admin/login`.

Commit: `feat: add admin layout, login gate, and logout route`

---

### Task 4: Create article editor component

Create `components/article-editor.tsx` (`"use client"`):

- Dynamic import `createEditor` from `typora-web` + CSS (`typora-web/widgets.css`, `typora-web/theme-typora.css`)
- Metadata form: kind, locale, slug, title, date, tags, summary, coverImage, location, readingTime
- Button: "发布" calls `saveAction` (Server Action prop), on success redirects to `/admin/articles`
- `useEffect` to init editor on mount, `destroy()` on unmount
- Props: `mode: "new" | "edit"`, `initial?: { id?, kind, locale, slug, metadata, content }`, `saveAction`

Commit: `feat: add Typora-web article editor component`

---

### Task 5: Create admin article pages + server actions

Create `lib/admin-actions.ts` (`"use server"`) — exports `createArticle(data)`, `updateArticle(id, data)`, `deleteArticle(id, kind, locale)`. Each calls DB function then `revalidatePath()`.

Create `app/admin/articles/layout.tsx` — auth guard: check `admin-verified` cookie, redirect to `/admin/login` if missing.

Create `app/admin/articles/page.tsx` — Server Component: loads DB articles + static MDX articles, merges (DB overrides MDX on same slug), passes to client list.

Create `components/article-list-client.tsx` — Client table: kind/locale filter dropdowns, "新建文章" link, rows showing title/kind/date/locale/source (MDX=只读, DB=编辑/删除), delete with confirm.

Create `app/admin/articles/new/page.tsx` — renders `<ArticleEditor mode="new" saveAction={createArticle} />`.

Create `app/admin/articles/[id]/edit/page.tsx` — parses `[kind, locale, ...slugParts]` from id, loads article from DB, renders `<ArticleEditor mode="edit" initial={...} saveAction={(data) => updateArticle(id, data)} />`.

Create `app/admin/articles/[id]/delete/route.ts` — `POST` handler, calls `deleteDbArticle(id)`, returns JSON.

Commit: `feat: add admin article list, new, edit, and delete pages`

---

### Task 6: Make `lib/content.ts` hybrid

Split into sync static helpers + async hybrid wrappers:

- Rename current `records` → `staticRecords`
- Export `getStaticArticles(kind?)`, `getStaticArticle(kind, locale, slug)` — synchronous, used for MDX-only lookups
- Export async `getArticles(kind, locale)` — `getDbArticles()` + `getStaticArticles()`, merge (DB overrides MDX), sort by date
- Export async `getArticle(kind, locale, slug)` — DB first, fallback to `getStaticArticle()`
- Export async `getAllArticles(kind?)` — same merge pattern
- Keep `getArticleStaticParams(kind)` — MDX only (for `generateStaticParams`)
- Define `ArticleResult = ArticleSummary & { Component?: ComponentType<MDXProps>; content?: string }` for the return type of `getArticle()`

Commit: `feat: make content.ts hybrid — merge DB articles with static MDX`

---

### Task 7: Update frontend pages for DB articles

Install `next-mdx-remote` (already done in Task 1).

Create `components/db-article-renderer.tsx` — uses `<MDXRemote source={...} components={...} />` with same `<a>` and `<img>` overrides as `mdx-components.tsx`, wrapped in prose classes.

Modify `app/[lang]/blog/[slug]/page.tsx`:
- `dynamicParams = true`
- `await getArticle("blog", locale, slug)` in both `generateMetadata` and page component
- Check `"content" in article` → use `<DbArticleRenderer source={article.content} />`; else use `<article.Component />`

Same for `app/[lang]/life/[slug]/page.tsx`.

Modify list pages (`app/[lang]/blog/page.tsx`, `app/[lang]/life/page.tsx`, `app/[lang]/page.tsx`): `getArticles()` → `await getArticles()`.

Modify `app/sitemap.ts`: `getAllArticles()` → `await getAllArticles()`.

Commit: `feat: render DB articles alongside static MDX on frontend`

---

### Task 8: Configure environment and database

Add to `.env.local`:
```
DATABASE_URL=postgres://...
NEXT_PUBLIC_ADMIN_ACCESS_CODE=<your-admin-code>
```

Create the `articles` table in Neon via SQL editor or `npx neonctl`:
```sql
CREATE TABLE IF NOT EXISTS articles (
  id            TEXT PRIMARY KEY,
  kind          TEXT NOT NULL,
  locale        TEXT NOT NULL,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  date          TEXT NOT NULL,
  tags          JSONB NOT NULL DEFAULT '[]',
  cover_image   TEXT,
  location      TEXT,
  reading_time  TEXT,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_kind_locale_slug ON articles (kind, locale, slug);
```

---

### Task 9: Build and verify

```bash
npm run build        # Must pass
npm run dev          # Start and test:
```

Manual verification checklist:
1. `http://localhost:3000/admin` → redirects to `/admin/login`
2. Enter admin access code → redirected to `/admin/articles`
3. Click "新建文章" → editor loads with typora-web
4. Fill metadata + content, click "发布" → redirected to list, new article appears
5. Click "编辑" → editor loads with pre-filled data
6. Click "删除" → confirm, article removed
7. `http://localhost:3000/en/blog` → shows merged list (MDX + DB)
8. Click DB article → renders markdown via `next-mdx-remote`
9. Existing MDX articles still work unchanged
10. `http://localhost:3000/en/cv` → CV gate still works independently

Commit any fixes needed.

---

### Final commit

```bash
git add -A
git commit -m "feat: complete admin content editor with Typora-web and Neon Postgres"
```

After all tasks complete, push to remote.
