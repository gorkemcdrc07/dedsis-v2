import type { FastifyRequest } from "fastify";
import { supabaseAdmin } from "../modules/supabase/client.js";

export async function requireUser(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  const token = authorization
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  if (!token) {
    throw Object.assign(
      new Error("Oturum açmanız gerekiyor."),
      {
        statusCode: 401,
      },
    );
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw Object.assign(
      new Error("Geçersiz veya süresi dolmuş oturum."),
      {
        statusCode: 401,
      },
    );
  }

  return user;
}
