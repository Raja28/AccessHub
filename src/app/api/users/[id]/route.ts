import { connectToDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { requireAuth, requireRole } from "@/lib/rbac";
import { updatePersonSchema } from "@/lib/validators";
import { User, type UserDoc } from "@/models/User";
import { Note } from "@/models/Note";
import { toPublicUser } from "@/lib/serialize";
import { assertCanManageUser } from "@/lib/userAccess";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN", "ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    await connectToDb();
    const user = await User.findById(id).lean();
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    assertCanManageUser(auth, user as UserDoc);
    return Response.json({ user: toPublicUser(user) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN", "ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const parsed = updatePersonSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    await connectToDb();
    const user = await User.findById(id);
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    assertCanManageUser(auth, user.toObject() as UserDoc);

    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.phone !== undefined) user.phone = parsed.data.phone;
    if (parsed.data.email !== undefined) {
      const email = parsed.data.email.toLowerCase();
      const dup = await User.findOne({ email, _id: { $ne: id } }).lean();
      if (dup) return Response.json({ error: "Email already in use" }, { status: 409 });
      user.email = email;
    }
    if (parsed.data.password) user.passwordHash = await hashPassword(parsed.data.password);
    await user.save();
    return Response.json({ user: toPublicUser(user.toObject()) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN", "ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    await connectToDb();
    const user = await User.findById(id).lean();
    if (!user) return Response.json({ error: "Not found" }, { status: 404 });
    assertCanManageUser(auth, user as UserDoc);
    await User.deleteOne({ _id: id });
    await Note.deleteMany({ userId: id });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
