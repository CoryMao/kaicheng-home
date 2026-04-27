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
    title: dictionary.blog.title,
    description: dictionary.blog.description,
    path: "/blog",
  });
}

export default async function BlogPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const posts = getArticles("blog", locale);
  const years = Array.from(
    new Set(posts.map((post) => new Date(post.metadata.date).getFullYear())),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={dictionary.blog.title}
        title={dictionary.blog.description}
      />

      {posts.length ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_220px]">
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <ArticleCard
                key={post.slug}
                article={post}
                href={`/${locale}/blog/${post.slug}`}
                locale={locale}
              />
            ))}
          </div>
          <aside className="h-fit rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Archive
            </h2>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              {years.map((year) => (
                <span key={year}>{year}</span>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-border bg-surface p-6 text-muted">
          {dictionary.blog.empty}
        </p>
      )}
    </div>
  );
}
