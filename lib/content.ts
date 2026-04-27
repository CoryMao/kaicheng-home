import "server-only";

import type { ComponentType } from "react";
import type { MDXProps } from "mdx/types";

import BlogFieldNotesEn, {
  metadata as blogFieldNotesEnMetadata,
} from "@/content/blog/en/field-notes.mdx";
import BlogResearchNotesEn, {
  metadata as blogResearchNotesEnMetadata,
} from "@/content/blog/en/research-notes.mdx";
import BlogResearchNotesZh, {
  metadata as blogResearchNotesZhMetadata,
} from "@/content/blog/zh/research-notes.mdx";
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

const records: ArticleRecord[] = [
  article(
    "blog",
    "en",
    "research-notes",
    blogResearchNotesEnMetadata,
    BlogResearchNotesEn,
  ),
  article(
    "blog",
    "zh",
    "research-notes",
    blogResearchNotesZhMetadata,
    BlogResearchNotesZh,
  ),
  article("blog", "en", "field-notes", blogFieldNotesEnMetadata, BlogFieldNotesEn),
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
  return {
    kind,
    locale,
    slug,
    metadata,
    Component,
  };
}

function isPublished(articleRecord: ArticleRecord) {
  return articleRecord.metadata.published !== false;
}

export function getArticles(kind: ArticleKind, locale: Locale): ArticleSummary[] {
  return records
    .filter(
      (articleRecord) =>
        articleRecord.kind === kind &&
        articleRecord.locale === locale &&
        isPublished(articleRecord),
    )
    .sort(
      (a, b) =>
        new Date(b.metadata.date).getTime() -
        new Date(a.metadata.date).getTime(),
    )
    .map((articleRecord) => ({
      kind: articleRecord.kind,
      locale: articleRecord.locale,
      slug: articleRecord.slug,
      metadata: articleRecord.metadata,
    }));
}

export function getAllArticles(kind?: ArticleKind): ArticleSummary[] {
  return records
    .filter(
      (articleRecord) =>
        (!kind || articleRecord.kind === kind) && isPublished(articleRecord),
    )
    .map((articleRecord) => ({
      kind: articleRecord.kind,
      locale: articleRecord.locale,
      slug: articleRecord.slug,
      metadata: articleRecord.metadata,
    }));
}

export function getArticle(kind: ArticleKind, locale: Locale, slug: string) {
  return records.find(
    (articleRecord) =>
      articleRecord.kind === kind &&
      articleRecord.locale === locale &&
      articleRecord.slug === slug &&
      isPublished(articleRecord),
  );
}

export function getArticleStaticParams(kind: ArticleKind) {
  return getAllArticles(kind).map((articleRecord) => ({
    lang: articleRecord.locale,
    slug: articleRecord.slug,
  }));
}
