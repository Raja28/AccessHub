import { HttpError } from "@/lib/rbac";

export function jsonError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}

