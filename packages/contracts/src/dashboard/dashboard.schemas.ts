import { z } from "zod";

export const DashboardQuerySchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
});

export type DashboardQuery = z.infer<
    typeof DashboardQuerySchema
>;

export const DashboardMetricSchema = z.object({
    key: z.string(),
    label: z.string(),
    value: z.number(),
    formattedValue: z.string(),
    previousValue: z.number().nullable(),
    changeRate: z.number().nullable(),
});

export type DashboardMetric = z.infer<
    typeof DashboardMetricSchema
>;

export const DashboardProjectRowSchema = z.object({
    projectId: z.string(),
    projectName: z.string(),
    realProjectName: z.string().nullable(),
    shipmentCount: z.number(),
    revenue: z.number(),
    expense: z.number(),
    profit: z.number(),
    profitRate: z.number(),
});

export type DashboardProjectRow = z.infer<
    typeof DashboardProjectRowSchema
>;

export const DashboardDetailRowSchema = z.record(
    z.string(),
    z.unknown(),
);

export type DashboardDetailRow = z.infer<
    typeof DashboardDetailRowSchema
>;

export const DashboardProjectDetailSchema = z.object({
    projectId: z.string(),
    projectName: z.string(),
    realProjectName: z.string().nullable(),
    rows: z.array(DashboardDetailRowSchema),
});

export type DashboardProjectDetail = z.infer<
    typeof DashboardProjectDetailSchema
>;

export const DashboardResponseSchema = z.object({
    period: z.object({
        startDate: z.string(),
        endDate: z.string(),
    }),
    metrics: z.array(DashboardMetricSchema),
    management: z.object({
        bestProjectName: z.string().nullable(),
        bestProjectProfit: z.number(),
        averageProfitRate: z.number(),
        riskProjectCount: z.number(),
    }),
    projects: z.array(DashboardProjectRowSchema),
    system: z.object({
        api: z.enum([
            "online",
            "offline",
            "degraded",
        ]),
        database: z.enum([
            "online",
            "offline",
            "degraded",
        ]),
        generatedAt: z.string(),
    }),
});

export type DashboardResponse = z.infer<
    typeof DashboardResponseSchema
>;

export const DashboardProjectDetailResponseSchema =
    z.object({
        period: z.object({
            startDate: z.string(),
            endDate: z.string(),
        }),
        project: DashboardProjectDetailSchema,
        system: z.object({
            api: z.enum([
                "online",
                "offline",
                "degraded",
            ]),
            database: z.enum([
                "online",
                "offline",
                "degraded",
            ]),
            generatedAt: z.string(),
        }),
    });

export type DashboardProjectDetailResponse = z.infer<
    typeof DashboardProjectDetailResponseSchema
>;

