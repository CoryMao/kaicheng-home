import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getDictionary } from "@/lib/dictionaries";
import { htmlLang, isLocale, locales } from "@/lib/i18n";
import { requireLocale } from "@/lib/locale";
import { siteConfig } from "@/lib/site";
import { profiles } from "@/content/profile";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale = isLocale(rawLang) ? rawLang : "en";
  const profile = profiles[locale];

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: profile.name,
      template: `%s | ${profile.name}`,
    },
    description: profile.shortBio,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        zh: "/zh",
      },
    },
    openGraph: {
      title: profile.name,
      description: profile.shortBio,
      url: `/${locale}`,
      siteName: profile.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: profile.name,
        },
      ],
      locale: locale === "zh" ? "zh_CN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: profile.name,
      description: profile.shortBio,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={htmlLang[locale]}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader locale={locale} labels={dictionary.navigation} />
            <main className="flex-1">{children}</main>
            <SiteFooter locale={locale} labels={dictionary.footer} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
