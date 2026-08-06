import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { supabaseAdmin } from "../supabase/client.js";
import {
    createLegacySyncJob,
    getLegacySyncJob,
    updateLegacySyncJob,
} from "./services/sync-job-store.js";
import { syncShipments } from "./services/sync-shipments.js";

const INCREMENTAL_OVERLAP_DAYS = 3;

const syncShipmentsBodySchema = z
    .object({
        startDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Başlangıç tarihi YYYY-MM-DD formatında olmalıdır.",
            ),

        endDate: z
            .string()
            .regex(
                /^\d{4}-\d{2}-\d{2}$/,
                "Bitiş tarihi YYYY-MM-DD formatında olmalıdır.",
            ),
    })
    .strict();

function createStartDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
}

function createEndDate(value: string): Date {
    return new Date(`${value}T23:59:59.999Z`);
}

function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

async function getIncrementalStartDate(
    requestedStartDate: Date,
    requestedEndDate: Date,
): Promise<{
    startDate: Date;
    mode: "full" | "incremental";
    latestImportedDate: string | null;
}> {
    const { data, error } =
        await supabaseAdmin
            .from("shipment_imports")
            .select("despatch_date")
            .gte(
                "despatch_date",
                toIsoDate(requestedStartDate),
            )
            .lte(
                "despatch_date",
                toIsoDate(requestedEndDate),
            )
            .order("despatch_date", {
                ascending: false,
            })
            .limit(1);

    if (error) {
        throw Object.assign(
            new Error(
                `Son senkronizasyon tarihi alınamadı: ${error.message}`,
            ),
            {
                statusCode: 500,
            },
        );
    }

    const latestImportedDate =
        data?.[0]?.despatch_date;

    if (!latestImportedDate) {
        return {
            startDate: requestedStartDate,
            mode: "full",
            latestImportedDate: null,
        };
    }

    const incrementalStartDate =
        createStartDate(
            String(latestImportedDate).slice(0, 10),
        );

    incrementalStartDate.setUTCDate(
        incrementalStartDate.getUTCDate() -
        INCREMENTAL_OVERLAP_DAYS,
    );

    if (
        incrementalStartDate <
        requestedStartDate
    ) {
        return {
            startDate: requestedStartDate,
            mode: "incremental",
            latestImportedDate:
                String(latestImportedDate),
        };
    }

    return {
        startDate: incrementalStartDate,
        mode: "incremental",
        latestImportedDate:
            String(latestImportedDate),
    };
}

export async function legacySyncRoutes(
    app: FastifyInstance,
) {
    app.post("/", async (request, reply) => {
        const input =
            syncShipmentsBodySchema.parse(
                request.body,
            );

        const requestedStartDate =
            createStartDate(input.startDate);

        const requestedEndDate =
            createEndDate(input.endDate);

        if (
            requestedStartDate >
            requestedEndDate
        ) {
            throw Object.assign(
                new Error(
                    "Başlangıç tarihi bitiş tarihinden sonra olamaz.",
                ),
                {
                    statusCode: 400,
                },
            );
        }

        const syncPeriod = {
    startDate: requestedStartDate,
    mode: "full" as const,
    latestImportedDate: null,
};

        console.log(
            [
                `Senkronizasyon modu: ${syncPeriod.mode}`,
                `İstenen dönem: ${input.startDate} - ${input.endDate}`,
                `İşlenecek dönem: ${toIsoDate(
                    syncPeriod.startDate,
                )} - ${input.endDate}`,
            ].join("\n"),
        );

        const job = createLegacySyncJob({
            requestedStartDate: input.startDate,
            requestedEndDate: input.endDate,
        });

        void (async () => {
            try {
                updateLegacySyncJob(job.id, {
                    status: "running",
                    startedAt:
                        new Date().toISOString(),
                    mode: syncPeriod.mode,
                    effectiveStartDate:
                        toIsoDate(
                            syncPeriod.startDate,
                        ),
                    effectiveEndDate:
                        input.endDate,
                });

                const result =
                    await syncShipments({
                        startDate:
                            syncPeriod.startDate,
                        endDate:
                            requestedEndDate,
                    });

                updateLegacySyncJob(job.id, {
                    status: "completed",
                    completedAt:
                        new Date().toISOString(),
                    fetched: result.fetched,
                    upserted: result.upserted,
                });
            } catch (error) {
                updateLegacySyncJob(job.id, {
                    status: "failed",
                    completedAt:
                        new Date().toISOString(),
                    error:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });

                console.error(error);
            }
        })();

        return reply.code(202).send({
            success: true,
            data: {
                jobId: job.id,
                status: "started",
            },
            meta: {
                requestedStartDate:
                    input.startDate,
                requestedEndDate:
                    input.endDate,
                effectiveStartDate:
                    toIsoDate(
                        syncPeriod.startDate,
                    ),
                effectiveEndDate:
                    input.endDate,
                latestImportedDate:
                    syncPeriod.latestImportedDate,
                overlapDays:
                    INCREMENTAL_OVERLAP_DAYS,
                startedAt:
                    new Date().toISOString(),
            },
        });
    });

    app.get("/:jobId", async (request, reply) => {
        const { jobId } = request.params as {
            jobId: string;
        };

        const job = getLegacySyncJob(jobId);

        if (!job) {
            return reply.code(404).send({
                success: false,
                error: "Senkronizasyon görevi bulunamadı.",
            });
        }

        return reply.send({
            success: true,
            data: job,
        });
    });
}





