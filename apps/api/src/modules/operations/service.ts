import type { LegacyDataQuery } from "@dedsis/contracts";
import { supabaseAdmin } from "../supabase/client.js";

type OperationSummaryRow = {
    sales_invoice_income: number | string | null;
    purchase_invoice_income: number | string | null;
};
type ShipmentImportRow = {
    id: string | number;
    legacy_shipment_id: string | number;
    legacy_income_expense_id: string | number | null;
    document_no: string | null;
    despatch_date: string | null;
    project_name: string | null;
    supplier_name: string | null;
    customer_name: string | null;
    plate_number: string | null;
    vehicle_working_type: string | null;
    vehicle_master_group: string | null;
    special_group: string | null;
    service_income: number | string | null;
    purchase_invoice_income: number | string | null;
    sales_invoice_income: number | string | null;
    raw: Record<string, unknown> | null;
    synced_at: string;
    updated_at: string;
};

const MAX_DATE_RANGE_DAYS = 93;

function toDateOnly(value: string): string {
    return new Date(value).toISOString().slice(0, 10);
}

function getDayCount(
    startDate: Date,
    endDate: Date,
): number {
    return (
        Math.floor(
            (endDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24),
        ) + 1
    );
}

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

function applyOperationFilters(
    query: any,
    input: LegacyDataQuery,
) {
    if (input.filters?.projectName) {
        query = query.ilike(
            "project_name",
            "%" + input.filters.projectName + "%",
        );
    }

    if (input.filters?.plateNumber) {
        query = query.ilike(
            "plate_number",
            "%" + input.filters.plateNumber + "%",
        );
    }

    if (input.filters?.documentNo) {
        query = query.ilike(
            "document_no",
            "%" + input.filters.documentNo + "%",
        );
    }

    if (input.filters?.customerName) {
        query = query.ilike(
            "customer_name",
            "%" + input.filters.customerName + "%",
        );
    }

    if (input.filters?.supplierName) {
        query = query.ilike(
            "supplier_name",
            "%" + input.filters.supplierName + "%",
        );
    }

    return query;
}
function mapOperationRow(
    row: ShipmentImportRow,
): Record<string, unknown> {
    const raw =
        row.raw &&
        typeof row.raw === "object" &&
        !Array.isArray(row.raw)
            ? row.raw
            : {};

    return {
        ...raw,

        id: row.id,

        TMSDespatchesId:
            raw.TMSDespatchesId ??
            row.legacy_shipment_id,

        TMSDespatchIncomeExpenseId:
            raw.TMSDespatchIncomeExpenseId ??
            row.legacy_income_expense_id,

        TMSDespatchesDocumentNo:
            raw.TMSDespatchesDocumentNo ??
            raw.DocumentNo ??
            row.document_no,

        TMSDespatchesDespatchDate:
            raw.TMSDespatchesDespatchDate ??
            raw.DespatchDate ??
            row.despatch_date,

        ProjectName:
            raw.ProjectName ??
            row.project_name,

        SupplierName:
            raw.SupplierName ??
            row.supplier_name,

        CurrentAccountsName:
            raw.CurrentAccountsName ??
            row.customer_name,

        PlateNumber:
            raw.PlateNumber ??
            row.plate_number,

        VehicleWorkingTypeName:
            raw.VehicleWorkingTypeName ??
            row.vehicle_working_type,

        VehicleMasterGroupName:
            raw.VehicleMasterGroupName ??
            row.vehicle_master_group,

        SpecialGroupName:
            raw.SpecialGroupName ??
            row.special_group,

        ServiceIncome:
            parseNumber(
                raw.ServiceIncome ??
                row.service_income,
            ),

        SalesInvoceIncome:
            parseNumber(
                raw.SalesInvoceIncome ??
                raw.SalesInvoiceIncome ??
                row.sales_invoice_income,
            ),

        SalesInvoiceIncome:
            parseNumber(
                raw.SalesInvoiceIncome ??
                raw.SalesInvoceIncome ??
                row.sales_invoice_income,
            ),

        PurchaseInvoiceIncome:
            parseNumber(
                raw.PurchaseInvoiceIncome ??
                row.purchase_invoice_income,
            ),

        syncedAt: row.synced_at,
        updatedAt: row.updated_at,
    };
}

export async function getOperations(
    input: LegacyDataQuery,
) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
    ) {
        throw Object.assign(
            new Error("Geçersiz tarih bilgisi."),
            {
                statusCode: 400,
            },
        );
    }

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

    const from =
        (input.page - 1) * input.pageSize;

    const to =
        from + input.pageSize - 1;

    let query = supabaseAdmin
        .from("shipment_imports")
        .select(
            [
                "id",
                "legacy_shipment_id",
                "legacy_income_expense_id",
                "document_no",
                "despatch_date",
                "project_name",
                "supplier_name",
                "customer_name",
                "plate_number",
                "vehicle_working_type",
                "vehicle_master_group",
                "special_group",
                "service_income",
                "purchase_invoice_income",
                "sales_invoice_income",
                "raw",
                "synced_at",
                "updated_at",
            ].join(","),
            {
                count: "exact",
            },
        )
        .gte(
            "despatch_date",
            toDateOnly(input.startDate),
        )
        .lte(
            "despatch_date",
            toDateOnly(input.endDate),
        );

    query = applyOperationFilters(
        query,
        input,
    );

    query = query
        .order("despatch_date", {
            ascending: false,
        })
        .order("id", {
            ascending: false,
        })
        .range(from, to);

    /*
     * shipment_imports tablosunda doğrudan user_id alanı
     * bulunmadığı için userId filtresi şu an uygulanmıyor.
     * Kullanıcı eşleştirme kuralı kesinleştiğinde SQL/RPC
     * seviyesinde eklenecek.
     */
    const { data, error, count } = await query;

    if (error) {
        throw Object.assign(
            new Error(
                `Operasyon kayıtları alınamadı: ${error.message}`,
            ),
            {
                statusCode: 500,
            },
        );
    }

    const rows =
        (data ?? []) as unknown as ShipmentImportRow[];

    let summaryQuery = supabaseAdmin
        .from("shipment_imports")
        .select(
            [
                "sales_invoice_income",
                "purchase_invoice_income",
            ].join(","),
        )
        .gte(
            "despatch_date",
            toDateOnly(input.startDate),
        )
        .lte(
            "despatch_date",
            toDateOnly(input.endDate),
        );

    summaryQuery = applyOperationFilters(
        summaryQuery,
        input,
    );

    const { data: summaryRows, error: summaryError } =
        await summaryQuery;

    if (summaryError) {
        throw Object.assign(
            new Error(
                "Operasyon özeti alınamadı: " + summaryError.message,
            ),
            {
                statusCode: 500,
            },
        );
    }

    const summary = {
        totalSales: 0,
        totalPurchase: 0,
        totalProfit: 0,
    };

    for (const row of ((summaryRows ?? []) as unknown as OperationSummaryRow[])) {
        summary.totalSales += parseNumber(
            row.sales_invoice_income,
        );

        summary.totalPurchase += parseNumber(
            row.purchase_invoice_income,
        );
    }

    summary.totalProfit =
        summary.totalSales -
        summary.totalPurchase;

    return {
        items: rows.map(mapOperationRow),
        totalCount: count ?? 0,
        page: input.page,
        pageSize: input.pageSize,
        summary,
    };
}










