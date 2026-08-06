import type { OperationRow } from "../../features/operations/types";

function formatDate(value?: string | null) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function SystemCard({ row }: { row: OperationRow }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-5 font-bold text-slate-950">
        Sistem bilgileri
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-500">Oluşturan</div>
          <div className="mt-1 font-semibold">
            {row.CreatedByName || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Oluşturma tarihi
          </div>
          <div className="mt-1 font-semibold">
            {formatDate(row.CreatedDate)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Son değiştiren
          </div>
          <div className="mt-1 font-semibold">
            {row.LastModifiedByName || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Son değişiklik
          </div>
          <div className="mt-1 font-semibold">
            {formatDate(row.LastModifiedDate)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            ERP aktaran
          </div>
          <div className="mt-1 font-semibold">
            {row.ErpSalesInvoceCreateBy || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            ERP aktarım tarihi
          </div>
          <div className="mt-1 font-semibold">
            {formatDate(row.ErpSalesInvoceCreateDate)}
          </div>
        </div>
      </div>
    </section>
  );
}
