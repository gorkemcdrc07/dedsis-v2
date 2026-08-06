import { api } from "../../lib/api";

export type ManagedUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  role: { code: string; name: string } | null;
  permissions: string[];
};

export type ManagedRole = { id: string; code: string; name: string; description: string | null };
export type ManagedPermission = { id: string; code: string; name: string; module: string; description: string | null };
export type AdminUsersData = { users: ManagedUser[]; roles: ManagedRole[]; permissions: ManagedPermission[] };

export const getAdminUsers = () => api<AdminUsersData>("/api/v1/admin/users");

export const createAdminUser = (input: {
  email: string; password: string; fullName: string; phone?: string | null; roleCode: string; isActive: boolean;
}) => api<{ id: string }>("/api/v1/admin/users", { method: "POST", body: JSON.stringify(input) });

export const updateAdminUser = (id: string, input: {
  email?: string; password?: string; fullName?: string; phone?: string | null; roleCode?: string; isActive?: boolean;
}) => api<{ updated: boolean }>(`/api/v1/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });

export const updateUserPermissions = (id: string, permissionCodes: string[]) =>
  api<{ updated: boolean }>(`/api/v1/admin/users/${id}/permissions`, { method: "PUT", body: JSON.stringify({ permissionCodes }) });

export const deleteAdminUser = (id: string) =>
  api<{ deleted: boolean }>(`/api/v1/admin/users/${id}`, { method: "DELETE" });

