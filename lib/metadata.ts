import type { Metadata } from "next";

import { profiles } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

type MetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  image?: string;
  languageAlternates?: Partial<Record<Locale, string>>;
};

export function createPageMetadata({
  locale,
  title,
  description,
  path = "",
  image = siteConfig.ogImage,
  languageAlternates,
}: MetadataInput): Metadata {
  const localizedPath = `/${locale}${path}`;
  const canonical = languageAlternates?.[locale] ?? localizedPath;
  const languages =
    languageAlternates ??
    ({
      en: `/en${path}`,
      zh: `/zh${path}`,
    } satisfies Record<Locale, string>);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: profiles[locale].name,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
