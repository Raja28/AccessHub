import type { NoteDoc } from "@/models/Note";
import type { UserDoc } from "@/models/User";

export function toPublicUser(u: UserDoc | Record<string, unknown>) {
  const doc = u as UserDoc;
  return {
    id: String(doc._id),
    role: doc.role,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    createdBy: doc.createdBy ? String(doc.createdBy) : null,
    createdAt: "createdAt" in doc && doc.createdAt ? (doc.createdAt as Date).toISOString() : undefined,
    updatedAt: "updatedAt" in doc && doc.updatedAt ? (doc.updatedAt as Date).toISOString() : undefined,
  };
}

export function toPublicNote(n: NoteDoc | Record<string, unknown>) {
  const doc = n as NoteDoc & { createdAt?: Date; updatedAt?: Date };
  return {
    id: String(doc._id),
    userId: String(doc.userId),
    title: doc.title,
    body: doc.body,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
  };
}
