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

export function dbArticleToSummary(
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
