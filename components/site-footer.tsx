import { Mail } from "lucide-react";
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
    <footer>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 border-t border-border px-6 py-7 text-[15px] text-muted sm:px-10 md:flex-row md:items-center md:justify-between">
        <p>{labels.note}</p>
        <div className="flex flex-wrap items-center gap-3">
          <a href={`mailto:${siteConfig.email}`} aria-label="Email" title={siteConfig.email} className="inline-flex size-10 items-center justify-center hover:text-foreground">
            <Mail aria-hidden="true" className="size-5" />
          </a>
          <span>{profile.location}</span>
        </div>
      </div>
    </footer>
  );
}
