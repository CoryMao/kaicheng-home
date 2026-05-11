import "server-only";

import type { ComponentType } from "react";
import type { MDXProps } from "mdx/types";

import BlogGrpoMathReasoningEn, {
  metadata as blogGrpoMathReasoningEnMetadata,
} from "@/content/blog/en/grpo-math-reasoning.mdx";
import BlogGrpoMathReasoningZh, {
  metadata as blogGrpoMathReasoningZhMetadata,
} from "@/content/blog/zh/grpo-math-reasoning.mdx";
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
  article("blog", "en", "grpo-math-reasoning", blogGrpoMathReasoningEnMetadata, BlogGrpoMathReasoningEn),
  article("blog", "zh", "grpo-math-reasoning", blogGrpoMathReasoningZhMetadata, BlogGrpoMathReasoningZh),
  article("blog", "en", "project-1-survival-analysis", blogProjectSurvivalAnalysisEnMetadata, BlogProjectSurvivalAnalysisEn),
  article("life", "en", "weekend-walk", lifeWeekendWalkEnMetadata, LifeWeekendWalkEn),
  article("life", "zh", "weekend-walk", lifeWeekendWalkZhMetadata, LifeWeekendWalkZh),
  article("life", "en", "desk-light", lifeDeskLightEnMetadata, LifeDeskLightEn),
];

function article(
  kind: ArticleKind, locale: Locale, slug: string,
  metadata: ArticleMetadata, Component: ComponentType<MDXProps>,
): ArticleRecord { return { kind, locale, slug, metadata, Component }; }

function isPublished(r: ArticleRecord) { return r.metadata.published !== false; }

/* ---------- Static (MDX) helpers — synchronous ---------- */

export function getStaticArticles(kind?: ArticleKind): ArticleSummary[] {
  return staticRecords
    .filter((r) => (!kind || r.kind === kind) && isPublished(r))
    .map(({ Component: _, ...summary }) => summary)
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export function getStaticArticle(kind: ArticleKind, locale: Locale, slug: string) {
  return staticRecords.find(
    (r) => r.kind === kind && r.locale === locale && r.slug === slug && isPublished(r),
  );
}

export function getArticleStaticParams(kind: ArticleKind) {
  return getStaticArticles(kind).map((r) => ({ lang: r.locale, slug: r.slug }));
}

/* ---------- Hybrid helpers — async, DB-first ---------- */

function mergeSummaries(staticList: ArticleSummary[], dbList: ArticleSummary[]): ArticleSummary[] {
  const merged = [...staticList];
  for (const db of dbList) {
    const idx = merged.findIndex(
      (s) => s.kind === db.kind && s.locale === db.locale && s.slug === db.slug,
    );
    if (idx >= 0) merged[idx] = db; else merged.push(db);
  }
  return merged.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
}

export async function getArticles(kind: ArticleKind, locale: Locale): Promise<ArticleSummary[]> {
  const staticList = getStaticArticles(kind).filter((s) => s.locale === locale);
  try {
    const { getDbArticles, dbArticleToSummary } = await import("@/lib/db");
    const dbList = (await getDbArticles(kind, locale)).map(dbArticleToSummary);
    return mergeSummaries(staticList, dbList);
  } catch { return staticList; }
}

export type ArticleResult = ArticleSummary & {
  Component?: ComponentType<MDXProps>;
  content?: string;
};

export async function getArticle(kind: ArticleKind, locale: Locale, slug: string): Promise<ArticleResult | undefined> {
  try {
    const { getDbArticle } = await import("@/lib/db");
    const dbArticle = await getDbArticle(kind, locale, slug);
    if (dbArticle) {
      return {
        kind: dbArticle.kind, locale: dbArticle.locale, slug: dbArticle.slug,
        metadata: {
          title: dbArticle.title, date: dbArticle.date, summary: dbArticle.summary,
          tags: dbArticle.tags, coverImage: dbArticle.cover_image ?? undefined,
          location: dbArticle.location ?? undefined, readingTime: dbArticle.reading_time ?? undefined,
          published: true,
        },
        content: dbArticle.content,
      };
    }
  } catch { /* DB not configured yet */ }
  return getStaticArticle(kind, locale, slug);
}

export async function getAllArticles(kind?: ArticleKind): Promise<ArticleSummary[]> {
  const staticList = getStaticArticles(kind);
  try {
    const { getAllDbArticles, dbArticleToSummary } = await import("@/lib/db");
    const dbList = (await getAllDbArticles(kind)).map(dbArticleToSummary);
    return mergeSummaries(staticList, dbList);
  } catch { return staticList; }
}
