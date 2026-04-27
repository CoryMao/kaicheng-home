import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

export const articleSlugAvailability: Record<
  ArticleKind,
  Record<Locale, string[]>
> = {
  blog: {
    en: ["research-notes", "field-notes"],
    zh: ["research-notes"],
  },
  life: {
    en: ["weekend-walk", "desk-light"],
    zh: ["weekend-walk"],
  },
};

export function hasArticleSlug(
  kind: ArticleKind,
  locale: Locale,
  slug: string,
) {
  return articleSlugAvailability[kind][locale].includes(slug);
}
