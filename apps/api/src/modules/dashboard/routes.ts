import type { FastifyInstance } from "fastify";
import {
    DashboardQuerySchema,
    DashboardResponseSchema,
} from "@dedsis/contracts";
import { requireUser } from "../../common/auth.js";
import {
    getDashboard,
    getProjectDetail,
} from "./service.js";

export async function dashboardRoutes(
    app: FastifyInstance,
) {
    app.post("/", async (request) => {
        await requireUser(request);

        const rawBody =
            request.body as {
                startDate?: string;
                endDate?: string;
            };

        const query =
            DashboardQuerySchema.parse({
                startDate: rawBody.startDate
                    ? new Date(rawBody.startDate)
                    : undefined,
                endDate: rawBody.endDate
                    ? new Date(rawBody.endDate)
                    : undefined,
            });

        const dashboard =
            await getDashboard(query);

        return {
            success: true,
            data:
                DashboardResponseSchema.parse(
                    dashboard,
                ),
        };
    });

    app.get(
        "/projects/:projectId",
        async (request) => {
            await requireUser(request);

            const { projectId } =
                request.params as {
                    projectId: string;
                };

            const rawQuery =
                request.query as {
                    startDate?: string;
                    endDate?: string;
                };

            const query =
                DashboardQuerySchema.parse({
                    startDate: rawQuery.startDate
                        ? new Date(rawQuery.startDate)
                        : undefined,
                    endDate: rawQuery.endDate
                        ? new Date(rawQuery.endDate)
                        : undefined,
                });

            const detail =
                await getProjectDetail(
                    projectId,
                    query.startDate,
                    query.endDate,
                );

            return {
                success: true,
                data: {
                    project: detail,
                },
            };
        },
    );
}