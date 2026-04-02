import { connectToDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireAuth, requireRole } from "@/lib/rbac";
import { noteCreateSchema } from "@/lib/validators";
import { Note } from "@/models/Note";
import { toPublicNote } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["USER"]);
    await connectToDb();
    const notes = await Note.find({ userId: auth.userId }).sort({ createdAt: -1 }).lean();
    return Response.json({ notes: notes.map((n) => toPublicNote(n)) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["USER"]);
    const body = await req.json();
    const parsed = noteCreateSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
    await connectToDb();
    const note = await Note.create({
      userId: auth.userId,
      title: parsed.data.title,
      body: parsed.data.body ?? "",
    });
    return Response.json({ note: toPublicNote(note.toObject()) }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
