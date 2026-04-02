"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/app/dashboard/_components/LogoutButton";
import { api, isOk } from "@/lib/api-client";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export function AdminPanel() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [editUser, setEditUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState({
    create: false,
    delete: false,
    edit: false,
    load: false,
  });

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get<{ users?: PublicUser[]; error?: string }>("/api/users");
      const data = res.data;
      if (!isOk(res.status)) {
        setError(data?.error || "Failed to load users");
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load users");
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading({ ...loading, create: true });
      const res = await api.post<{ error?: string }>("/api/users", form);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Create failed");
        return;
      }
      setForm({ name: "", email: "", phone: "", password: "" });
      await loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading({ ...loading, create: false });
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      setError(null);
      setLoading({ ...loading, delete: true });
      const res = await api.delete<{ error?: string }>(`/api/users/${id}`);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Delete failed");
        return;
      }
      await loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading({ ...loading, delete: false });
    }
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    try {
      setError(null);
      setLoading({ ...loading, edit: true });
      const fd = new FormData(e.target as HTMLFormElement);
      const payload: Record<string, string> = {
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
      };
      const pw = String(fd.get("password") || "");
      if (pw) payload.password = pw;
      const res = await api.patch<{ error?: string }>(`/api/users/${editUser.id}`, payload);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Update failed");
        return;
      }
      setEditUser(null);
      await loadUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save user");
    } finally {
      setLoading({ ...loading, edit: false });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <LogoutButton />
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40">{error}</div> : null}

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-medium">Your users</h2>
        <form onSubmit={createUser} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            required
            minLength={6}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black">
              {loading.create ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Email</th>
                <th className="py-2 pr-2">Phone</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-2">{u.name}</td>
                  <td className="py-2 pr-2">{u.email}</td>
                  <td className="py-2 pr-2">{u.phone}</td>
                  <td className="py-2">
                    <button type="button" className="mr-2 text-blue-600 underline dark:text-blue-400" onClick={() => setEditUser(u)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 underline dark:text-red-400" onClick={() => deleteUser(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editUser ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveUser} className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-zinc-950">
            <h3 className="font-medium">Edit user</h3>
            <input name="name" defaultValue={editUser.name} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="email" type="email" defaultValue={editUser.email} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="phone" defaultValue={editUser.phone} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="password" type="password" placeholder="New password (optional)" className="mt-2 w-full rounded border px-2 py-1.5 text-sm" />
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">
                {loading.edit ? "Saving..." : "Save"}
              </button>
              <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={() => setEditUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
