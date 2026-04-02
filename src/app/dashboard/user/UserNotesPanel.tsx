"use client";

import { useCallback, useEffect, useState } from "react";
import { LogoutButton } from "@/app/dashboard/_components/LogoutButton";
import { api, isOk } from "@/lib/api-client";

type Note = { id: string; title: string; body: string };

export function UserNotesPanel() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "" });
  const [edit, setEdit] = useState<Note | null>(null);
  const [loading, setLoading] = useState({
    delete: false,
    edit: false,
    create: false,
    loading: false
  });

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ notes?: Note[]; error?: string }>("/api/notes");
      const data = res.data;
      if (!isOk(res.status)) {
        setError(data?.error || "Failed to load notes");
        return;
      }
      setNotes(data.notes || []);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load notes");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading({ ...loading, create: true });
    try {
      const res = await api.post<{ error?: string }>("/api/notes", form);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Create failed");
        return;
      }
      setForm({ title: "", body: "" });
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create note");
    } finally {
      setLoading({ ...loading, create: false });
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    setLoading({ ...loading, delete: true });
    try {
      const res = await api.delete<{ error?: string }>(`/api/notes/${id}`);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Delete failed");
        return;
      }
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete note");
    } finally {
      setLoading({ ...loading, delete: false });
    }
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setLoading({ ...loading, edit: true });
    try {
      const fd = new FormData(e.target as HTMLFormElement);
      const payload = {
        title: String(fd.get("title") || ""),
        body: String(fd.get("body") || ""),
      };
      const res = await api.patch<{ error?: string }>(`/api/notes/${edit.id}`, payload);
      if (!isOk(res.status)) {
        setError(res.data?.error || "Update failed");
        return;
      }
      setEdit(null);
      await load();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setLoading({ ...loading, edit: false });
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My notes</h1>
        <LogoutButton />
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40">{error}</div> : null}

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-medium">New note</h2>
        <form onSubmit={createNote} className="mt-3 flex flex-col gap-2">
          <input
            className="rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
          />
          <textarea
            className="min-h-[80px] rounded border border-black/10 px-2 py-1.5 text-sm dark:border-white/10"
            placeholder="Body"
            value={form.body}
            onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
          />
          <button type="submit" className="w-fit rounded-lg bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black">
            {loading.create ? "Adding..." : "Add note"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-black/10 p-4 dark:border-white/10">
        <h2 className="text-lg font-medium">All notes</h2>
        <ul className="mt-3 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{n.body}</div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className="text-sm text-blue-600 underline dark:text-blue-400" onClick={() => setEdit(n)}>
                    Edit
                  </button>
                  <button type="button" className="text-sm text-red-600 underline dark:text-red-400" onClick={() => deleteNote(n.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {edit ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveNote} className="w-full max-w-md rounded-xl bg-white p-4 dark:bg-zinc-950">
            <h3 className="font-medium">Edit note</h3>
            <input name="title" defaultValue={edit.title} className="mt-2 w-full rounded border px-2 py-1.5 text-sm" required />
            <textarea name="body" defaultValue={edit.body} className="mt-2 min-h-[100px] w-full rounded border px-2 py-1.5 text-sm" />
            <div className="mt-3 flex gap-2">
              <button type="submit" className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black">
                {loading.edit ? "Saving..." : "Save"}
              </button>
              <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
