import { clearAuthCookie } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearAuthCookie();
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

