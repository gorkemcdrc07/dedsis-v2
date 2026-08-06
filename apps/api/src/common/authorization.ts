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

