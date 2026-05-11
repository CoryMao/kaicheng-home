"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AdminEntryButton() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )admin-verified=([^;]*)/);
    setIsAdmin(match?.[1] === "1");
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin/articles"
      className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
    >
      管理
    </Link>
  );
}
