import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminGate } from "@/components/admin-gate";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-verified")?.value === "1") redirect("/admin/articles");
  return <AdminGate />;
}
