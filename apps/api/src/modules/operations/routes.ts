import type { FastifyInstance } from "fastify";
import { LegacyDataQuerySchema } from "@dedsis/contracts";
import { requireUser } from "../../common/auth.js";
import { getOperations } from "./service.js";

export async function operationsRoutes(
    app: FastifyInstance,
) {
    app.post("/query", async (request) => {
        await requireUser(request);

        const query =
            LegacyDataQuerySchema.parse(
                request.body,
            );

        const result =
            await getOperations(query);

        return {
            success: true,
            data: result,
        };
    });
}
