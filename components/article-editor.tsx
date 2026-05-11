"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ArticleKind } from "@/lib/content-types";
import type { Locale } from "@/lib/i18n";

type EditorState = {
  kind: ArticleKind;
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string;
  coverImage: string;
  location: string;
  readingTime: string;
};

type SaveData = EditorState & { content: string; id?: string };

type Props = {
  mode: "new" | "edit";
  initial?: {
    id?: string;
    kind: ArticleKind;
    locale: Locale;
    slug: string;
    metadata: {
      title: string;
      date: string;
      summary: string;
      tags: string[];
      coverImage?: string;
      location?: string;
      readingTime?: string;
    };
    content: string;
  };
  saveAction: (data: SaveData) => Promise<{ success: boolean; error?: string }>;
};

export function ArticleEditor({ mode, initial, saveAction }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<{
    getMarkdown: () => string;
    setMarkdown: (md: string) => void;
    destroy: () => void;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<EditorState>({
    kind: initial?.kind ?? "blog",
    locale: initial?.locale ?? "en",
    slug: initial?.slug ?? "",
    title: initial?.metadata.title ?? "",
    summary: initial?.metadata.summary ?? "",
    date: initial?.metadata.date ?? new Date().toISOString().slice(0, 10),
    tags: initial?.metadata.tags?.join(", ") ?? "",
    coverImage: initial?.metadata.coverImage ?? "",
    location: initial?.metadata.location ?? "",
    readingTime: initial?.metadata.readingTime ?? "",
  });

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { createEditor } = await import("typora-web");
      await import("typora-web/widgets.css");
      await import("typora-web/theme-typora.css");

      if (!mounted || !editorRef.current) return;

      const editor = createEditor(editorRef.current, {
        initialContent: initial?.content ?? "",
      });
      editorInstance.current = editor;
    }

    init();

    return () => {
      mounted = false;
      editorInstance.current?.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField(field: keyof EditorState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const content = editorInstance.current?.getMarkdown() ?? "";

    const result = await saveAction({
      ...form,
      content,
      id: initial?.id,
      tags: form.tags,
    });

    if (result.success) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError(result.error ?? "保存失败");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {mode === "new" ? "新建文章" : "编辑文章"}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/articles")}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-accent disabled:opacity-50"
          >
            {saving ? "保存中..." : "发布"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-accent-strong/30 bg-accent-strong/10 p-3 text-sm text-accent-strong">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 rounded-lg border border-border bg-surface p-5 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">类型</label>
          <select value={form.kind} onChange={(e) => updateField("kind", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="blog">Blog</option>
            <option value="life">Life</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">语言</label>
          <select value={form.locale} onChange={(e) => updateField("locale", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
            <option value="en">EN</option>
            <option value="zh">ZH</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">标题</label>
          <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="文章标题" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="url-slug" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">日期</label>
          <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">标签 (逗号分隔)</label>
          <input type="text" value={form.tags} onChange={(e) => updateField("tags", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="tag1, tag2" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">摘要</label>
          <input type="text" value={form.summary} onChange={(e) => updateField("summary", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="文章摘要" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">封面图 URL (可选)</label>
          <input type="text" value={form.coverImage} onChange={(e) => updateField("coverImage", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="/media/cover.jpg" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">位置 (可选)</label>
          <input type="text" value={form.location} onChange={(e) => updateField("location", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted mb-1">阅读时长 (可选)</label>
          <input type="text" value={form.readingTime} onChange={(e) => updateField("readingTime", e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="5 min" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface">
        <div ref={editorRef} className="prose prose-zinc dark:prose-invert max-w-none p-6 min-h-[400px]" />
      </div>
    </div>
  );
}
