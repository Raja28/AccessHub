"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, isOk } from "@/lib/api-client";

export default function RegisterSuperAdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ error?: string }>("/api/auth/register-super-admin", { name, email, phone, password });
      if (!isOk(res.status)) {
        setError(res.data?.error || "Registration failed");
        return;
      }
      // Wait until the browser applies the auth cookie so middleware sees it.
      // for (let i = 0; i < 10; i++) {
      //   const me = await api.get<{ user?: { role?: string } }>("/api/auth/me");
      //   if (isOk(me.status) && me.data?.user?.role) break;
      //   await new Promise((r) => setTimeout(r, 100));
      // }
      router.replace("/dashboard");
    } 
    catch (error) {
      setError(error instanceof Error ? error.message : "Failed to register super admin");
    }
    finally {
      setLoading(false);
    }
  }

  // if (allowed === null) {
  //   return (
  //     <div className="flex flex-1 items-center justify-center px-6">
  //       <p className="text-sm text-zinc-600">Loading…</p>
  //     </div>
  //   );
  // }

  // if (!allowed) {
  //   return (
  //     <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
  //       <p className="text-center text-sm text-zinc-600">Super Admin registration is closed. A Super Admin already exists.</p>
  //       <Link href="/login" className="text-sm font-medium underline">
  //         Back to login
  //       </Link>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold">Register Super Admin</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">One-time setup. Creates the first Super Admin account.</p>

        <label className="mt-4 block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm font-medium">
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
          Phone
          <input
            className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
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
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        {error ? <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {loading ? "Creating…" : "Create Super Admin"}
        </button>

        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="underline">
            Already have an account? Login
          </Link>
        </p>
      </form>
    </div>
  );
}
