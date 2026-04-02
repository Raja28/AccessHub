import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";

export default async function DashboardIndex() {
  const auth = await getAuthFromCookies();
  if (!auth) redirect("/login");

  if (auth.role === "SUPER_ADMIN") redirect("/dashboard/super-admin");
  if (auth.role === "ADMIN") redirect("/dashboard/admin");
  redirect("/dashboard/user");
}

