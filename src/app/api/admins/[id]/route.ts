import { connectToDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { requireAuth, requireRole } from "@/lib/rbac";
import { updatePersonSchema } from "@/lib/validators";
import { User } from "@/models/User";
import { toPublicUser } from "@/lib/serialize";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    await connectToDb();
    const admin = await User.findOne({ _id: id, role: "ADMIN" }).lean();
    if (!admin) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ admin: toPublicUser(admin) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    const body = await req.json();
    const parsed = updatePersonSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    await connectToDb();
    const admin = await User.findOne({ _id: id, role: "ADMIN" });
    if (!admin) return Response.json({ error: "Not found" }, { status: 404 });

    if (parsed.data.name !== undefined) admin.name = parsed.data.name;
    if (parsed.data.phone !== undefined) admin.phone = parsed.data.phone;
    if (parsed.data.email !== undefined) {
      const email = parsed.data.email.toLowerCase();
      const dup = await User.findOne({ email, _id: { $ne: id } }).lean();
      if (dup) return Response.json({ error: "Email already in use" }, { status: 409 });
      admin.email = email;
    }
    if (parsed.data.password) admin.passwordHash = await hashPassword(parsed.data.password);
    await admin.save();
    return Response.json({ admin: toPublicUser(admin.toObject()) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN"]);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
    await connectToDb();
    const admin = await User.findOne({ _id: id, role: "ADMIN" });
    if (!admin) return Response.json({ error: "Not found" }, { status: 404 });
    await User.deleteMany({ role: "USER", createdBy: id });
    await User.deleteOne({ _id: id, role: "ADMIN" });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
