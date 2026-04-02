"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, isOk } from "@/lib/api-client";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function redirectAfterAuth(target: string) {

    try {
      const res = await api.get<{ user?: { role?: string } }>("/api/auth/me");
      const data = res.data;
      if (isOk(res.status) && data?.user?.role) {
        router.replace(target);
        return;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to get user");
    } 
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ error?: string; user?: { role?: Role } }>("/api/auth/login", { email, password });
      const data = res.data;
      if (!isOk(res.status)) {
        setError(data?.error || "Login failed");
        return;
      }
      const role: Role | undefined = data?.user?.role;
      if (!role) {
        setError("Login failed");
        return;
      }
      await redirectAfterAuth(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Use your email and password to sign in.</p>

        <label className="mt-4 block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="mt-3 block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error ? <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          First time?{" "}
          <Link href="/register/super-admin" className="font-medium text-zinc-900 underline dark:text-zinc-100">
            Register Super Admin
          </Link>
        </p>
      </form>
    </div>
  );
}
