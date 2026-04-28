import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin } from "lucide-react";

import { ArticleCard } from "@/components/article-card";
import { ProfilePhotoGallery } from "@/components/profile-photo-gallery";
import { SectionHeading } from "@/components/section-heading";
import { SocialLinks } from "@/components/social-links";
import { profiles } from "@/content/profile";
import { researchProfiles } from "@/content/research";
import { getArticles } from "@/lib/content";
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
  const profile = profiles[locale];

  return createPageMetadata({
    locale,
    title: profile.name,
    description: profile.shortBio,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const locale = requireLocale(rawLang);
  const profile = profiles[locale];
  const research = researchProfiles[locale];
  const dictionary = getDictionary(locale);
  const blogPosts = getArticles("blog", locale).slice(0, 2);
  const lifeNotes = getArticles("life", locale).slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {dictionary.home.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {profile.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {dictionary.home.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:flex-wrap">
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 text-accent" />
              {profile.location}
            </span>
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 transition hover:text-foreground"
            >
              <Mail aria-hidden="true" className="size-4 text-accent" />
              {profile.email}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/research`}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent"
            >
              {dictionary.home.researchCta}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
            >
              {dictionary.home.blogCta}
            </Link>
          </div>
          <SocialLinks links={profile.links} className="mt-5" />
        </div>

        <div className="relative">
          <ProfilePhotoGallery photos={profile.portraits} name={profile.name} />
          <div className="mt-4 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-foreground">
              {profile.status}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {profile.shortBio}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title={dictionary.common.selectedResearch}
          description={research.areas[0]?.description}
          actionHref={`/${locale}/research`}
          actionLabel={dictionary.common.viewAll}
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
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

      <section className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            title={dictionary.common.latestWriting}
            actionHref={`/${locale}/blog`}
            actionLabel={dictionary.common.viewAll}
          />
          <div className="mt-6 grid gap-4">
            {blogPosts.map((post) => (
              <ArticleCard
                key={post.slug}
                article={post}
                href={`/${locale}/blog/${post.slug}`}
                locale={locale}
                compact
              />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading
            title={dictionary.common.lifeNotes}
            actionHref={`/${locale}/life`}
            actionLabel={dictionary.home.lifeCta}
          />
          <div className="mt-6 grid gap-4">
            {lifeNotes.map((note) => (
              <ArticleCard
                key={note.slug}
                article={note}
                href={`/${locale}/life/${note.slug}`}
                locale={locale}
                compact
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
