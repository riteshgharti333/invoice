export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];