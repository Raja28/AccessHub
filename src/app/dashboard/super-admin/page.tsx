import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";
import { SuperAdminPanel } from "@/app/dashboard/super-admin/SuperAdminPanel";

export default async function SuperAdminDashboard() {
  const auth = await getAuthFromCookies();
  if (!auth) redirect("/login");
  if (auth.role !== "SUPER_ADMIN") redirect("/dashboard");

  return <SuperAdminPanel />;
}
