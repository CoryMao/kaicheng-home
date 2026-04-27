import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { researchProfiles } from "@/content/research";
import { getDictionary } from "@/lib/dictionaries";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";

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
    title: dictionary.research.title,
    description: dictionary.research.description,
    path: "/research",
  });
}

export default async function ResearchPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const dictionary = getDictionary(locale);
  const research = researchProfiles[locale];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={dictionary.research.title}
        title={dictionary.research.description}
      />

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {dictionary.research.areas}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {research.areas.map((area) => (
            <div
              key={area.title}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {area.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {area.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {area.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-surface-alt px-2 py-1 text-xs font-medium text-muted"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {dictionary.research.projects}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {research.projects.map((project) => (
            <article
              key={project.title}
              className="rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-accent">
                    {project.year}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                </div>
                {project.featured ? (
                  <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                    Featured
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {project.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-surface-alt px-2 py-1 text-xs font-medium text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {project.href ? (
                <Link
                  href={project.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent"
                >
                  Open project
                  <ExternalLink aria-hidden="true" className="size-4" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {dictionary.research.publications}
          </h2>
          <div className="mt-6 grid gap-4">
            {research.publications.map((publication) => (
              <article
                key={publication.title}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <p className="text-sm font-medium text-accent">
                  {publication.venue} / {publication.year}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {publication.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{publication.authors}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {publication.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm font-semibold text-accent transition hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {dictionary.research.activities}
          </h2>
          <div className="mt-6 grid gap-4">
            {research.activities.map((activity) => (
              <article
                key={activity.title}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <p className="text-sm font-medium text-accent">
                  {activity.organization} / {activity.date}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {activity.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {activity.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
