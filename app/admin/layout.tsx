import { AdminShell } from "@/components/admin-shell";

export const metadata = { title: "管理后台", robots: "noindex, nofollow" };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
