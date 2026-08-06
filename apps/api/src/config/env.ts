import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

config({
  path: resolve(process.cwd(), "../../.env"),
});

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(4000),

  WEB_ORIGIN: z.string().url(),

  SUPABASE_URL: z.string().url(),

  SUPABASE_ANON_KEY: z.string().min(20),

  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  JWT_SECRET: z.string().min(32),

  LEGACY_API_URL: z.string().url(),

  LEGACY_API_TOKEN: z.string().min(1),
});

export const env = schema.parse(process.env);
