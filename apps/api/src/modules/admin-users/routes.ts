import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireSuperAdmin } from "../../common/authorization.js";
import { supabaseAdmin } from "../supabase/client.js";

const UserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  fullName: z.string().trim().min(2),
  phone: z.string().trim().nullable().optional(),
  roleCode: z.string().min(1),
  isActive: z.boolean().default(true),
});

const PermissionInput = z.object({ permissionCodes: z.array(z.string()).default([]) });

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export async function adminUsersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => { await requireSuperAdmin(request); });

  app.get("/", async () => {
    const [profilesResult, rolesResult, permissionsResult, userRolesResult, overridesResult] = await Promise.all([
      supabaseAdmin.from("v2_profiles").select("id,email,full_name,phone,avatar_url,is_active,created_at").order("created_at"),
      supabaseAdmin.from("v2_roles").select("id,code,name,description,is_system,is_active").eq("is_active", true).order("name"),
      supabaseAdmin.from("v2_permissions").select("id,code,name,module,description").order("module").order("name"),
      supabaseAdmin.from("v2_user_roles").select("user_id,role_id,v2_roles(code,name,v2_role_permissions(v2_permissions(code)))"),
      supabaseAdmin.from("v2_user_permissions").select("user_id,is_allowed,v2_permissions(code)"),
    ]);

    const failure = [profilesResult, rolesResult, permissionsResult, userRolesResult, overridesResult].find((result) => result.error);
    if (failure?.error) throw new Error(failure.error.message);

    const rolePermissions = new Map<string, Set<string>>();
    const userRoleMap = new Map<string, { code: string; name: string }>();
    for (const row of userRolesResult.data ?? []) {
      const role = first(row.v2_roles as unknown as { code: string; name: string; v2_role_permissions?: Array<{ v2_permissions: { code: string } | Array<{ code: string }> | null }> } | null);
      if (!role) continue;
      userRoleMap.set(row.user_id, { code: role.code, name: role.name });
      rolePermissions.set(row.user_id, new Set((role.v2_role_permissions ?? []).map((item) => first(item.v2_permissions)?.code).filter((code): code is string => Boolean(code))));
    }

    const overrideMap = new Map<string, Map<string, boolean>>();
    for (const row of overridesResult.data ?? []) {
      const permission = first(row.v2_permissions as unknown as { code: string } | Array<{ code: string }> | null);
      if (!permission) continue;
      const map = overrideMap.get(row.user_id) ?? new Map<string, boolean>();
      map.set(permission.code, row.is_allowed);
      overrideMap.set(row.user_id, map);
    }

    const users = (profilesResult.data ?? []).map((profile) => {
      const effective = new Set(rolePermissions.get(profile.id) ?? []);
      for (const [code, allowed] of overrideMap.get(profile.id) ?? []) allowed ? effective.add(code) : effective.delete(code);
      return { ...profile, role: userRoleMap.get(profile.id) ?? null, permissions: [...effective] };
    });

    return { success: true, data: { users, roles: rolesResult.data ?? [], permissions: permissionsResult.data ?? [] } };
  });

  app.post("/", async (request, reply) => {
    const input = UserInput.extend({ password: z.string().min(8) }).parse(request.body);
    const actor = await requireSuperAdmin(request);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (authError || !authData.user) throw Object.assign(new Error(authError?.message ?? "Kullanıcı oluşturulamadı."), { statusCode: 400 });

    const { data: role } = await supabaseAdmin.from("v2_roles").select("id").eq("code", input.roleCode).single();
    await supabaseAdmin.from("v2_profiles").update({ full_name: input.fullName, phone: input.phone ?? null, is_active: input.isActive }).eq("id", authData.user.id);
    await supabaseAdmin.from("v2_user_roles").delete().eq("user_id", authData.user.id);
    if (role) await supabaseAdmin.from("v2_user_roles").insert({ user_id: authData.user.id, role_id: role.id, assigned_by: actor.id });
    return reply.code(201).send({ success: true, data: { id: authData.user.id } });
  });

  app.patch("/:id", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const input = UserInput.partial().parse(request.body);
    const actor = await requireSuperAdmin(request);
    const authUpdate: { email?: string; password?: string } = {};
    if (input.email) authUpdate.email = input.email;
    if (input.password) authUpdate.password = input.password;
    if (Object.keys(authUpdate).length) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdate);
      if (error) throw Object.assign(new Error(error.message), { statusCode: 400 });
    }
    const profileUpdate = {
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.fullName !== undefined ? { full_name: input.fullName } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
    };
    if (Object.keys(profileUpdate).length) await supabaseAdmin.from("v2_profiles").update(profileUpdate).eq("id", id);
    if (input.roleCode) {
      const { data: role } = await supabaseAdmin.from("v2_roles").select("id").eq("code", input.roleCode).single();
      if (!role) throw Object.assign(new Error("Rol bulunamadı."), { statusCode: 400 });
      await supabaseAdmin.from("v2_user_roles").delete().eq("user_id", id);
      await supabaseAdmin.from("v2_user_roles").insert({ user_id: id, role_id: role.id, assigned_by: actor.id });
    }
    return { success: true, data: { updated: true } };
  });

  app.put("/:id/permissions", async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const input = PermissionInput.parse(request.body);
    const { data: permissions, error } = await supabaseAdmin.from("v2_permissions").select("id,code");
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("v2_user_permissions").delete().eq("user_id", id);
    if (permissions?.length) {
      const selected = new Set(input.permissionCodes);
      const { error: insertError } = await supabaseAdmin.from("v2_user_permissions").insert(
        permissions.map((permission) => ({ user_id: id, permission_id: permission.id, is_allowed: selected.has(permission.code) })),
      );
      if (insertError) throw new Error(insertError.message);
    }
    return { success: true, data: { updated: true } };
  });

  app.delete("/:id", async (request) => {
    const actor = await requireSuperAdmin(request);
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    if (actor.id === id) throw Object.assign(new Error("Kendi hesabınızı silemezsiniz."), { statusCode: 400 });
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw Object.assign(new Error(error.message), { statusCode: 400 });
    return { success: true, data: { deleted: true } };
  });
}
