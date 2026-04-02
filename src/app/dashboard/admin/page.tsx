import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";
import { AdminPanel } from "@/app/dashboard/admin/AdminPanel";

export default async function AdminDashboard() {
  const auth = await getAuthFromCookies();
  if (!auth) redirect("/login");
  if (auth.role !== "ADMIN") redirect("/dashboard");

  return <AdminPanel />;
}
