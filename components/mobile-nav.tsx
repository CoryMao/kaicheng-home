"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n";

export type NavItem = {
  href: string;
  label: string;
};

export function MobileNav({
  items,
  locale,
  menuLabel,
  closeLabel,
}: {
  items: NavItem[];
  locale: Locale;
  menuLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-surface text-foreground"
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X aria-hidden="true" className="size-4" />
        ) : (
          <Menu aria-hidden="true" className="size-4" />
        )}
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-16 z-50 rounded-lg border border-border bg-surface p-3 shadow-xl shadow-black/10 dark:shadow-black/30">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle />
          </div>
        </div>
      ) : null}
    </div>
  );
}
