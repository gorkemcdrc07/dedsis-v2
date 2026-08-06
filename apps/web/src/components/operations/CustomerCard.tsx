import type { OperationRow } from "../../features/operations/types";

export function CustomerCard({ row }: { row: OperationRow }) {
  const fields = [
    ["Cari", row.CurrentAccountsName],
    ["Tedarikçi", row.SupplierName],
    ["Müşteri sipariş no", row.CustomerOrderNumber],
    ["Müşteri evrak no", row.CustomerDocumentNumber],
    ["Hizmet", row.ServiceExpense],
    ["Hizmet adı", row.ServiceExpenseName],
    ["Alt hizmet", row.SubServiceName],
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-5 font-bold text-slate-950">
        Müşteri ve hizmet
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={String(label)}>
            <div className="text-xs font-medium text-slate-500">
              {label}
            </div>

            <div className="mt-1 break-words text-sm font-semibold text-slate-900">
              {value || "-"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
