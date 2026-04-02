import { connectToDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { HttpError, requireAuth, requireRole } from "@/lib/rbac";
import { createUserSchema } from "@/lib/validators";
import { User } from "@/models/User";
import { toPublicUser } from "@/lib/serialize";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN", "ADMIN"]);
    await connectToDb();

    if (auth.role === "ADMIN") {
      const users = await User.find({ role: "USER", createdBy: auth.userId }).sort({ createdAt: -1 }).lean();
      return Response.json({ users: users.map((u) => toPublicUser(u)) });
    }

    const adminId = new URL(req.url).searchParams.get("adminId");
    if (!adminId || !mongoose.isValidObjectId(adminId)) {
      throw new HttpError(400, "Query adminId is required and must be valid");
    }
    const admin = await User.findOne({ _id: adminId, role: "ADMIN" }).lean();
    if (!admin) return Response.json({ error: "Admin not found" }, { status: 404 });

    const users = await User.find({ role: "USER", createdBy: adminId }).sort({ createdAt: -1 }).lean();
    return Response.json({ users: users.map((u) => toPublicUser(u)) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    await connectToDb();

    let createdById: string;
    if (auth.role === "ADMIN") {
      createdById = auth.userId;
    } else {
      const adminId = parsed.data.adminId;
      if (!adminId || !mongoose.isValidObjectId(adminId)) {
        throw new HttpError(400, "adminId is required for Super Admin");
      }
      const admin = await User.findOne({ _id: adminId, role: "ADMIN" }).lean();
      if (!admin) return Response.json({ error: "Admin not found" }, { status: 404 });
      createdById = adminId;
    }

    const email = parsed.data.email.toLowerCase();
    const dup = await User.findOne({ email }).lean();
    if (dup) return Response.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      role: "USER",
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash,
      createdBy: createdById,
    });

    return Response.json({ user: toPublicUser(user.toObject()) }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
