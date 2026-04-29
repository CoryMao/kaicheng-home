import type { Locale } from "@/lib/i18n";

export const siteConfig = {
  name: "Kaicheng Mao",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  email: "12311704@mail.sustech.edu.cn",
  cvPath: "/cv/cv.pdf",
  cvPaths: {
    en: "/cv/cv.pdf",
    zh: "/cv/cv-zh.pdf",
  } satisfies Record<Locale, string>,
  ogImage: "/media/og-image.svg",
};

export function getCvPath(locale: Locale) {
  return siteConfig.cvPaths[locale];
}
