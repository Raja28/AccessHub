import type { UserDoc } from "@/models/User";
import type { AuthContext } from "@/lib/rbac";
import { HttpError } from "@/lib/rbac";

export function assertEndUser(doc: UserDoc | null): asserts doc is UserDoc {
  if (!doc) throw new HttpError(404, "Not found");
  if (doc.role !== "USER") throw new HttpError(400, "Not a user record");
}

/** Admin may manage only users they created; Super Admin may manage any USER. */
export function assertCanManageUser(auth: AuthContext, userDoc: UserDoc) {
  assertEndUser(userDoc);
  if (auth.role === "ADMIN") {
    if (String(userDoc.createdBy) !== auth.userId) throw new HttpError(403, "Forbidden");
    return;
  }
  if (auth.role === "SUPER_ADMIN") return;
  throw new HttpError(403, "Forbidden");
}
