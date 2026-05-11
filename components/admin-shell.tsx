import Link from "next/link";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin/articles" className="text-sm font-semibold tracking-[0.18em] text-foreground">管理后台</Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/en" className="hover:text-foreground">前台</Link>
            <a href="/admin/logout" className="hover:text-foreground">退出</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
