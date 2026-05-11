import { AdminShell } from "@/components/admin-shell";
import "../../app/globals.css";

export const metadata = { title: "管理后台", robots: "noindex, nofollow" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
