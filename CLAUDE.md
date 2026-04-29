# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 沟通风格

- 用平和、易懂、耐心的语言回复用户
- 使用中文与用户交流
- 技术术语保留英文原文（如 Server Component、generateStaticParams、MDX 等）

## Commands

```
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a bilingual (en/zh) academic homepage built with Next.js 16 App Router, React 19, Tailwind CSS v4, and MDX.

**Routing by `[lang]`** — All pages live under `app/[lang]/`. The root `/` route is a proxy (`proxy.ts`) that redirects to `/${defaultLocale}`. Supported locales are `"en"` and `"zh"` (defined in `lib/i18n.ts`). Every page uses `generateStaticParams()` to emit both locales.

**MDX content system** — Blog posts and life notes are `.mdx` files in `content/blog/{locale}/` and `content/life/{locale}/`. Each `.mdx` file exports a React `default` component and a named `metadata` export (typed by `lib/content-types.ts`). These files are imported directly in `lib/content.ts` — content is NOT discovered via filesystem scans at runtime. The `mdx.d.ts` file provides TypeScript module declarations for `*.mdx` imports.

**Content data flow**:
- `lib/content.ts` (`server-only`) — the single content registry; imports all MDX files, filters/sorts them, exposes `getArticles()`, `getArticle()`, `getAllArticles()`
- `content/profile.ts` — localized profile data (name, bio, education, experience, skills, honors)
- `content/research.ts` — localized research areas, projects, publications, activities
- `content/route-availability.ts` — which article slugs exist in each locale (used by the language switcher to know if a translation exists)
- `lib/dictionaries.ts` — UI strings keyed by locale (navigation labels, page titles, CTAs)

**Component structure** — `components/` has the shell components (`SiteHeader`, `SiteFooter`), content presentation (`ArticleCard`, `ArticleShell`, `ProfilePhotoGallery`, `SectionHeading`), and behavior components (`ThemeProvider`, `ThemeToggle`, `LanguageSwitcher`, `MobileNav`). `ThemeProvider` wraps `next-themes` with `class` strategy and `system` default.

**Metadata** — `lib/metadata.ts` provides `createPageMetadata()` which generates standard OpenGraph, Twitter, and alternate-language metadata. The root layout (`app/[lang]/layout.tsx`) defines the base metadata with `metadataBase`, and individual pages call `createPageMetadata` to add page-specific values.

**Styling** — Tailwind CSS v4 with `@tailwindcss/typography` plugin. Custom semantic tokens (`background`, `foreground`, `muted`, `surface`, `surface-alt`, `border`, `accent`, `accent-strong`, `accent-warm`) defined as CSS custom properties in `app/globals.css` with light and dark variants. The dark variant uses `.dark` class selector. Geist Sans and Geist Mono fonts loaded via `next/font/google` in the root layout.

**MDX components** — `mdx-components.tsx` overrides `<a>` (external links open in new tab) and `<img>` (custom styling). MDX content is rendered inside `ArticleShell` which wraps it with `prose prose-zinc dark:prose-invert`.
