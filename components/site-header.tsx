import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav, type NavItem } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { profiles } from "@/content/profile";
import type { Locale } from "@/lib/i18n";

type NavigationLabels = {
  home: string;
  research: string;
  blog: string;
  life: string;
  cv: string;
  menu: string;
  close: string;
};

function getNavItems(locale: Locale, labels: NavigationLabels): NavItem[] {
  return [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/research`, label: labels.research },
    { href: `/${locale}/blog`, label: labels.blog },
    { href: `/${locale}/life`, label: labels.life },
    { href: `/${locale}/cv`, label: labels.cv },
  ];
}

export function SiteHeader({
  locale,
  labels,
}: {
  locale: Locale;
  labels: NavigationLabels;
}) {
  const navItems = getNavItems(locale, labels);
  const profile = profiles[locale];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold tracking-[0.18em] text-foreground"
        >
          {profile.name}
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>

        <MobileNav
          items={navItems}
          locale={locale}
          menuLabel={labels.menu}
          closeLabel={labels.close}
        />
      </div>
    </header>
  );
}
