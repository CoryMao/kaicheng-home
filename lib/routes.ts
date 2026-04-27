import { hasArticleSlug } from "@/content/route-availability";
import type { Locale } from "@/lib/i18n";

export function switchLocalePath(pathname: string, targetLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  const [, section, slug] = parts;

  if (section === "blog" && slug) {
    return hasArticleSlug("blog", targetLocale, slug)
      ? `/${targetLocale}/blog/${slug}`
      : `/${targetLocale}/blog`;
  }

  if (section === "life" && slug) {
    return hasArticleSlug("life", targetLocale, slug)
      ? `/${targetLocale}/life/${slug}`
      : `/${targetLocale}/life`;
  }

  return `/${targetLocale}${section ? `/${parts.slice(1).join("/")}` : ""}`;
}
