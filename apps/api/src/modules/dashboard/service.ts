import type {
    DashboardProjectRow,
    DashboardResponse,
} from "@dedsis/contracts";
import { env } from "../../config/env.js";
import { supabaseAdmin } from "../supabase/client.js";

type DashboardInput = {
    startDate: Date;
    endDate: Date;
};

type LegacyRow = Record<string, unknown>;

export type NormalizedRow = {
    id: string;
    projectName: string;
    plateNumber: string;
    purchaseIncome: number;
    salesIncome: number;
    raw: LegacyRow;
};

type ProjectMaster = {
    id: string | number;
    proje_adi: string | null;
    reel_proje_adi: string | null;
};

type CachedValue = {
    expiresAt: number;
    value: DashboardResponse;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_DATE_RANGE_DAYS = 93;
const cache = new Map<string, CachedValue>();

function parseNumber(value: unknown): number {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    let normalized = String(value).trim();

    if (
        normalized.includes(",") &&
        normalized.includes(".")
    ) {
        normalized = normalized
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (normalized.includes(",")) {
        normalized = normalized.replace(",", ".");
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: unknown): string {
    return String(value ?? "")
        .toLocaleLowerCase("tr-TR")
        .replace(/ı/g, "i")
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[_\s]+/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeLegacyRow(
    row: LegacyRow,
    index: number,
): NormalizedRow {
    return {
        id: String(
            row.id ??
            row.TMSDespatchesId ??
            `row-${index}`,
        ),
        projectName: String(
            row.ProjectName ?? "PROJESİZ",
        ),
        plateNumber: String(
            row.PlateNumber ?? "-",
        ),
        purchaseIncome: parseNumber(
            row.PurchaseInvoiceIncome,
        ),
        salesIncome: parseNumber(
            row.SalesInvoceIncome,
        ),
        raw: row,
    };
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 0,
    }).format(value);
}

function toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getDayCount(
    startDate: Date,
    endDate: Date,
): number {
    const difference =
        endDate.getTime() - startDate.getTime();

    return Math.floor(
        difference / (1000 * 60 * 60 * 24),
    ) + 1;
}

function splitIntoDays(
    startDate: Date,
    endDate: Date,
) {
    const days: Array<{
        startDate: string;
        endDate: string;
    }> = [];

    const cursor = new Date(startDate);

    while (cursor <= endDate) {
        const day = toIsoDate(cursor);

        days.push({
            startDate: `${day}T00:00:00`,
            endDate: `${day}T23:59:59`,
        });

        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return days;
}

function extractItems(value: unknown): LegacyRow[] {
    if (Array.isArray(value)) {
        return value as LegacyRow[];
    }

    if (
        value &&
        typeof value === "object"
    ) {
        const record = value as Record<
            string,
            unknown
        >;

        const candidates = [
            record.data,
            record.Data,
            record.result,
            record.items,
        ];

        const found = candidates.find(
            Array.isArray,
        );

        if (Array.isArray(found)) {
            return found as LegacyRow[];
        }
    }

    return [];
}

function sleep(milliseconds: number) {
    return new Promise((resolve) =>
        setTimeout(resolve, milliseconds),
    );
}

async function fetchDayWithRetry(
    startDate: string,
    endDate: string,
    attempt = 1,
): Promise<LegacyRow[]> {
    try {
        const response = await fetch(
            env.LEGACY_API_URL,
            {
                method: "POST",
                headers: {
                    authorization:
                        `Bearer ${env.LEGACY_API_TOKEN}`,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    userId: 1,
                }),
                signal: AbortSignal.timeout(120_000),
            },
        );

        if (!response.ok) {
            const retryable =
                response.status === 429 ||
                response.status >= 500;

            if (retryable && attempt < 4) {
                await sleep(attempt * 1_000);

                return fetchDayWithRetry(
                    startDate,
                    endDate,
                    attempt + 1,
                );
            }

            throw Object.assign(
                new Error(
                    `Harici servis hatası: ${response.status}`,
                ),
                {
                    statusCode: 502,
                },
            );
        }

        const json = await response.json();
        const items = extractItems(json);

        if (items.length > 0) {
            console.log(
                "LEGACY_SAMPLE_ROW",
                JSON.stringify(
                    items[0],
                    null,
                    2,
                ),
            );
        }

        return items;
    } catch (error) {
        const retryable =
            error instanceof Error &&
            (
                error.name === "TimeoutError" ||
                error.name === "AbortError" ||
                error.message.includes("fetch failed")
            );

        if (retryable && attempt < 4) {
            await sleep(attempt * 1_000);

            return fetchDayWithRetry(
                startDate,
                endDate,
                attempt + 1,
            );
        }

        throw error;
    }
}
async function fetchImportedRows(
    startDate: Date,
    endDate: Date,
): Promise<NormalizedRow[]> {
    const PAGE_SIZE = 1000;
    const rows: Record<string, unknown>[] = [];

    for (let from = 0; ; from += PAGE_SIZE) {
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabaseAdmin
            .from("shipment_imports")
            .select("*")
            .gte(
                "despatch_date",
                toIsoDate(startDate),
            )
            .lte(
                "despatch_date",
                toIsoDate(endDate),
            )
            .order(
                "legacy_income_expense_id",
                {
                    ascending: true,
                },
            )
            .range(from, to);

        if (error) {
            throw Object.assign(
                new Error(
                    `İçe aktarılan kayıtlar alınamadı: ${error.message}`,
                ),
                {
                    statusCode: 500,
                },
            );
        }

        const page = data ?? [];

        rows.push(...page);

        console.log(
            `Dashboard: ${page.length} kayıt alındı, toplam ${rows.length} kayıt okundu`,
        );

        if (page.length < PAGE_SIZE) {
            break;
        }
    }

    return rows.map((row, index) => {
        const id = String(
            row.legacy_shipment_id ??
            row.legacy_income_expense_id ??
            row.id ??
            `row-${index}`,
        );

        const projectName = String(
            row.project_name ??
            row.ProjectName ??
            "PROJESİZ",
        );

        const plateNumber = String(
            row.plate_number ??
            row.PlateNumber ??
            "-",
        );

        const purchaseIncome =
            parseNumber(
                row.purchase_invoice_income ??
                row.PurchaseInvoiceIncome,
            );

        const salesIncome =
            parseNumber(
                row.sales_invoice_income ??
                row.SalesInvoceIncome ??
                row.SalesInvoiceIncome,
            );

        const rawSource =
            row.raw &&
                typeof row.raw === "object" &&
                !Array.isArray(row.raw)
                ? (row.raw as LegacyRow)
                : {};

        const raw: LegacyRow = {
            ...row,
            ...rawSource,

            id,

            TMSDespatchesId:
                rawSource.TMSDespatchesId ??
                row.legacy_shipment_id ??
                row.legacy_income_expense_id ??
                row.id ??
                id,

            TripNo:
                rawSource.TripNo ??
                rawSource.SeferNo ??
                rawSource.DocumentNo ??
                row.trip_no ??
                row.sefer_no ??
                row.document_no ??
                row.despatch_document_no ??
                id,

            SeferNo:
                rawSource.SeferNo ??
                rawSource.TripNo ??
                rawSource.DocumentNo ??
                row.sefer_no ??
                row.trip_no ??
                row.document_no ??
                row.despatch_document_no ??
                id,

            DocumentNo:
                rawSource.DocumentNo ??
                rawSource.SeferNo ??
                rawSource.TripNo ??
                row.document_no ??
                row.despatch_document_no ??
                row.sefer_no ??
                row.trip_no ??
                id,

            ProjectName:
                rawSource.ProjectName ??
                projectName,

            PlateNumber:
                rawSource.PlateNumber ??
                row.plate_number ??
                plateNumber,

            SalesInvoceIncome:
                rawSource.SalesInvoceIncome ??
                rawSource.SalesInvoiceIncome ??
                salesIncome,

            SalesInvoiceIncome:
                rawSource.SalesInvoiceIncome ??
                rawSource.SalesInvoceIncome ??
                salesIncome,

            PurchaseInvoiceIncome:
                rawSource.PurchaseInvoiceIncome ??
                purchaseIncome,

            SupplierInvoiceAmount:
                rawSource.SupplierInvoiceAmount ??
                rawSource.PurchaseInvoiceIncome ??
                purchaseIncome,
        };

        return {
            id,
            projectName,
            plateNumber,
            purchaseIncome,
            salesIncome,
            raw,
        };
    });
}
export async function fetchLegacyRows(
    startDate: Date,
    endDate: Date,
): Promise<NormalizedRow[]> {
    const days = splitIntoDays(
        startDate,
        endDate,
    );

    const results: NormalizedRow[] = [];

    for (const day of days) {
        const rows = await fetchDayWithRetry(
            day.startDate,
            day.endDate,
        );

        results.push(
            ...rows.map(normalizeLegacyRow),
        );
    }

    return results;
}


async function getProjectMasters(): Promise<
    ProjectMaster[]
> {
    const { data, error } = await supabaseAdmin
        .from("projeler")
        .select("id, proje_adi, reel_proje_adi")
        .order("proje_adi");

    if (error) {
        throw Object.assign(
            new Error(
                `Projeler alınamadı: ${error.message}`,
            ),
            {
                statusCode: 500,
            },
        );
    }

    return (data ?? []) as ProjectMaster[];
}

function aggregateProjects(
    rows: NormalizedRow[],
    projectMasters: ProjectMaster[],
): DashboardProjectRow[] {
    const masterMap = new Map(
        projectMasters.map((project) => [
            normalizeText(
                project.reel_proje_adi ??
                project.proje_adi,
            ),
            project,
        ]),
    );

    const grouped = new Map<
        string,
        {
            projectName: string;
            shipmentIds: Set<string>;
            revenue: number;
            expense: number;
        }
    >();

    for (const row of rows) {
        const key = normalizeText(row.projectName);
        const master = masterMap.get(key);

        if (!master) {
            console.warn(
                "Dashboard eşleşmeyen proje:",
                row.projectName,
            );

            continue;
        }
        const group = grouped.get(key) ?? {
            projectName:
                master.proje_adi ??
                row.projectName,
            shipmentIds: new Set<string>(),
            revenue: 0,
            expense: 0,
        };

        group.shipmentIds.add(row.id);
        group.revenue += row.salesIncome;
        group.expense += row.purchaseIncome;

        grouped.set(key, group);
    }

    return Array.from(grouped.entries())
        .map(([key, group]) => {
            const master = masterMap.get(key)!;
            const profit =
                group.revenue - group.expense;

            const profitRate =
                group.revenue === 0
                    ? 0
                    : (profit / group.revenue) * 100;

            return {
                projectId: String(master.id),
                projectName:
                    master.proje_adi ??
                    group.projectName,
                realProjectName:
                    master.reel_proje_adi,
                shipmentCount:
                    group.shipmentIds.size,
                revenue: group.revenue,
                expense: group.expense,
                profit,
                profitRate,
            };
        })
        .sort(
            (left, right) =>
                right.profit - left.profit,
        );
}

function createProjectDetails(
    rows: NormalizedRow[],
    projectMasters: ProjectMaster[],
) {
    const masterMap = new Map(
        projectMasters.map((project) => [
            normalizeText(
                project.reel_proje_adi ??
                project.proje_adi,
            ),
            project,
        ]),
    );

    const grouped = new Map<
        string,
        LegacyRow[]
    >();

    for (const row of rows) {
        const key = normalizeText(
            row.projectName,
        );

        const master = masterMap.get(key);

        if (!master) {
            continue;
        }

        const detailRows =
            grouped.get(key) ?? [];

        detailRows.push(row.raw);
        grouped.set(key, detailRows);
    }

    return Array.from(
        grouped.entries(),
    ).map(([key, detailRows]) => {
        const master = masterMap.get(key)!;

        const firstRow = detailRows[0];

        return {
            projectId: String(master.id),
            projectName:
                master.proje_adi ??
                String(
                    firstRow?.ProjectName ??
                    "PROJESİZ",
                ),
            realProjectName:
                master.reel_proje_adi,
            rows: detailRows,
        };
    });
}

export async function getProjectDetail(
    projectId: string,
    startDate: Date,
    endDate: Date,
) {
    const normalizedStartDate =
        new Date(startDate);
    const normalizedEndDate =
        new Date(endDate);

    normalizedStartDate.setUTCHours(
        0,
        0,
        0,
        0,
    );
    normalizedEndDate.setUTCHours(
        23,
        59,
        59,
        999,
    );

    if (
        normalizedStartDate >
        normalizedEndDate
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

    const dayCount = getDayCount(
        normalizedStartDate,
        normalizedEndDate,
    );

    if (dayCount > MAX_DATE_RANGE_DAYS) {
        throw Object.assign(
            new Error(
                `En fazla ${MAX_DATE_RANGE_DAYS} günlük tarih aralığı seçilebilir.`,
            ),
            {
                statusCode: 400,
            },
        );
    }

    const projectMasters =
        await getProjectMasters();

    const projectMaster =
        projectMasters.find(
            (project) =>
                String(project.id) === projectId,
        );

    if (!projectMaster) {
        throw Object.assign(
            new Error("Proje bulunamadı."),
            {
                statusCode: 404,
            },
        );
    }

    const rows = await fetchImportedRows(
        normalizedStartDate,
        normalizedEndDate,
    );

    const projectDetails =
        createProjectDetails(
            rows,
            projectMasters,
        );

    return (
        projectDetails.find(
            (detail) =>
                detail.projectId === projectId,
        ) ?? {
            projectId: String(projectMaster.id),
            projectName:
                projectMaster.proje_adi ??
                "PROJESİZ",
            realProjectName:
                projectMaster.reel_proje_adi,
            rows: [],
        }
    );
}

export async function getDashboard(
    input: DashboardInput,
): Promise<DashboardResponse> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);

    if (startDate > endDate) {
        throw Object.assign(
            new Error(
                "Başlangıç tarihi bitiş tarihinden sonra olamaz.",
            ),
            {
                statusCode: 400,
            },
        );
    }

    const dayCount = getDayCount(
        startDate,
        endDate,
    );

    if (dayCount > MAX_DATE_RANGE_DAYS) {
        throw Object.assign(
            new Error(
                `En fazla ${MAX_DATE_RANGE_DAYS} günlük tarih aralığı seçilebilir.`,
            ),
            {
                statusCode: 400,
            },
        );
    }

    const cacheKey = [
        toIsoDate(startDate),
        toIsoDate(endDate),
    ].join(":");

    const cached = cache.get(cacheKey);

    if (
        cached &&
        cached.expiresAt > Date.now()
    ) {
        return cached.value;
    }

    console.time("dashboard-total");

    console.log(
        "Dashboard 1/5: Kayıtlar ve proje tanımları okunuyor...",
    );

    const [
        rows,
        projectMasters,
    ] = await Promise.all([
        fetchImportedRows(startDate, endDate),
        getProjectMasters(),
    ]);

    console.log(
        `Dashboard 1/5 tamamlandı: ${rows.length} kayıt, ${projectMasters.length} proje tanımı`,
    );

    console.log(
        "Dashboard 2/5: Projeler gruplanıyor...",
    );

    const projects = aggregateProjects(
        rows,
        projectMasters,
    );

    console.log(
        `Dashboard 2/5 tamamlandı: ${projects.length} eşleşen proje`,
    );

    console.log(
        "Dashboard 3/5: Dashboard özeti hazırlanıyor...",
    );

    console.log(
        "Dashboard 4/5: Finansal toplamlar hesaplanıyor...",
    );
    const totals = projects.reduce(
        (result, project) => ({
            shipmentCount:
                result.shipmentCount +
                project.shipmentCount,
            revenue:
                result.revenue + project.revenue,
            expense:
                result.expense + project.expense,
            profit:
                result.profit + project.profit,
        }),
        {
            shipmentCount: 0,
            revenue: 0,
            expense: 0,
            profit: 0,
        },
    );

    const profitRate =
        totals.revenue === 0
            ? 0
            : (
                totals.profit /
                totals.revenue
            ) * 100;

    const value: DashboardResponse = {
        period: {
            startDate: toIsoDate(startDate),
            endDate: toIsoDate(endDate),
        },
        metrics: [
            {
                key: "shipments",
                label: "Toplam Sefer",
                value: totals.shipmentCount,
                formattedValue: formatNumber(
                    totals.shipmentCount,
                ),
                previousValue: null,
                changeRate: null,
            },
            {
                key: "revenue",
                label: "Toplam Gelir",
                value: totals.revenue,
                formattedValue: formatCurrency(
                    totals.revenue,
                ),
                previousValue: null,
                changeRate: null,
            },
            {
                key: "expense",
                label: "Toplam Gider",
                value: totals.expense,
                formattedValue: formatCurrency(
                    totals.expense,
                ),
                previousValue: null,
                changeRate: null,
            },
            {
                key: "profit",
                label: "Toplam Kâr",
                value: totals.profit,
                formattedValue: formatCurrency(
                    totals.profit,
                ),
                previousValue: null,
                changeRate: profitRate,
            },
        ],
        projects,
        system: {
            api: "online",
            database: "online",
            generatedAt: new Date().toISOString(),
        },
    };

    cache.set(cacheKey, {
        expiresAt:
            Date.now() + CACHE_TTL_MS,
        value,
    });

    console.log(
        `Dashboard 5/5 tamamlandı: ${projects.length} proje, ${totals.shipmentCount} sefer`,
    );

    console.timeEnd("dashboard-total");

    return value;
}
