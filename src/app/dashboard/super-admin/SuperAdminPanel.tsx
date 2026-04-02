"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/app/dashboard/_components/LogoutButton";
import { api, isOk } from "@/lib/api-client";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdBy: string | null;
};

export function SuperAdminPanel() {
  const [admins, setAdmins] = useState<PublicUser[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    createAdmin: false,
    createUser: false,
    deleteAdmin: false,
    deleteUser: false,
    editAdmin: false,
    editUser: false,
    load: false,
  });

  const [adminForm, setAdminForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [editAdmin, setEditAdmin] = useState<PublicUser | null>(null);
  const [editUser, setEditUser] = useState<PublicUser | null>(null);

  const loadAdmins = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<{ admins?: PublicUser[]; error?: string }>("/api/admins");
      const data = res.data;
      if (!isOk(res.status)) {
        setError(data?.error || "Failed to load admins");
        return;
      }
      setAdmins(data.admins || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load admins");

    } finally {
    }
  }, []);

  const loadUsers = useCallback(async (adminId: string) => {
    if (!adminId) {
      setUsers([]);
      return;
    }
    try {
      setError(null);
      const res = await api.get<{ users?: PublicUser[]; error?: string }>(`/api/users?adminId=${encodeURIComponent(adminId)}`);
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
    loadAdmins();
  }, [loadAdmins]);

  useEffect(() => {
    loadUsers(selectedAdminId);
  }, [selectedAdminId, loadUsers]);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading({ ...loading, createAdmin: true });
      const res = await api.post<{ error?: string }>("/api/admins", adminForm);
    if (!isOk(res.status)) {
      setError(res.data?.error || "Create failed");
      return;
    }
    setAdminForm({ name: "", email: "", phone: "", password: "" });
    await loadAdmins();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create admin");
    } finally {
      setLoading({ ...loading, createAdmin: false });
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAdminId) {
      setError("Select an admin first");
      return;
    }
    setError(null);
    try {
      setLoading({ ...loading, createUser: true });
    const res = await api.post<{ error?: string }>("/api/users", { ...userForm, adminId: selectedAdminId });
    if (!isOk(res.status)) {
      setError(res.data?.error || "Create failed");
      return;
    }
    setUserForm({ name: "", email: "", phone: "", password: "" });
    await loadUsers(selectedAdminId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading({ ...loading, createUser: false });
    }
  }

  async function deleteAdmin(id: string) {
    if (!confirm("Delete this admin and all users they created?")) return;
    try {
      setLoading({ ...loading, deleteAdmin: true });
    const res = await api.delete<{ error?: string }>(`/api/admins/${id}`);
    if (!isOk(res.status)) {
      setError(res.data?.error || "Delete failed");
      return;
    }
    if (selectedAdminId === id) setSelectedAdminId("");
    await loadAdmins();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete admin");
    } finally {
      setLoading({ ...loading, deleteAdmin: false });
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    try {
      setLoading({ ...loading, deleteUser: true });
    const res = await api.delete<{ error?: string }>(`/api/users/${id}`);
    if (!isOk(res.status)) {
      setError(res.data?.error || "Delete failed");
      return;
    }
    await loadUsers(selectedAdminId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading({ ...loading, deleteUser: false });
    }
  }

  async function saveAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!editAdmin) return;
    try {
      setLoading({ ...loading, editAdmin: true });
    const fd = new FormData(e.target as HTMLFormElement);
    const payload: Record<string, string> = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
    };
    const pw = String(fd.get("password") || "");
    if (pw) payload.password = pw;
    const res = await api.patch<{ error?: string }>(`/api/admins/${editAdmin.id}`, payload);
    if (!isOk(res.status)) {
      setError(res.data?.error || "Update failed");
      return;
    }
    setEditAdmin(null);
    await loadAdmins();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save admin");
    }
    finally {
      setLoading({ ...loading, editAdmin: false });
    }
  }

  async function saveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    try {
      setLoading({ ...loading, editUser: true });
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
    await loadUsers(selectedAdminId);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save user");
    }
    finally {
      setLoading({ ...loading, editUser: false });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Super Admin</h1>
        <LogoutButton />
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40">{error}</div> : null}

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-medium">Admins</h2>
        <form onSubmit={createAdmin} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Name"
            value={adminForm.name}
            onChange={(e) => setAdminForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Email"
            type="email"
            value={adminForm.email}
            onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Phone"
            value={adminForm.phone}
            onChange={(e) => setAdminForm((s) => ({ ...s, phone: e.target.value }))}
            required
          />
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Password"
            type="password"
            value={adminForm.password}
            onChange={(e) => setAdminForm((s) => ({ ...s, password: e.target.value }))}
            required
            minLength={6}
          />
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black">
              { loading.createAdmin ? "Creating..." : "Create admin" }
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
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2 pr-2">{a.name}</td>
                  <td className="py-2 pr-2">{a.email}</td>
                  <td className="py-2 pr-2">{a.phone}</td>
                  <td className="py-2">
                    <button type="button" className="mr-2 text-blue-600 underline dark:text-blue-400" onClick={() => setEditAdmin(a)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 underline dark:text-red-400" onClick={() => deleteAdmin(a.id)}>
                      { loading.deleteAdmin ? "Deleting..." : "Delete" }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-medium">Users under an admin</h2>
        <label className="mt-2 block text-sm">
          Select admin
          <select
            className="mt-1 w-full max-w-md rounded border border-black/10 bg-transparent px-2 py-2 dark:border-white/10"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
          >
            <option value="" className="dark:bg-zinc-950">— Choose —</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id} className="dark:bg-zinc-950">
                {a.name} ({a.email})
              </option>
            ))}
          </select>
        </label>

        {selectedAdminId ? (
          <form onSubmit={createUser} className="mt-4 grid gap-2 sm:grid-cols-2">
            <input
              className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
              placeholder="Name"
              value={userForm.name}
              onChange={(e) => setUserForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <input
              className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
              placeholder="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((s) => ({ ...s, email: e.target.value }))}
              required
            />
            <input
              className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
              placeholder="Phone"
              value={userForm.phone}
              onChange={(e) => setUserForm((s) => ({ ...s, phone: e.target.value }))}
              required
            />
            <input
              className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
              placeholder="Password"
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm((s) => ({ ...s, password: e.target.value }))}
              required
              minLength={6}
            />
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black">
                 { loading.createUser ? "Creating..." : "Create user" }
              </button>
            </div>
          </form>
        ) : null}

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

      {editAdmin ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveAdmin} className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-zinc-950">
            <h3 className="font-medium">Edit admin</h3>
            <input name="name" defaultValue={editAdmin.name} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="email" type="email" defaultValue={editAdmin.email} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="phone" defaultValue={editAdmin.phone} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <input name="password" type="password" placeholder="New password (optional)" className="mt-2 w-full rounded border px-2 py-1.5 text-sm" />
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">
                { loading.editAdmin ? "Saving..." : "Save" }
              </button>
              <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={() => setEditAdmin(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

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
                { loading.editUser ? "Saving..." : "Save" }
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
