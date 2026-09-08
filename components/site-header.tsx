import Link from "next/link";

import { AdminEntryButton } from "@/components/admin-entry-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav, type NavItem } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { profiles } from "@/content/profile";
import type { Locale } from "@/lib/i18n";

type NavigationLabels = {
  home: string;
  blog: string;
  menu: string;
  close: string;
};

function getNavItems(locale: Locale, labels: NavigationLabels): NavItem[] {
  return [
    { href: `/${locale}`, label: labels.home },
    { href: `/${locale}/blog`, label: labels.blog },
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
    <header className="relative z-40 bg-background">
      <div className="mx-auto flex h-20 w-full max-w-[900px] items-center justify-between px-6 sm:px-10">
        <Link
          href={`/${locale}`}
          className="text-[15px] font-medium text-foreground"
        >
          {profile.name}
        </Link>

        <nav
          className="hidden items-center gap-0 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2.5 py-2 text-[15px] text-muted transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          <AdminEntryButton />
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
