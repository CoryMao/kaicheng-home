import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/article-editor";
import { updateArticle } from "@/lib/admin-actions";
import { getDbArticle } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  // Parse "{kind}-{locale}-{slug}" — split on first two hyphens only
  const firstDash = id.indexOf("-");
  const secondDash = id.indexOf("-", firstDash + 1);
  if (firstDash === -1 || secondDash === -1) notFound();

  const kind = id.slice(0, firstDash) as "blog" | "life";
  const locale = id.slice(firstDash + 1, secondDash) as "en" | "zh";
  const slug = id.slice(secondDash + 1);

  const article = await getDbArticle(kind, locale, slug).catch(() => null);
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
      saveAction={(data) => updateArticle({ ...data, id })}
    />
  );
}
