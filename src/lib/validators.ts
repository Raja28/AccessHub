import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3),
  password: z.string().min(6),
  adminId: z.string().optional(), // required for SUPER_ADMIN, ignored for ADMIN
});

export const updatePersonSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
});

export const noteCreateSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional().default(""),
});

export const noteUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
});

