import type { Metadata } from "next";
import { Download, ExternalLink, Mail } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { profiles } from "@/content/profile";
import { getDictionary } from "@/lib/dictionaries";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";
import { getCvPath } from "@/lib/site";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);

  return createPageMetadata({
    locale,
    title: dictionary.cv.title,
    description: dictionary.cv.description,
    path: "/cv",
  });
}

export default async function CvPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const profile = profiles[locale];
  const cvPath = getCvPath(locale);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={dictionary.cv.title}
        title={dictionary.cv.description}
        description={profile.longBio}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={cvPath}
          download
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent"
        >
          <Download aria-hidden="true" className="size-4" />
          {dictionary.common.downloadCv}
        </a>
        <a
          href={cvPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          <ExternalLink aria-hidden="true" className="size-4" />
          {dictionary.common.openCv}
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
        >
          <Mail aria-hidden="true" className="size-4" />
          {dictionary.common.email}
        </a>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {dictionary.cv.education}
          </h2>
          <div className="mt-5 grid gap-4">
            {profile.education.map((item) => (
              <article
                key={`${item.degree}-${item.institution}`}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <p className="text-sm font-medium text-accent">{item.time}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {item.degree}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">
                  {item.institution}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">
            {dictionary.cv.experience}
          </h2>
          <div className="mt-5 grid gap-4">
            {profile.experience.map((item) => (
              <article
                key={`${item.role}-${item.organization}`}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <p className="text-sm font-medium text-accent">{item.time}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {item.role}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">
                  {item.organization}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-border bg-surface p-5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {dictionary.cv.skills}
          </h2>
          <div className="mt-5 grid gap-5">
            {profile.skills.map((group) => (
              <div key={group.group}>
                <h3 className="text-sm font-semibold text-foreground">
                  {group.group}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-surface-alt px-2 py-1 text-xs font-medium text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
            {dictionary.cv.honors}
          </h2>
          <div className="mt-4 grid gap-4">
            {profile.honors.map((honor) => (
              <article key={`${honor.time}-${honor.title}`}>
                <p className="text-xs font-semibold text-accent">
                  {honor.time}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-6 text-foreground">
                  {honor.title}
                </h3>
                <p className="text-sm text-muted">{honor.organization}</p>
                {honor.detail ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {honor.detail}
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <h2 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
            {dictionary.common.links}
          </h2>
          <div className="mt-4 grid gap-3 text-sm">
            {profile.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="font-semibold text-accent transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
