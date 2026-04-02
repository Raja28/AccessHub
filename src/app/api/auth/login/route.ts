import { connectToDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { setAuthCookie, signAuthToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid credentials" }, { status: 400 });
    }

    await connectToDb();

    const email = parsed.data.email.toLowerCase();
    const user = await User.findOne({ email }).lean();
    if (!user) return Response.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) return Response.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signAuthToken({ sub: String(user._id), role: user.role });
    await setAuthCookie(token);

    return Response.json({
      user: { id: String(user._id), role: user.role, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (e) {
    return jsonError(e);
  }
}

