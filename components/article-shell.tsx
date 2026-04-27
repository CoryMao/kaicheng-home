import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { ArticleSummary } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

export function ArticleShell({
  article,
  locale,
  backHref,
  backLabel,
  children,
}: {
  article: ArticleSummary;
  locale: Locale;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {backLabel}
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <time dateTime={article.metadata.date}>
            {formatDate(article.metadata.date, locale)}
          </time>
          {article.metadata.readingTime ? <span>/</span> : null}
          {article.metadata.readingTime ? (
            <span>{article.metadata.readingTime}</span>
          ) : null}
          {article.metadata.location ? <span>/</span> : null}
          {article.metadata.location ? (
            <span>{article.metadata.location}</span>
          ) : null}
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {article.metadata.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          {article.metadata.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {article.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {article.metadata.coverImage ? (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-surface-alt">
          <Image
            src={article.metadata.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="prose prose-zinc mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-semibold prose-a:text-accent prose-img:rounded-lg dark:prose-invert">
        {children}
      </div>
    </article>
  );
}
