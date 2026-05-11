"use server";

import { revalidatePath } from "next/cache";
import { createDbArticle, updateDbArticle, deleteDbArticle } from "@/lib/db";
import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

type ArticleInput = {
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string;
  coverImage?: string;
  location?: string;
  readingTime?: string;
  content: string;
  id?: string;
};

function parseTags(tags: string): string[] {
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createArticle(data: ArticleInput) {
  try {
    await createDbArticle({
      id: `${data.kind}-${data.locale}-${data.slug}`,
      kind: data.kind,
      locale: data.locale,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      date: data.date,
      tags: parseTags(data.tags),
      coverImage: data.coverImage || undefined,
      location: data.location || undefined,
      readingTime: data.readingTime || undefined,
      content: data.content,
    });
    revalidatePath(`/${data.locale}/${data.kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function updateArticle(data: ArticleInput) {
  try {
    if (!data.id) throw new Error("Missing article id");
    await updateDbArticle({
      id: data.id,
      kind: data.kind,
      locale: data.locale,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      date: data.date,
      tags: parseTags(data.tags),
      coverImage: data.coverImage || undefined,
      location: data.location || undefined,
      readingTime: data.readingTime || undefined,
      content: data.content,
    });
    revalidatePath(`/${data.locale}/${data.kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "保存失败" };
  }
}

export async function deleteArticle(id: string, kind: ArticleKind, locale: Locale) {
  try {
    await deleteDbArticle(id);
    revalidatePath(`/${locale}/${kind}`);
    revalidatePath("/admin/articles");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "删除失败" };
  }
}
