import { fetchLegacyRows } from "../../dashboard/service.js";
import { supabaseAdmin } from "../../supabase/client.js";

type SyncShipmentsInput = {
    startDate: Date;
    endDate: Date;
};

export type SyncShipmentsResult = {
    fetched: number;
    upserted: number;
};

export async function syncShipments(
    input: SyncShipmentsInput,
): Promise<SyncShipmentsResult> {
    console.log("Legacy API'den veri çekiliyor...");

    const rows = await fetchLegacyRows(
        input.startDate,
        input.endDate,
    );

    console.log(`${rows.length} kayıt bulundu.`);

    const payload = rows.map((row) => ({
        legacy_shipment_id: Number(
            row.raw.TMSDespatchesId,
        ),

        legacy_income_expense_id: Number(
            row.raw.TMSDespatchIncomeExpenseId,
        ),

        document_no: String(
            row.raw.TMSDespatchesDocumentNo ?? "",
        ),

        despatch_date:
            row.raw.TMSDespatchesDespatchDate,

        project_name: String(
            row.raw.ProjectName ?? "",
        ),

        supplier_name: String(
            row.raw.SupplierName ?? "",
        ),

        customer_name: String(
            row.raw.CurrentAccountsName ?? "",
        ),

        plate_number: String(
            row.raw.PlateNumber ?? "",
        ),

        vehicle_working_type: String(
            row.raw.VehicleWorkingTypeName ?? "",
        ),

        vehicle_master_group: String(
            row.raw.VehicleMasterGroupName ?? "",
        ),

        special_group: String(
            row.raw.SpecialGroupName ?? "",
        ),

        sales_invoice_income: row.salesIncome,

        purchase_invoice_income:
            row.purchaseIncome,

        service_income: Number(
            row.raw.ServiceIncome ?? 0,
        ),

        raw: row.raw,

        synced_at: new Date().toISOString(),
    }));

    const BATCH_SIZE = 1000;

    let upserted = 0;

    for (
        let i = 0;
        i < payload.length;
        i += BATCH_SIZE
    ) {
        const batch = payload.slice(
            i,
            i + BATCH_SIZE,
        );

        console.log(
            `Supabase: ${Math.min(
                i + batch.length,
                payload.length,
            )}/${payload.length}`,
        );

        const { error } =
            await supabaseAdmin
                .from("shipment_imports")
                .upsert(batch, {
                    onConflict:
                        "legacy_income_expense_id",
                });

        if (error) {
            throw error;
        }

        upserted += batch.length;
    }

    console.log(
        `${upserted} kayıt Supabase'e yazıldı.`,
    );

    return {
        fetched: rows.length,
        upserted,
    };
}

