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
  adminBackHref,
  children,
}: {
  article: ArticleSummary;
  locale: Locale;
  backHref: string;
  backLabel: string;
  adminBackHref?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-[820px] px-6 py-12 sm:px-10 sm:py-16">
      {adminBackHref ? (
        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5">
          <Link
            href={adminBackHref}
            className="inline-flex items-center gap-2 text-[15px] font-medium text-accent transition hover:text-foreground"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            返回管理后台
          </Link>
        </div>
      ) : null}

      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-[15px] font-semibold text-accent transition hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {backLabel}
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2 text-[15px] text-muted">
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
        <h1 className="mt-4 text-[15px] font-medium leading-tight tracking-tight text-foreground ">
          {article.metadata.title}
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-muted">
          {article.metadata.summary}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {article.metadata.tags.map((tag) => (
            <span
              key={tag}
              className="py-1 text-[15px] font-medium text-muted"
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
            preload
          />
        </div>
      ) : null}

      <div className="prose prose-zinc mt-10 max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-semibold prose-a:text-accent prose-img:rounded-lg dark:prose-invert">
        {children}
      </div>
    </article>
  );
}
