import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),

    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase()
      .optional(),
  }),
});