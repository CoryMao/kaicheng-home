import type { Locale } from "@/lib/i18n";

export type ArticleKind = "blog" | "life";

export type ArticleMetadata = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  coverImage?: string;
  location?: string;
  readingTime?: string;
  published?: boolean;
};

export type ArticleSummary = {
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  metadata: ArticleMetadata;
};
