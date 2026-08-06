import type { FastifyInstance } from "fastify";
import { requireUser } from "../../common/auth.js";
import {
    getUserProjects,
} from "./service.js";


export async function userProjectsRoutes(
    app: FastifyInstance,
) {

    app.get("/", async (request) => {
        await requireUser(request);

        const result =
            await getUserProjects();

        return {
            success: true,
            data: result,
        };
    });

}