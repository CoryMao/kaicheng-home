import Image from "next/image";
import Link from "next/link";

import type { ArticleSummary } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

export function ArticleCard({
  article,
  href,
  locale,
  compact = false,
}: {
  article: ArticleSummary;
  href: string;
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group grid overflow-hidden rounded-lg border border-border bg-surface transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
    >
      {article.metadata.coverImage && !compact ? (
        <div className="relative aspect-[16/9] border-b border-border bg-surface-alt">
          <Image
            src={article.metadata.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
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
        <h3 className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-accent">
          {article.metadata.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted">
          {article.metadata.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {article.metadata.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-surface-alt px-2 py-1 text-xs font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
