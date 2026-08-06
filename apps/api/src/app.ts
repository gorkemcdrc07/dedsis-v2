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
import { operationsRoutes } from "./modules/operations/routes.js";
import { employeeProjectsRoutes } from "./modules/employee-projects/routes.js";
import { evideaRoutes } from "./modules/evidea/routes.js";
import { basbugRoutes } from "./modules/basbug/routes.js";
import { userProjectsRoutes } from "./modules/user-projects/routes.js";
import { muhasebeRoutes } from "./modules/muhasebe/routes.js";
import { ikRoutes } from "./modules/ik/routes.js";

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
    origin: [
        env.WEB_ORIGIN,
        "http://localhost:5173",
        "http://localhost:5174",
    ],

    methods: [
        "GET",
        "POST",
        "PATCH",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],

    credentials: true,
});

    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute",
    });

    app.setErrorHandler((error: unknown, request, reply) => {
        request.log.error({ err: error }, "Unhandled API error");
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

    await app.register(operationsRoutes, {


        prefix: "/api/v1/operations",


    });



    await app.register(userProjectsRoutes, {
        prefix: "/api/v1/user-projects",
    });

    await app.register(employeeProjectsRoutes, {
        prefix: "/api/v1/employee-projects",
    });


    await app.register(evideaRoutes, {
        prefix: "/api/v1/evidea",
    });


    await app.register(muhasebeRoutes, {
        prefix: "/api/v1/muhasebe",
    });


    await app.register(basbugRoutes, {
        prefix: "/api/v1/basbug",
    });


    await app.register(legacySyncRoutes, {
        prefix: "/api/v1/legacy-sync",
    });

    await app.register(ikRoutes, {
        prefix: "/api/v1/ik",
    });

    return app;
}



























