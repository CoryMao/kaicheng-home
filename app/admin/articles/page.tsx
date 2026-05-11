import Link from "next/link";
import { ArticleListClient } from "@/components/article-list-client";
import { getAllArticles } from "@/lib/content";
import { getAllDbArticles, dbArticleToSummary } from "@/lib/db";
import type { ArticleSummary } from "@/lib/content-types";

type ArticleRow = ArticleSummary & { _source: "db" | "mdx" };

export default async function AdminArticlesPage() {
  let dbSummaries: ArticleSummary[] = [];
  try {
    const dbArticles = await getAllDbArticles();
    dbSummaries = dbArticles.map(dbArticleToSummary);
  } catch {
    // DATABASE_URL not configured yet — skip DB
  }

  const staticArticles = getAllArticles();

  const merged: ArticleRow[] = staticArticles.map((s) => ({ ...s, _source: "mdx" as const }));
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

  merged.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">文章管理</h1>
        <Link href="/admin/articles/new" className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent">
          + 新建文章
        </Link>
      </div>
      <ArticleListClient articles={merged} />
    </div>
  );
}
