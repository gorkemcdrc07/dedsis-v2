import { randomUUID } from "node:crypto";

export type LegacySyncJobStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed";

export type LegacySyncJob = {
    id: string;
    status: LegacySyncJobStatus;

    requestedStartDate: string;
    requestedEndDate: string;

    effectiveStartDate: string | null;
    effectiveEndDate: string | null;

    mode: "full" | "incremental" | null;

    fetched: number;
    upserted: number;

    error: string | null;

    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
};

const jobs = new Map<
    string,
    LegacySyncJob
>();

export function createLegacySyncJob(input: {
    requestedStartDate: string;
    requestedEndDate: string;
}): LegacySyncJob {
    const job: LegacySyncJob = {
        id: randomUUID(),
        status: "pending",

        requestedStartDate:
            input.requestedStartDate,

        requestedEndDate:
            input.requestedEndDate,

        effectiveStartDate: null,
        effectiveEndDate: null,

        mode: null,

        fetched: 0,
        upserted: 0,

        error: null,

        createdAt:
            new Date().toISOString(),

        startedAt: null,
        completedAt: null,
    };

    jobs.set(job.id, job);

    return job;
}

export function getLegacySyncJob(
    jobId: string,
): LegacySyncJob | null {
    return jobs.get(jobId) ?? null;
}

export function updateLegacySyncJob(
    jobId: string,
    updates: Partial<
        Omit<LegacySyncJob, "id" | "createdAt">
    >,
): LegacySyncJob {
    const current = jobs.get(jobId);

    if (!current) {
        throw new Error(
            `Senkronizasyon görevi bulunamadı: ${jobId}`,
        );
    }

    const updated: LegacySyncJob = {
        ...current,
        ...updates,
    };

    jobs.set(jobId, updated);

    return updated;
}
