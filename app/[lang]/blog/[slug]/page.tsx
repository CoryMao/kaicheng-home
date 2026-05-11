import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShell } from "@/components/article-shell";
import { DbArticleRenderer } from "@/components/db-article-renderer";
import { getArticle, getArticleStaticParams } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { locales, type Locale } from "@/lib/i18n";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ lang: string; slug: string }> };

export const dynamicParams = true;

export function generateStaticParams() { return getArticleStaticParams("blog"); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const article = await getArticle("blog", locale, slug);
  if (!article) return {};
  const languageAlternates = Object.fromEntries(
    (await Promise.all(locales.map(async (l) => {
      const a = await getArticle("blog", l, slug);
      return a ? [l, `/${l}/blog/${slug}`] : null;
    }))).filter(Boolean) as [string, string][],
  ) as Partial<Record<Locale, string>>;
  return createPageMetadata({ locale, title: article.metadata.title, description: article.metadata.summary, path: `/blog/${article.slug}`, image: article.metadata.coverImage, languageAlternates });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { lang: rawLang, slug } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const article = await getArticle("blog", locale, slug);
  if (!article) notFound();

  const { metadata, kind, locale: aLocale, slug: aSlug } = article;

  return (
    <ArticleShell article={{ kind, locale: aLocale, slug: aSlug, metadata }} locale={locale} backHref={`/${locale}/blog`} backLabel={dictionary.common.backToBlog}>
      {"Component" in article && article.Component ? <article.Component /> : "content" in article && article.content ? <DbArticleRenderer source={article.content as string} /> : notFound()}
    </ArticleShell>
  );
}
