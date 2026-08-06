import { z } from "zod";

export const RoleSchema = z.enum(["admin", "manager", "operator", "customer"]);
export type Role = z.infer<typeof RoleSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const LegacyDataQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  userId: z.string().optional(),

  filters: z.object({
    projectName: z.string().optional(),
    plateNumber: z.string().optional(),
    documentNo: z.string().optional(),
    customerName: z.string().optional(),
    supplierName: z.string().optional(),
  }).optional(),

  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(100),
});
export type LegacyDataQuery = z.infer<typeof LegacyDataQuerySchema>;

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

export * from "./dashboard/dashboard.schemas.js";

