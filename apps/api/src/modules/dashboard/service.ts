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
    v2ProjectId?: number;
};

type DashboardAggregateRow = {
    project_name: string | null;
    shipment_count: number | string | null;
    revenue: number | string | null;
    expense: number | string | null;
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
        .replace(/Ä±/g, "i")
        .replace(/ÅŸ/g, "s")
        .replace(/ÄŸ/g, "g")
        .replace(/Ã¼/g, "u")
        .replace(/Ã¶/g, "o")
        .replace(/Ã§/g, "c")
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
                "LEGACY_KEYS",
                Object.keys(items[0] ?? {})
            );

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
    const rows: Record<string, unknown>[] = [];

    const pageSize = 1000;
    let from = 0;

    while (true) {
        const to = from + pageSize - 1;

        const { data, error } =
            await supabaseAdmin
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
                .order("id", {
                    ascending: true,
                })
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

        const pageRows = data ?? [];

        rows.push(...pageRows);

        console.log("SHIPMENT IMPORT PAGE", {
            from,
            to,
            received: pageRows.length,
            total: rows.length,
        });

        if (pageRows.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    console.log("SHIPMENT IMPORT TOTAL", {
        count: rows.length,
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
    });

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

        const purchaseIncome = parseNumber(
            row.purchase_invoice_income ??
            row.PurchaseInvoiceIncome,
        );

        const salesIncome = parseNumber(
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

async function fetchImportedProjectRows(
    startDate: Date,
    endDate: Date,
    projectName: string,
): Promise<NormalizedRow[]> {
    const rows: Record<string, unknown>[] = [];
    const pageSize = 500;
    let from = 0;

    while (true) {
        const to = from + pageSize - 1;

        const { data, error } =
            await supabaseAdmin
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
                .eq(
                    "project_name",
                    projectName,
                )
                .order("id", {
                    ascending: true,
                })
                .range(from, to);

        if (error) {
            throw Object.assign(
                new Error(
                    `Proje kayıtları alınamadı: ${error.message}`,
                ),
                {
                    statusCode: 500,
                },
            );
        }

        const pageRows = data ?? [];

        rows.push(...pageRows);

        if (pageRows.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return rows.map((row, index) => {
        const id = String(
            row.legacy_shipment_id ??
            row.legacy_income_expense_id ??
            row.id ??
            `row-${index}`,
        );

        const normalizedProjectName = String(
            row.project_name ??
            row.ProjectName ??
            "PROJESİZ",
        );

        const plateNumber = String(
            row.plate_number ??
            row.PlateNumber ??
            "-",
        );

        const purchaseIncome = parseNumber(
            row.purchase_invoice_income ??
            row.PurchaseInvoiceIncome,
        );

        const salesIncome = parseNumber(
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

            ProjectName:
                rawSource.ProjectName ??
                normalizedProjectName,

            PlateNumber:
                rawSource.PlateNumber ??
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
            projectName: normalizedProjectName,
            plateNumber,
            purchaseIncome,
            salesIncome,
            raw,
        };
    });
}

async function fetchDashboardAggregates(
    startDate: Date,
    endDate: Date,
): Promise<DashboardAggregateRow[]> {
    console.time("dashboard-rpc");

    const { data, error } = await supabaseAdmin.rpc(
        "get_dashboard_project_summary",
        {
            p_start_date: toIsoDate(startDate),
            p_end_date: toIsoDate(endDate),
        },
    );

    console.timeEnd("dashboard-rpc");

    if (error) {
        console.error("DASHBOARD_RPC_ERROR", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw Object.assign(
            new Error(
                `Dashboard özeti alınamadı: ${error.message}`,
            ),
            {
                statusCode: 500,
            },
        );
    }

    return (data ?? []) as DashboardAggregateRow[];
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

async function getMuhasebeExpenseMap(
    startDate: Date,
    endDate: Date,
) {

    const yil =
        Number(endDate.toISOString().slice(0, 4));

    const ay =
        Number(endDate.toISOString().slice(5, 7));


    const { data: dagitimlar, error: dagitimError } =
        await supabaseAdmin
            .from("muhasebe_kayit_proje_dagilimlari")
            .select(`
                muhasebe_kayit_id,
                project_id,
                tutar
            `);

    if (dagitimError) {
        throw new Error(dagitimError.message);
    }


    const kayitIds =
        [
            ...new Set(
                (dagitimlar ?? [])
                    .map(x => x.muhasebe_kayit_id)
            )
        ];


    const { data: kayitlar, error: kayitError } =
        await supabaseAdmin
            .from("muhasebe_kayitlari")
            .select(`
                id,
                donem_ay,
                donem_yil
            `)
            .in("id", kayitIds);

    if (kayitError) {
        throw new Error(kayitError.message);
    }


    const { data: projects } =
        await supabaseAdmin
            .from("v2_projects")
            .select(`
                id,
                display_name
            `);


    const { data: masterProjects } =
        await supabaseAdmin
            .from("projeler")
            .select(`
                id,
                proje_adi,
                reel_proje_adi
            `);


    const masterMap =
        new Map<string, string | number>();

    for (const project of masterProjects ?? []) {

        if (project.reel_proje_adi) {
            masterMap.set(
                normalizeText(project.reel_proje_adi),
                project.id
            );
        }

        if (project.proje_adi) {
            masterMap.set(
                normalizeText(project.proje_adi),
                project.id
            );
        }
    }


    const result =
        new Map<string, number>();


    for (const row of dagitimlar ?? []) {

        const kayit =
            kayitlar?.find(
                x => x.id === row.muhasebe_kayit_id
            );


        if (!kayit) {
            continue;
        }


        if (
            Number(kayit.donem_ay) !== ay ||
            Number(kayit.donem_yil) !== yil
        ) {
            continue;
        }


        const v2Project =
            (projects ?? [])
                .find(
                    x => String(x.id) === String(row.project_id)
                );


        if (!v2Project?.display_name) {
            continue;
        }


        const projectId =
            masterMap.get(
                normalizeText(v2Project.display_name)
            );


        if (!projectId) {
            console.log(
                "MUHASEBE PROJECT MATCH YOK V5",
                {
                    v2ProjectId: row.project_id,
                    name: v2Project.display_name
                }
            );
            continue;
        }


        const key = String(projectId);


        result.set(
            key,
            (
                result.get(key) ?? 0
            )
            +
            Number(row.tutar ?? 0)
        );
    }


    console.log(
        "MUHASEBE FINAL MAP DEBUG V5",
        {
            size: result.size,
            first:
                Array.from(
                    result.entries()
                ).slice(0, 5)
        }
    );


    return result;

}

function findProjectMaster(
    projectName: string,
    projectMasters: ProjectMaster[],
) {
    const normalized =
        normalizeText(projectName);

    const exact =
        projectMasters.find(
            (project) =>
                normalizeText(
                    project.reel_proje_adi ??
                    project.proje_adi,
                ) === normalized,
        );

    if (exact) {
        return exact;
    }

    const contains =
        projectMasters.find(
            (project) => {
                const masterName =
                    normalizeText(
                        project.reel_proje_adi ??
                        project.proje_adi,
                    );

                return (
                    normalized.includes(masterName) ||
                    masterName.includes(normalized)
                );
            },
        );

    if (contains) {
        return contains;
    }

    const words =
        normalized
            .split(" ")
            .filter(Boolean);

    return projectMasters.find(
        (project) => {
            const masterName =
                normalizeText(
                    project.reel_proje_adi ??
                    project.proje_adi,
                );

            const matched =
                words.filter((word) =>
                    masterName.includes(word),
                ).length;

            return matched >= 2;
        },
    );
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

        const master =
            findProjectMaster(
                row.projectName,
                projectMasters,
            );

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

function mapDashboardAggregatesToProjects(
    aggregateRows: DashboardAggregateRow[],
    projectMasters: ProjectMaster[],
    muhasebeExpenseMap: Map<string, number>,
    ikExpenseMap: Map<string, number>,
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

    return aggregateRows
        .map((row): DashboardProjectRow | null => {
            const sourceProjectName =
                row.project_name?.trim() ||
                "PROJESİZ";

            const key = normalizeText(
                sourceProjectName,
            );

            const master =
                findProjectMaster(
                    sourceProjectName,
                    projectMasters,
                );

            if (!master) {
                console.warn(
                    "Dashboard eşleşmeyen proje:",
                    sourceProjectName,
                );

                return null;
            }

            const shipmentCount = parseNumber(
                row.shipment_count,
            );

            const revenue = parseNumber(
                row.revenue,
            );

            const expense =
                parseNumber(row.expense)
                +
                Number(
                    muhasebeExpenseMap.get(
                        String(master.id)
                    ) ?? 0
                )
                +
                Number(
                    ikExpenseMap.get(
                        String(master.id)
                    ) ?? 0
                );
            console.log("PROJECT EXPENSE DEBUG", {
                projectId: master.id,
                baseExpense: row.expense,
                muhasebe:
                    muhasebeExpenseMap.get(
                        String(master.id)
                    ),
                ik:
                    ikExpenseMap.get(
                        String(master.id)
                    ),
                finalExpense: expense
            });
            const profit = revenue - expense;

            const profitRate =
                revenue === 0
                    ? 0
                    : (profit / revenue) * 100;

            return {
                projectId: String(master.id),
                projectName:
                    master.proje_adi ??
                    sourceProjectName,
                realProjectName:
                    master.reel_proje_adi,
                shipmentCount,
                revenue,
                expense,
                profit,
                profitRate,
            };
        })
        .filter(
            (
                project,
            ): project is DashboardProjectRow =>
                project !== null,
        )
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

const masterProjectName =
    projectMaster.reel_proje_adi ??
    projectMaster.proje_adi ??
    "";

if (!masterProjectName) {
    throw Object.assign(
        new Error("Projenin Reel adı bulunamadı."),
        {
            statusCode: 400,
        },
    );
}

const rows =
    await fetchImportedProjectRows(
        normalizedStartDate,
        normalizedEndDate,
        masterProjectName,
    );

return {
    projectId: String(projectMaster.id),
    projectName:
        projectMaster.proje_adi ??
        masterProjectName,
    realProjectName:
        projectMaster.reel_proje_adi,
    rows: rows.map((row) => row.raw),
};
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
        "Dashboard 1/5: KayÄ±tlar ve proje tanÄ±mlarÄ± okunuyor...",
    );

    const [
        aggregateRows,
        projectMasters,
        muhasebeExpenseMap,
        ikExpenseMap
    ] = await Promise.all([

        fetchDashboardAggregates(
            startDate,
            endDate,
        ),

        getProjectMasters(),

        getMuhasebeExpenseMap(
            startDate,
            endDate
        ),

        getIkExpenseMap(
            startDate,
            endDate
        ),
    ]);
    console.log(
        `Dashboard 1/5 tamamlandÄ±: ${aggregateRows.length} proje Ã¶zeti, ${projectMasters.length} proje tanÄ±mÄ±`,
    );

    console.log(
        "Dashboard 2/5: Projeler gruplanÄ±yor...",
    );

    const projects =
        mapDashboardAggregatesToProjects(
            aggregateRows,
            projectMasters,
            muhasebeExpenseMap,
            ikExpenseMap,
        )
    console.log(
        `Dashboard 2/5 tamamlandÄ±: ${projects.length} eÅŸleÅŸen proje`,
    );

    console.log(
        "Dashboard 3/5: Dashboard Ã¶zeti hazÄ±rlanÄ±yor...",
    );

    console.log(
        "Dashboard 4/5: Finansal toplamlar hesaplanÄ±yor...",
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

    const bestProject =
        [...projects].sort(
            (a, b) => b.profit - a.profit,
        )[0] ?? null;

    const averageProfitRate =
        projects.length === 0
            ? 0
            : projects.reduce(
                (sum, project) =>
                    sum + project.profitRate,
                0,
            ) / projects.length;

    const riskProjectCount =
        projects.filter(
            (project) =>
                project.profitRate < 5,
        ).length;

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
        management: {
            bestProjectName:
                bestProject?.projectName ?? null,
            bestProjectProfit:
                bestProject?.profit ?? 0,
            averageProfitRate,
            riskProjectCount,
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
            {
                key: "profitRate",
                label: "Kâr Marjı",
                value: profitRate,
                formattedValue:
                    `${profitRate.toFixed(2)}%`,
                previousValue: null,
                changeRate: null,
            },
            {
                key: "projects",
                label: "Aktif Proje",
                value: projects.length,
                formattedValue: formatNumber(
                    projects.length,
                ),
                previousValue: null,
                changeRate: null,
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
        `Dashboard 5/5 tamamlandÄ±: ${projects.length} proje, ${totals.shipmentCount} sefer`,
    );

    console.timeEnd("dashboard-total");

    return value;
}











export async function getDashboardSourceSummary() {

    const {
        data: ikKayitlari,
        error: ikError
    } =
        await supabaseAdmin
            .from("ik_kayitlari")
            .select(`
        id,
        isveren_maliyeti
    `);


    if (ikError) {

        throw new Error(
            ikError.message
        );

    }



    const {
        data: dagitimlar,
        error: dagitimError
    } =
        await supabaseAdmin
            .from("ik_proje_dagilimlari")
            .select(`
        ik_kayit_id
    `);




    if (dagitimError) {

        throw new Error(
            dagitimError.message
        );

    }



    const toplamPersonel =
        ikKayitlari?.length ?? 0;


    const toplamMaliyet =
        (ikKayitlari ?? [])
            .reduce(
                (sum, row) =>
                    sum + Number(row.isveren_maliyeti ?? 0),
                0
            );


    const dagitilan =
        new Set(
            (dagitimlar ?? [])
                .map(
                    x => x.ik_kayit_id
                )
        ).size;



    return {

        ik: {
            personelSayisi:
                toplamPersonel,

            toplamMaliyet,

            dagitilan,

            bekleyen:
                toplamPersonel - dagitilan
        },


        muhasebe: {

            toplamGider: 0,

            bekleyen: 0

        }

    };

}


async function getIkExpenseMap(
    startDate: Date,
    endDate: Date,
): Promise<Map<string, number>> {


    const yil =
        Number(
            endDate.toISOString().slice(0, 4)
        );


    const ay =
        Number(
            endDate.toISOString().slice(5, 7)
        );


    const {
        data,
        error
    } =
        await supabaseAdmin
            .from("ik_proje_dagilimlari")
            .select(`
                tutar,
                project_id,

                ik_kayitlari(
                    donem_ay,
                    donem_yil
                )
            `);



    if (error) {

        throw new Error(
            error.message
        );

    }



    const {
        data: projects
    } =
        await supabaseAdmin
            .from("v2_projects")
            .select(`
                id,
                display_name
            `);



    const {
        data: masterProjects
    } =
        await supabaseAdmin
            .from("projeler")
            .select(`
                id,
                proje_adi,
                reel_proje_adi
            `);



    const masterMap = new Map<string, string | number>();

    for (const project of masterProjects ?? []) {
        if (project.reel_proje_adi) {
            masterMap.set(normalizeText(project.reel_proje_adi), project.id);
        }

        if (project.proje_adi) {
            masterMap.set(normalizeText(project.proje_adi), project.id);
        }
    }



    const map =
        new Map<string, number>();



    for (const x of data ?? []) {


        const kayit =
            Array.isArray(x.ik_kayitlari)
                ? x.ik_kayitlari[0]
                : x.ik_kayitlari;



        if (
            !kayit ||
            Number(kayit.donem_ay) !== ay ||
            Number(kayit.donem_yil) !== yil
        ) {
            continue;
        }



        const v2Project =
            (projects ?? [])
                .find(
                    p =>
                        String(p.id) === String(x.project_id)
                );



        if (!v2Project?.display_name) {
            continue;
        }



        const projectId =
            masterMap.get(
                normalizeText(
                    v2Project.display_name
                )
            );



        if (!projectId) {
            continue;
        }



        const key =
            String(projectId);



        map.set(
            key,
            (
                map.get(key) ?? 0
            )
            +
            Number(
                x.tutar ?? 0
            )
        );

    }



    return map;

}





export async function getDashboardProjectSourceDetail(
    projectId: number,
    startDate: Date,
    endDate: Date,
) {

    const { data: masterProject } =
        await supabaseAdmin
            .from("projeler")
            .select(`
                reel_proje_adi
            `)
            .eq(
                "id",
                projectId
            )
            .single();



    let v2ProjectId: number | null = null;



    if (masterProject?.reel_proje_adi) {


        const normalized =
            normalizeText(
                masterProject.reel_proje_adi
            );


        const {
            data: v2Projects
        } =
            await supabaseAdmin
                .from("v2_projects")
                .select(`
                id,
                display_name
            `);



        const matched =
            (v2Projects ?? [])
                .find(
                    (x: any) =>
                        normalizeText(
                            x.display_name
                        ) === normalized
                );


        if (matched) {

            v2ProjectId =
                matched.id;

        }

    }

    console.log(
        "SOURCE DETAIL PROJECT MATCH",
        {
            projectId,
            reel:
                masterProject?.reel_proje_adi,
            v2ProjectId
        }
    );


    if (!v2ProjectId) {

        return {
            ik: [],
            muhasebe: []
        };

    }



    const yil =
        Number(
            endDate.toISOString().slice(0, 4)
        );

    const ay =
        Number(
            endDate.toISOString().slice(5, 7)
        );



    /*
        IK DAÄILIMLARI
    */


    const {
        data: ikData,
        error: ikError
    } =
        await supabaseAdmin
            .from("ik_proje_dagilimlari")
            .select(`
            oran,
            tutar,
            project_id,

            ik_kayitlari(
                personel_adi,
                donem_ay,
                donem_yil
            )
        `)
            .eq(
                "project_id",
                v2ProjectId
            );



    if (ikError) {

        throw new Error(
            ikError.message
        );

    }

    console.log("IK RAW DATA", {
        count: ikData?.length,
        first: ikData?.[0],
        ay,
        yil
    });

    const ik =
        (ikData ?? [])
            .map(
                (x: any) => {

                    const kayit =
                        Array.isArray(x.ik_kayitlari)
                            ? x.ik_kayitlari[0]
                            : x.ik_kayitlari;


                    return {
                        kayit,
                        oran: Number(x.oran),
                        tutar: Number(x.tutar),
                    };

                }
            )
            .filter(
                (x: any) =>
                    x.kayit &&
                    Number(x.kayit.donem_ay) === Number(ay) &&
                    Number(x.kayit.donem_yil) === Number(yil)
            )
            .map(
                (x: any) => ({

                    personel:
                        x.kayit.personel_adi,

                    oran:
                        x.oran,

                    tutar:
                        x.tutar

                })
            );






    /*
        MUHASEBE DAÄILIMLARI
    */


    const {
        data: dagitimlar,
        error: dagitimError
    }
        =
        await supabaseAdmin
            .from(
                "muhasebe_kayit_proje_dagilimlari"
            )
            .select(`
    muhasebe_kayit_id,
    oran,
    tutar,
    project_id
`)
            .eq(
                "project_id",
                v2ProjectId
            );


    if (dagitimError) {

        throw new Error(
            dagitimError.message
        );

    }





    const kayitIds =
        [
            ...new Set(
                (dagitimlar ?? [])
                    .map(
                        x =>
                            x.muhasebe_kayit_id
                    )
            )
        ];





    const {
        data: kayitlar,
        error: kayitError
    }
        =
        await supabaseAdmin
            .from(
                "muhasebe_kayitlari"
            )
            .select(`
            id,
            hesap_adi,
            aciklama,
            tarih,
            borc,
            alacak,
            donem_ay,
            donem_yil
        `)
            .in(
                "id",
                kayitIds
            );



    if (kayitError) {

        throw new Error(
            kayitError.message
        );

    }


    console.log(
        "MUHASEBE DAGITIM DEBUG",
        {
            v2ProjectId,
            count: dagitimlar?.length,
            first: dagitimlar?.[0]
        }
    );

    console.log(
        "IK DAGITIM DEBUG",
        {
            v2ProjectId,
            count: ikData?.length,
            first: ikData?.[0]
        }
    );


    const muhasebeMap = new Map<string, any>();


    (dagitimlar ?? [])
        .map(
            (x: any) => {

                const kayit =
                    kayitlar?.find(
                        k =>
                            k.id === x.muhasebe_kayit_id
                    );


                return {
                    ...x,
                    kayit
                };

            }
        )
        .filter(
            x =>
                x.kayit &&
                Number(x.kayit.donem_ay) === Number(ay) &&
                Number(x.kayit.donem_yil) === Number(yil)
        )
        .forEach(
            (x: any) => {

                const key =
                    x.kayit.hesap_adi;

                const mevcut =
                    muhasebeMap.get(key);


                if (mevcut) {

                    mevcut.tutar += Number(x.tutar);
                    mevcut.oran += Number(x.oran);

                }
                else {

                    muhasebeMap.set(
                        key,
                        {
                            hesap:
                                x.kayit.hesap_adi,

                            aciklama:
                                "Toplam birle tirilmi  gider",
                            tarih:
                                x.kayit.tarih,

                            oran:
                                Number(x.oran),

                            tutar:
                                Number(x.tutar)

                        }
                    );

                }

            }
        );


    const muhasebe =
        Array.from(
            muhasebeMap.values()
        );


    const ikToplam =
        ik.reduce(
            (sum, item) =>
                sum + Number(item.tutar ?? 0),
            0
        );


    const muhasebeToplam =
        muhasebe.reduce(
            (sum, item) =>
                sum + Number(item.tutar ?? 0),
            0
        );



    /*
        REEL OPERASYON GEL R / G DER
    */

    /*
        REEL OPERASYON GELÄ°R / GÄ°DER V2
    */

    const {
        data: projectMaster,
        error: projectMasterError,
    } = await supabaseAdmin
        .from("projeler")
        .select(`
        id,
        proje_adi,
        reel_proje_adi
    `)
        .eq("id", projectId)
        .single();

    if (projectMasterError) {
        throw new Error(
            `Reel proje bilgisi alınamadı: ${projectMasterError.message}`,
        );
    }

    if (!projectMaster) {
        throw new Error("Reel proje eşleşmesi için proje bulunamadı.");
    }

    const masterProjectName =
    projectMaster.reel_proje_adi ??
    projectMaster.proje_adi ??
    "";

if (!masterProjectName) {
    throw new Error(
        "Reel kayıtları çekmek için proje adı bulunamadı.",
    );
}

const projectReelRows =
    await fetchImportedProjectRows(
        startDate,
        endDate,
        masterProjectName,
    );

console.log("REEL PROJECT ROWS", {
    projectId,
    projectName: masterProjectName,
    matched: projectReelRows.length,
    matchedProjects: [
        ...new Set(
            projectReelRows.map(
                (row) => row.projectName,
            ),
        ),
    ],
});

console.log(
    "REEL NUMERIC FIELD DEBUG",
    projectReelRows
        .filter((row) => row.raw?.Tipi === "Gider")
        .slice(0, 10)
        .map((row) => ({
            tipi: row.raw?.Tipi,

            serviceExpense:
                row.raw?.ServiceExpense,

            serviceExpenses:
                row.raw?.ServiceExpenses,

            serviceIncome:
                row.raw?.ServiceIncome,

            costExpenses:
                row.raw?.CostExpenses,

            costIncome:
                row.raw?.CostIncome,

            purchaseIncome:
                row.purchaseIncome,

            salesIncome:
                row.salesIncome,

            serviceExpenseName:
                row.raw?.ServiceExpenseName,

            subServiceName:
                row.raw?.SubServiceName,
        })),
);


    const getReelValue = (
        field: string,
    ) =>
        projectReelRows.reduce(
            (
                total,
                row,
            ) =>
                total +
                Number(
                    row.raw?.[field] ?? 0
                ),
            0,
        );


const reel = {

    gelir: {

        satis:
            projectReelRows
                .filter(
                    (row) =>
                        row.raw?.Tipi === "Gelir"
                )
                .reduce(
                    (sum, row) =>
                        sum +
                        Number(row.salesIncome ?? 0),
                    0
                ),


        alis:
            projectReelRows
                .filter(
                    (row) =>
                        row.raw?.Tipi === "Gider"
                )
                .reduce(
                    (sum, row) =>
                        sum +
                        Number(row.purchaseIncome ?? 0),
                    0
                ),
    },


    gider: {

        hizmet:
            projectReelRows
                .filter(
                    (row) =>
                        row.raw?.Tipi === "Gider"
                )
                .reduce(
                    (sum, row) =>
                        sum +
                        Number(
                            row.raw?.ServiceExpenses ?? 0
                        ),
                    0
                ),


        masraf:
            projectReelRows
                .filter(
                    (row) =>
                        row.raw?.Tipi === "Gider"
                )
                .reduce(
                    (sum, row) =>
                        sum +
                        Number(
                            row.raw?.CostExpenses ?? 0
                        ),
                    0
                ),

    },


    hizmetDetay:
        Object.entries(
            projectReelRows.reduce(
                (
                    acc: Record<
                        string,
                        {
                            satis: number;
                            alis: number;
                            hizmet: number;
                            masraf: number;
                        }
                    >,
                    row
                ) => {

                    const isim =
                        String(
                            row.raw?.ServiceExpenseName ??
                            row.raw?.SubServiceName ??
                            row.raw?.ServiceName ??
                            "Tanımsız"
                        );


                    if (!acc[isim]) {

                        acc[isim] = {
                            satis: 0,
                            alis: 0,
                            hizmet: 0,
                            masraf: 0
                        };

                    }


                    if (
                        row.raw?.Tipi === "Gelir"
                    ) {

                        acc[isim].satis +=
                            Number(
                                row.salesIncome ?? 0
                            );

                    }


                    if (
                        row.raw?.Tipi === "Gider"
                    ) {

                        acc[isim].alis +=
                            Number(
                                row.purchaseIncome ?? 0
                            );


                        acc[isim].hizmet +=
                            Number(
                                row.raw?.ServiceExpenses ?? 0
                            );


                        acc[isim].masraf +=
                            Number(
                                row.raw?.CostExpenses ?? 0
                            );

                    }


                    return acc;

                },
                {}
            )
        )
            .map(
                (
                    [
                        isim,
                        value
                    ]
                ) => ({

                    isim,


                    satis:
                        value.satis,


                    alis:
                        value.alis,


                    hizmet:
                        value.hizmet,


                    masraf:
                        value.masraf,


                    kar:
                        value.satis -
                        value.alis

                })
            ),


    toplamGelir:
        projectReelRows
            .filter(
                (row) =>
                    row.raw?.Tipi === "Gelir"
            )
            .reduce(
                (sum, row) =>
                    sum +
                    Number(row.salesIncome ?? 0),
                0
            ),


    toplamGider:
        projectReelRows
            .filter(
                (row) =>
                    row.raw?.Tipi === "Gider"
            )
            .reduce(
                (sum, row) =>
                    sum +
                    Number(row.purchaseIncome ?? 0),
                0
            ),


    kar:
        0

};


reel.kar =
    reel.toplamGelir -
    reel.toplamGider;

    return {

        ik,

        muhasebe,

        reel,

        toplamlar: {
            ik: ikToplam,
            muhasebe: muhasebeToplam,
            toplam:
                ikToplam + muhasebeToplam
        }

    };
}









