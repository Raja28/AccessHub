import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";
import { UserNotesPanel } from "@/app/dashboard/user/UserNotesPanel";

export default async function UserDashboard() {
  const auth = await getAuthFromCookies();
  if (!auth) redirect("/login");
  if (auth.role !== "USER") redirect("/dashboard");

  return <UserNotesPanel />;
}
