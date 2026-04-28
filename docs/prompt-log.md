# Personal Homepage Prompt Log

This document organizes the prompts and project instructions provided during the personal-homepage build. It keeps the original intent visible while grouping related prompts by phase.

## 1. Initial Direction

### P01 - Start an Academic Personal Homepage

```text
[$brainstorming](/Users/kaichengmao/.codex/skills/brainstorming/SKILL.md) 我现在想要开发个人主页（for学术 purpose），帮我构建整个项目，如果有很好的主页模板在github上，也可以列几个给我1
```

Intent: start a personal homepage project for academic purposes, with possible reference templates from GitHub.

### P02 - Reject Initial Direction

```text
不
```

Intent: reject or redirect the previous path.

### P03 - Expand Scope Beyond Pure Academic Use

```text
虽然是for 学术purpose，但我希望这个主页还能涵盖一些个人生活内容，还有博客
```

Intent: make the site a balanced academic, personal-life, and blog homepage.

## 2. Main Implementation Plan

### P04 - Implement the Bilingual Academic Homepage Plan

```text
PLEASE IMPLEMENT THIS PLAN:
# 双语学术个人主页 v1 计划

## Summary
- 保留当前 Next.js 16 + Tailwind 4 项目，构建一个“学术 + 博客 + 生活”均衡个人站。
- 路由采用 `/en`、`/zh`，根路径 `/` 默认进入 `/en`。
- 首版页面：Home、Research、Blog、Life、CV。
- 采用清爽杂志感视觉、浅色优先、完整 dark mode，支持系统主题和手动切换。

## Key Changes
- 将 App Router 重构为 `app/[lang]`，使用 Next 16 的 async `params` 约定；无效语言和不存在内容返回 404。
- 内容文件驱动页面：`profile`、`research` 使用结构化 TypeScript 数据；Blog/Life 使用本地 MDX。
- MDX 元数据使用 `export const metadata = {...}`，不使用 YAML frontmatter。
- 添加依赖：`@next/mdx`、`@mdx-js/loader`、`@mdx-js/react`、`@types/mdx`、`remark-gfm`、`@tailwindcss/typography`、`next-themes`、`lucide-react`。
- Research 数据结构包含 research areas、projects、publications、talks/activities；Publications/Projects 暂不独立成顶层页面。
- CV 提供 PDF 链接/下载，同时在站内展示教育、经历、技能和联系方式摘要。
- SEO 使用 Metadata API、localized title/description、alternate links、Open Graph、robots、sitemap；部署目标为 Vercel。

## UI And Behavior
- 首页首屏展示姓名、定位、当前身份、研究方向、核心链接和头像/个人照片。
- 首页下方露出 Research、Latest Writing、Life Notes 三类内容，保持学术和个人内容均衡。
- 导航包含 Home、Research、Blog、Life、CV、语言切换、主题切换。
- Blog 是长文阅读布局，支持标签、年份归档和 MDX 组件。
- Life 是图文札记列表/网格，和 Blog 区分为更短、更生活化的内容。
- 语言切换：顶层页面跳到对应语言同一路径；Blog/Life 详情页若目标语言没有同 slug 内容，则跳到目标语言列表页。

## Test Plan
- 运行 `npm run lint` 和 `npm run build`。
- 验证 `/`、`/en`、`/zh`、`/en/research`、`/zh/blog`、Blog/Life 详情页。
- 验证 `/fr`、不存在的 slug、缺失 locale 内容返回正确 404 或 fallback。
- 验证桌面和移动导航、语言切换、CV PDF 链接、图片渲染。
- 验证 light/dark/system 三种主题状态，刷新后主题选择保留。
- 启动 dev server 后检查英文/中文、浅色/深色、首页/文章页/生活页的视觉一致性。

## Assumptions
- 你会提供真实资料：中英文简介、头像/照片、CV PDF、研究方向、项目/论文/经历、首批 Blog/Life 内容。
- 若实现时资料还未齐，先用集中在内容文件里的明确示例数据，不把占位内容写死进组件。
- 首版不做 CMS、全文搜索、评论、RSS、数学公式和复杂动画。
- 参考模板只借鉴信息架构和内容组织，不直接替换当前项目：  
  https://github.com/tovacinni/research-website-template  
  https://github.com/lydhr/NextJSAcademicTheme  
  https://github.com/academicpages/academicpages.github.io  
  https://github.com/alshedivat/al-folio  
  https://github.com/HugoBlox/hugo-theme-academic-cv
```

