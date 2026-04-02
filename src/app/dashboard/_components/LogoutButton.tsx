"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await api.post("/api/auth/logout");
        router.replace("/login");
      }}
      className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10"
      type="button"
    >
      Logout
    </button>
  );
}

