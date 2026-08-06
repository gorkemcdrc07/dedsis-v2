import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { healthRoutes } from "./modules/health/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { legacySyncRoutes } from "./modules/legacy-sync/routes.js";

type ErrorWithStatusCode = Error & {
    statusCode?: number;
};

export async function buildApp() {
    const app = Fastify({
        logger: {
            redact: ["req.headers.authorization", "req.body.password"],
        },
        trustProxy: true,
    });

    await app.register(helmet);

    await app.register(cors, {
        origin: [env.WEB_ORIGIN],
        credentials: true,
    });

    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    app.setErrorHandler((error: unknown, request, reply) => {
        if (error instanceof ZodError) {
            return reply.code(400).send({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: error.issues[0]?.message ?? "Geçersiz istek",
                },
            });
        }

        const normalizedError: ErrorWithStatusCode =
            error instanceof Error
                ? error
                : new Error("Bilinmeyen sunucu hatası");

        const status =
            typeof normalizedError.statusCode === "number"
                ? normalizedError.statusCode
                : 500;

        request.log.error(
            {
                err: normalizedError,
                statusCode: status,
            },
            "Request failed",
        );

        return reply.code(status).send({
            success: false,
            error: {
                code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
                message:
                    status === 500
                        ? "Beklenmeyen sunucu hatası"
                        : normalizedError.message,
            },
        });
    });

    await app.register(healthRoutes, {
        prefix: "/api/v1",
    });

    await app.register(authRoutes, {
        prefix: "/api/v1/auth",
    });

    await app.register(dashboardRoutes, {
        prefix: "/api/v1/dashboard",
    });

    await app.register(legacySyncRoutes, {
        prefix: "/api/v1/legacy-sync",
    });

    return app;
}