Intent: implement the full v1 site with bilingual routing, MDX content, theme support, SEO, and Vercel deployment readiness.

## 3. Usage and Content Placement

### P05 - Ask How to Preview

```text
我现在应该做什么来看效果
```

Intent: learn how to run or view the local site.

### P06 - Ask Where to Put Personal Materials

```text
好的，我的这些东西应该放在哪些路径下
```

Intent: identify where CVs, images, and content should live in the project.

### P07 - Parse Uploaded CVs and Fill Profile

```text
我上传了中英两版cv，你可以先解析出来，帮我填写profile
```

Intent: extract information from bilingual CV files and populate `content/profile.ts`.

### P08 - Ask Next Steps After Importing to Vercel

```text
我已经在vercel上import了我们的项目了，接下来，应该怎么搞呢
```

Intent: understand deployment steps after importing the repository into Vercel.

## 4. Engineering Context

### P09 - Project and Environment Context

```text
# AGENTS.md instructions for /Users/kaichengmao/personal-homepage

<INSTRUCTIONS>
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

</INSTRUCTIONS>
<environment_context>
  <cwd>/Users/kaichengmao/personal-homepage</cwd>
  <shell>zsh</shell>
  <current_date>2026-04-27</current_date>
  <timezone>Asia/Shanghai</timezone>
</environment_context>
```

Intent: provide repo rules and environment context, especially the requirement to read local Next.js 16 docs before coding.

## 5. Profile Photos

### P10 - Add Four Avatar Photos

```text
我放了四个照片到仓库里，用来当我的头像，其中image.png作为主图，其他三个是可以通过小的按键来查看
```

Intent: use four uploaded photos as a profile-photo gallery, with `image.png` as the default main image.

## 6. Dark Mode Color Scheme

### P11 - Warm Up Dark Mode

```text
我想换一下dark mode的配色方案，稍微暖一点
```

Intent: revise dark mode colors to feel warmer.

### P12 - Choose Text-Only Discussion

```text
文字
```

Intent: choose text-only color方案 discussion instead of browser visual comparison.

### P13 - Approve Warm Academic Palette

```text
好
```

Intent: approve the recommended warm dark-mode palette.

## 7. Localized Name and Social Links

### P14 - Fix Chinese Display Name and Add Social Icons

```text
这里，中文页面显示的还是Kaicheng Mao，要变成毛恺诚，
此外，我还加上了github，instagram, linkein的图标
```

Intent: display `毛恺诚` on Chinese pages and add GitHub, Instagram, and LinkedIn icons.

### P15 - Provide Instagram URL

```text
ok，instagram url是https://www.instagram.com/kaicheng_mao?igsh=M3Z1ZDc2d3V0bXdq&utm_source=qr
```

Intent: provide the Instagram profile URL for social links.

## 8. Git Commit Guidance

### P16 - Ask for Commit Message

```text
帮我想一下commit的message写什么
```

Intent: get a suitable Git commit message for the current batch of changes.

## 9. Browser Tab Logo

### P17 - Use `logo.png` as Favicon

```text
我想要用这个当标签页上的logo，在仓库里是logo.png
```

Intent: use `logo.png` as the browser tab icon and app icon.

## 10. First Blog Post

### P18 - Convert and Publish Survival Analysis Blog

```text
[project1_survival_analysis_blog.mdx](project1_survival_analysis_blog.mdx) 帮我把这个blog的格式改成兼容我们现在的框架的，然后发布第一篇博客。之前的样例可以删掉
```

Intent: convert the provided MDX blog from YAML frontmatter to the current `export const metadata` format, publish it as the first blog post, and remove sample blog posts.

## 11. Project Explanation

### P19 - Summarize Implementation

```text
帮我稍微总结一下咱们这个个人主页是怎么实现的
```

Intent: explain how the homepage is implemented at a high level.

## 12. Prompt Archive Request

### P20 - Organize All Prompts into Markdown

```text
将我给你发的所有prompts整理成md
```

Intent: create this Markdown prompt log.

