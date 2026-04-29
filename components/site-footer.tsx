import Link from "next/link";

import { SocialLinks } from "@/components/social-links";
import { profiles } from "@/content/profile";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

type FooterLabels = {
  note: string;
};

export function SiteFooter({
  locale,
  labels,
}: {
  locale: Locale;
  labels: FooterLabels;
}) {
  const profile = profiles[locale];

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>{labels.note}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/${locale}/cv`} className="hover:text-foreground">
            CV
          </Link>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
            Email
          </a>
          <SocialLinks links={profile.links} />
        </div>
      </div>
    </footer>
  );
}
