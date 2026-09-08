import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

import { SocialLinks } from "@/components/social-links";
import { ProfilePhotoGallery } from "@/components/profile-photo-gallery";
import { profiles } from "@/content/profile";
import { getArticles } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { requireLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/metadata";
import { formatDate } from "@/lib/utils";

type PageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const profile = profiles[locale];
  return createPageMetadata({ locale, title: profile.name, description: profile.shortBio });
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const locale = requireLocale(lang);
  const profile = profiles[locale];
  const dictionary = getDictionary(locale);
  const blogPosts = await getArticles("blog", locale);
  const zh = locale === "zh";

  return (
    <div className="mx-auto w-full max-w-[900px] px-6 pb-20 pt-12 sm:px-10 sm:pt-20">
      <section className="grid items-start gap-8 sm:grid-cols-[1fr_160px] sm:gap-14" aria-labelledby="intro-title">
        <div>
          <h1 id="intro-title" className="font-medium text-[15px] leading-7">
            {profile.name}
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            {zh ? "数据科学本科生 @ " : "Data Science undergrad @ "}
            <a href="https://www.sustech.edu.cn/" target="_blank" rel="noreferrer" className="text-link">{zh ? "南方科技大学" : "SUSTech"}</a>
          </p>
          <div className="mt-7 max-w-[540px] space-y-4 text-[15px] leading-7">
            <p>{zh
              ? "我的研究兴趣包括 LLM 后训练和生成式模型。"
              : "My research interests include LLM post-training and generative models."}</p>
            <p>{zh
              ? "我热爱排球和奥林匹克举重，欢迎找我一起打球或者一起训练！"
              : "I love volleyball and Olympic weightlifting. Always happy to have someone to play or train with!"}</p>
            <p>{zh
              ? "我可能是个异端，虽然是个老中，但是我莫名其妙很爱吃 Panda Express。"
              : "Fun fact: I am a born-and-raised Chinese person and I actually love Panda Express."}</p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <a href={`mailto:${profile.email}`} aria-label="Email" title={profile.email} className="inline-flex size-10 items-center justify-center text-muted transition hover:text-foreground">
              <Mail aria-hidden="true" className="size-5" />
            </a>
            <SocialLinks links={profile.links} />
          </div>
        </div>
        <div className="row-start-1 w-32 sm:col-start-2 sm:w-40 sm:pt-2">
          <ProfilePhotoGallery photos={profile.portraits} name={profile.name} />
          <p className="mt-3 text-[15px] text-muted">{profile.location}</p>
        </div>
      </section>

      {[
        { kind: "blog", title: zh ? "写作" : "Writing", posts: blogPosts },
      ].filter((section) => section.posts.length > 0).map((section) => (
        <section key={section.kind} className="mt-16 grid gap-5 border-t border-border pt-7 sm:grid-cols-[130px_1fr] sm:gap-8" aria-labelledby={`${section.kind}-title`}>
          <div>
            <h2 id={`${section.kind}-title`} className="text-[15px] font-medium">{section.title}</h2>
            <Link href={`/${locale}/${section.kind}`} className="mt-2 inline-block text-[15px] text-muted hover:text-accent">{dictionary.common.viewAll} <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="space-y-6">
            {section.posts.slice(0, 3).map((post) => (
              <Link key={post.slug} href={`/${locale}/${section.kind}/${post.slug}`} className="group block">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[15px] font-medium leading-6 group-hover:text-accent">{post.metadata.title}</h3>
                  <ArrowUpRight aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-muted group-hover:text-accent" />
                </div>
                <time dateTime={post.metadata.date} className="mt-1.5 block text-[15px] text-muted">{formatDate(post.metadata.date, locale)}</time>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
