import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { SectionHeading } from "@/components/section-heading";
import { getArticles } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    locale,
    title: dictionary.life.title,
    description: dictionary.life.description,
    path: "/life",
  });
}

export default async function LifePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const notes = getArticles("life", locale);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={dictionary.life.title}
        title={dictionary.life.description}
      />

      {notes.length ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <ArticleCard
              key={note.slug}
              article={note}
              href={`/${locale}/life/${note.slug}`}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-border bg-surface p-6 text-muted">
          {dictionary.life.empty}
        </p>
      )}
    </div>
  );
}
