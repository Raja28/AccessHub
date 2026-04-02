import { connectToDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { HttpError, requireAuth, requireRole } from "@/lib/rbac";
import { noteUpdateSchema } from "@/lib/validators";
import { Note } from "@/models/Note";
import { toPublicNote } from "@/lib/serialize";
import mongoose from "mongoose";

export const runtime = "nodejs";

async function loadOwnNote(userId: string, noteId: string) {
  await connectToDb();
  if (!mongoose.isValidObjectId(noteId)) return null;
  const note = await Note.findById(noteId).lean();
  if (!note) return null;
  if (String(note.userId) !== userId) throw new HttpError(403, "Forbidden");
  return note;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["USER"]);
    const { id } = await ctx.params;
    const note = await loadOwnNote(auth.userId, id);
    if (!note) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ note: toPublicNote(note) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["USER"]);
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = noteUpdateSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    await loadOwnNote(auth.userId, id);
    const note = await Note.findById(id);
    if (!note) return Response.json({ error: "Not found" }, { status: 404 });
    if (parsed.data.title !== undefined) note.title = parsed.data.title;
    if (parsed.data.body !== undefined) note.body = parsed.data.body;
    await note.save();
    return Response.json({ note: toPublicNote(note.toObject()) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["USER"]);
    const { id } = await ctx.params;
    await loadOwnNote(auth.userId, id);
    await Note.deleteOne({ _id: id });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
