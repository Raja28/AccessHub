import type { Role } from "@/models/User";
import { getAuthFromCookies } from "@/lib/auth";

export type AuthContext = { userId: string; role: Role };

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuthFromCookies();
  if (!auth) throw new HttpError(401, "Unauthorized");
  return { userId: auth.sub, role: auth.role };
}

export function requireRole(auth: AuthContext, roles: Role[]) {
  if (!roles.includes(auth.role)) throw new HttpError(403, "Forbidden");
}

