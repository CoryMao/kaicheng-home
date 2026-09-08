import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const dictionary = getDictionary(locale);
  return createPageMetadata({ locale, title: dictionary.blog.title, description: dictionary.blog.description, path: "/blog" });
}

export default async function BlogPage({ params }: PageProps) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const dictionary = getDictionary(locale);
  const posts = await getArticles("blog", locale);
  const years = Array.from(new Set(posts.map((post) => post.metadata.date.slice(0, 4))));

  return (
    <div className="mx-auto w-full max-w-[900px] px-6 pb-20 pt-12 sm:px-10 sm:pt-20">
      <h1 className="font-medium text-[15px] tracking-tight ">Blog<span className="text-accent">.</span></h1>
      <p className="mt-5 text-[15px] leading-7 text-muted">{locale === "zh" ? "写下实验过程、读过的东西，以及还没想明白的问题。" : "Experiments, things I've read, and questions I'm still working through."}</p>
      {posts.length ? (
        <div className="mt-12 space-y-10">
          {years.map((year) => (
            <section key={year} aria-labelledby={`year-${year}`} className="grid gap-5 border-t border-border pt-7 sm:grid-cols-[100px_1fr] sm:gap-8">
              <h2 id={`year-${year}`} className="font-mono text-[15px] text-muted">{year}</h2>
              <div className="space-y-8">
                {posts.filter((post) => post.metadata.date.startsWith(year)).map((post) => (
                  <article key={post.slug}>
                    <Link href={`/${locale}/blog/${post.slug}`} className="group block">
                      <h3 className="text-[15px] font-medium leading-7 group-hover:text-accent">{post.metadata.title}</h3>
                      <p className="mt-2 text-[15px] leading-6 text-muted">{post.metadata.summary}</p>
                      <time dateTime={post.metadata.date} className="mt-3 block text-[15px] text-muted">{formatDate(post.metadata.date, locale)}</time>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : <p className="mt-12 text-[15px] text-muted">{dictionary.blog.empty}</p>}
    </div>
  );
}
