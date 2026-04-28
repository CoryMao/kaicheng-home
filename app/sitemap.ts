import type { MetadataRoute } from "next";

import { getAllArticles } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = locales.flatMap((locale) =>
    ["", "/research", "/blog", "/life"].map((path) => ({
      url: absoluteUrl(siteConfig.url, `/${locale}${path}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const contentRoutes = getAllArticles().map((article) => ({
    url: absoluteUrl(
      siteConfig.url,
      `/${article.locale}/${article.kind}/${article.slug}`,
    ),
    lastModified: new Date(article.metadata.date),
    changeFrequency: "monthly" as const,
    priority: article.kind === "blog" ? 0.7 : 0.6,
  }));

  return [...staticRoutes, ...contentRoutes];
}
