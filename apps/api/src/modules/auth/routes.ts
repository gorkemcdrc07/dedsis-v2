import type { FastifyInstance, FastifyRequest } from "fastify";
import { LoginSchema } from "@dedsis/contracts";
import { supabaseAdmin, supabasePublic } from "../supabase/client.js";

function getBearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const input = LoginSchema.parse(request.body);

      const { data, error } =
          await supabasePublic.auth.signInWithPassword(input);

      if (error) {
          request.log.error(
              {
                  message: error.message,
                  status: error.status,
                  code: error.code,
                  email: input.email,
              },
              "Supabase login failed",
          );
      }
    if (error || !data.session || !data.user) {
      return reply.code(401).send({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "E-posta veya şifre hatalı.",
        },
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("v2_profiles")
      .select("id, email, full_name, phone, avatar_url, is_active")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return reply.code(403).send({
        success: false,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Kullanıcı profili bulunamadı.",
        },
      });
    }

    if (!profile.is_active) {
      return reply.code(403).send({
        success: false,
        error: {
          code: "USER_DISABLED",
          message: "Kullanıcı hesabı pasif durumda.",
        },
      });
    }

    return {
      success: true,
      data: {
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at,
        },
        user: profile,
      },
    };
  });

  app.get("/me", async (request, reply) => {
    const token = getBearerToken(request);

    if (!token) {
      return reply.code(401).send({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Oturum bilgisi bulunamadı.",
        },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return reply.code(401).send({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Oturum geçersiz veya süresi dolmuş.",
        },
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("v2_profiles")
      .select("id, email, full_name, phone, avatar_url, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.is_active) {
      return reply.code(403).send({
        success: false,
        error: {
          code: "USER_DISABLED",
          message: "Kullanıcı hesabına erişilemiyor.",
        },
      });
    }

    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from("v2_user_roles")
      .select(`
        v2_roles (
          code,
          name,
          v2_role_permissions (
            v2_permissions (
              code
            )
          )
        )
      `)
      .eq("user_id", user.id);

    if (roleError) {
      request.log.error(roleError);

      return reply.code(500).send({
        success: false,
        error: {
          code: "ROLE_FETCH_ERROR",
          message: "Kullanıcı yetkileri alınamadı.",
        },
      });
    }

    type PermissionRelation = {
      code: string;
    };

    type RolePermissionRelation = {
      v2_permissions:
        | PermissionRelation
        | PermissionRelation[]
        | null;
    };

    type RoleRelation = {
      code: string;
      name: string;
      v2_role_permissions:
        | RolePermissionRelation[]
        | null;
    };

    function firstRelation<T>(
      value: T | T[] | null | undefined,
    ): T | null {
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }

      return value ?? null;
    }

    const normalizedRoles = (roleRows ?? [])
      .map((row) =>
        firstRelation(
          row.v2_roles as
            | RoleRelation
            | RoleRelation[]
            | null,
        ),
      )
      .filter(
        (role): role is RoleRelation =>
          role !== null,
      );

    const roles = normalizedRoles.map((role) => ({
      code: role.code,
      name: role.name,
    }));

    const permissions = Array.from(
      new Set(
        normalizedRoles.flatMap((role) =>
          (role.v2_role_permissions ?? [])
            .map((item) =>
              firstRelation(item.v2_permissions)?.code,
            )
            .filter(
              (code): code is string =>
                typeof code === "string",
            ),
        ),
      ),
    );

    return {
      success: true,
      data: {
        user: profile,
        roles,
        permissions,
      },
    };
  });

  app.post("/logout", async (_request, reply) => {
    return reply.send({
      success: true,
      data: {
        loggedOut: true,
      },
    });
  });
}

