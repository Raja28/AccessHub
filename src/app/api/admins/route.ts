import { connectToDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { requireAuth, requireRole } from "@/lib/rbac";
import { createAdminSchema } from "@/lib/validators";
import { User } from "@/models/User";
import { toPublicUser } from "@/lib/serialize";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN"]);
    await connectToDb();
    const admins = await User.find({ role: "ADMIN" }).sort({ createdAt: -1 }).lean();
    return Response.json({ admins: admins.map((a) => toPublicUser(a as Parameters<typeof toPublicUser>[0])) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    requireRole(auth, ["SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

    await connectToDb();
    const email = parsed.data.email.toLowerCase();
    const dup = await User.findOne({ email }).lean();
    if (dup) return Response.json({ error: "Email already in use" }, { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);
    const admin = await User.create({
      role: "ADMIN",
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash,
      createdBy: auth.userId,
    });

    return Response.json({ admin: toPublicUser(admin.toObject()) }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
