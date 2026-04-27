"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeLabels, locales, type Locale } from "@/lib/i18n";
import { switchLocalePath } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname() ?? `/${currentLocale}`;

  return (
    <div
      className="inline-flex h-10 items-center rounded-md border border-border bg-surface p-1 text-sm font-medium"
      aria-label="Language switcher"
    >
      {locales.map((locale) => (
        <Link
          key={locale}
          href={switchLocalePath(pathname, locale)}
          className={cn(
            "flex h-8 min-w-9 items-center justify-center rounded px-2 transition",
            locale === currentLocale
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground",
          )}
          aria-current={locale === currentLocale ? "page" : undefined}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </div>
  );
}
