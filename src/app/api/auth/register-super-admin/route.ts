import { connectToDb } from "@/lib/db";
import { hashPassword, setAuthCookie, signAuthToken } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { HttpError } from "@/lib/rbac";
import { createAdminSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    
    await connectToDb();
    const count = await User.countDocuments({ role: "SUPER_ADMIN" });
    return Response.json({ allowed: count === 0 });
  } catch (e) {
    return jsonError(e);
  }
}

/** Create the first Super Admin when none exist; sets JWT cookie. */
export async function POST(req: Request) {
  try {
    await connectToDb();
    // if ((await User.countDocuments({ role: "SUPER_ADMIN" })) > 0) {
    //   throw new HttpError(403, "Super Admin registration is closed");
    // }

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const dup = await User.findOne({ email }).lean();
    if (dup) throw new HttpError(409, "Email already registered");

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      role: "SUPER_ADMIN",
      name: parsed.data.name,
      email,
      phone: parsed.data.phone,
      passwordHash,
      createdBy: null,
    });

    const token = signAuthToken({ sub: String(user._id), role: "SUPER_ADMIN" });
    await setAuthCookie(token);

    return Response.json({
      user: {
        id: String(user._id),
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
