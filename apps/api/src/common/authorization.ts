import type { FastifyRequest } from "fastify";
import { requireUser } from "./auth.js";
import { supabaseAdmin } from "../modules/supabase/client.js";

export async function requireSuperAdmin(request: FastifyRequest) {
  const user = await requireUser(request);
  const { data, error } = await supabaseAdmin
    .from("v2_user_roles")
    .select("v2_roles!inner(code)")
    .eq("user_id", user.id)
    .eq("v2_roles.code", "super_admin");

  if (error || !data?.length) {
    throw Object.assign(new Error("Bu işlem yalnızca Süper Yönetici tarafından yapılabilir."), {
      statusCode: 403,
    });
  }

  return user;
}

export async function requirePermission(request: FastifyRequest, permissionCode: string) {
  const user = await requireUser(request);
  const { data: roles, error } = await supabaseAdmin
    .from("v2_user_roles")
    .select("v2_roles(code,v2_role_permissions(v2_permissions(code)))")
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  let allowed = false;
  for (const row of roles ?? []) {
    const roleValue = row.v2_roles as unknown as { code: string; v2_role_permissions?: Array<{ v2_permissions: { code: string } | Array<{ code: string }> | null }> } | Array<{ code: string; v2_role_permissions?: Array<{ v2_permissions: { code: string } | Array<{ code: string }> | null }> }> | null;
    const role = Array.isArray(roleValue) ? roleValue[0] : roleValue;
    if (!role) continue;
    if (role.code === "super_admin") allowed = true;
    for (const item of role.v2_role_permissions ?? []) {
      const permission = Array.isArray(item.v2_permissions) ? item.v2_permissions[0] : item.v2_permissions;
      if (permission?.code === permissionCode) allowed = true;
    }
  }

  const { data: override } = await supabaseAdmin
    .from("v2_user_permissions")
    .select("is_allowed,v2_permissions!inner(code)")
    .eq("user_id", user.id)
    .eq("v2_permissions.code", permissionCode)
    .maybeSingle();
  if (override) allowed = override.is_allowed;

  if (!allowed) throw Object.assign(new Error("Bu işlem için yetkiniz bulunmuyor."), { statusCode: 403 });
  return user;
}
