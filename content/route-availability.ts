import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

export const articleSlugAvailability: Record<
  ArticleKind,
  Record<Locale, string[]>
> = {
  blog: {
    en: ["grpo-math-reasoning", "project-1-survival-analysis"],
    zh: ["grpo-math-reasoning"],
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
