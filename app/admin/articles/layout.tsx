import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminArticlesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-verified")?.value !== "1") redirect("/admin/login");
  return <>{children}</>;
}
