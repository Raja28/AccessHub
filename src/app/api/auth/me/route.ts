import { connectToDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { requireAuth } from "@/lib/rbac";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireAuth();
    await connectToDb();
    const user = await User.findById(auth.userId).lean();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json({
      user: { id: String(user._id), role: user.role, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (e) {
    return jsonError(e);
  }
}

