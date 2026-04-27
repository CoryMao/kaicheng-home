import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShell } from "@/components/article-shell";
import { getArticle, getArticleStaticParams } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleStaticParams("life");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const article = getArticle("life", locale, slug);

  if (!article) {
    return {};
  }

  const languageAlternates = Object.fromEntries(
    locales
      .filter((candidateLocale) => getArticle("life", candidateLocale, slug))
      .map((candidateLocale) => [
        candidateLocale,
        `/${candidateLocale}/life/${slug}`,
      ]),
  ) as Partial<Record<Locale, string>>;

  return createPageMetadata({
    locale,
    title: article.metadata.title,
    description: article.metadata.summary,
    path: `/life/${article.slug}`,
    image: article.metadata.coverImage,
    languageAlternates,
  });
}

export default async function LifeNotePage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const article = getArticle("life", locale, slug);

  if (!article) {
    notFound();
  }

  const { Component, ...summary } = article;

  return (
    <ArticleShell
      article={summary}
      locale={locale}
      backHref={`/${locale}/life`}
      backLabel={dictionary.common.backToLife}
    >
      <Component />
    </ArticleShell>
  );
}
