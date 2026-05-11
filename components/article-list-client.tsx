"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { ArticleSummary } from "@/lib/content-types";

type ArticleRow = ArticleSummary & { _source: "db" | "mdx" };

export function ArticleListClient({ articles: initialArticles }: { articles: ArticleRow[] }) {
  const router = useRouter();
  const [articles] = useState(initialArticles);
  const [kindFilter, setKindFilter] = useState("all");
  const [localeFilter, setLocaleFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = articles.filter((a) => {
    if (kindFilter !== "all" && a.kind !== kindFilter) return false;
    if (localeFilter !== "all" && a.locale !== localeFilter) return false;
    return true;
  });

  async function handleDelete(id: string) {
    if (!confirm("确定删除这篇文章？")) return;
    setDeleting(id);
    try {
      const [kind, locale] = id.split("-");
      const res = await fetch(`/admin/articles/${id}/delete`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm">
          <option value="all">全部类型</option>
          <option value="blog">Blog</option>
          <option value="life">Life</option>
        </select>
        <select value={localeFilter} onChange={(e) => setLocaleFilter(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm">
          <option value="all">全部语言</option>
          <option value="en">EN</option>
          <option value="zh">ZH</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted">
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">类型</th>
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">语言</th>
              <th className="px-4 py-3">来源</th>
              <th className="px-4 py-3 w-32" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const id = `${a.kind}-${a.locale}-${a.slug}`;
              return (
                <tr key={id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{a.metadata.title}</td>
                  <td className="px-4 py-3 text-muted">{a.kind === "blog" ? "博客" : "生活"}</td>
                  <td className="px-4 py-3 text-muted">{a.metadata.date}</td>
                  <td className="px-4 py-3 text-muted uppercase">{a.locale}</td>
                  <td className="px-4 py-3">
                    {a._source === "mdx" ? (
                      <span className="rounded-md bg-surface-alt px-2 py-0.5 text-xs text-muted">MDX (只读)</span>
                    ) : (
                      <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">数据库</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a._source === "mdx" ? (
                      <Link href={`/${a.locale}/${a.kind}/${a.slug}`} className="text-xs text-muted hover:text-foreground">查看</Link>
                    ) : (
                      <span className="flex gap-3 justify-end">
                        <Link href={`/admin/articles/${id}/edit`} className="text-xs font-medium text-accent hover:underline">编辑</Link>
                        <button onClick={() => handleDelete(id)} disabled={deleting === id} className="text-xs font-medium text-accent-strong hover:underline disabled:opacity-50">删除</button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">暂无文章</p>}
      </div>
    </div>
  );
}
