import type { OperationRow } from "../../features/operations/types";

function money(value?: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function date(value?: string) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(parsed);
}

export function OperationSummaryCard({
  row,
}: {
  row: OperationRow;
}) {
  const sales = Number(row.SalesInvoceIncome ?? 0);
  const purchase = Number(row.PurchaseInvoiceIncome ?? 0);

  const profit = sales - purchase;

  const margin =
    sales > 0
      ? (profit / sales) * 100
      : 0;

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="mb-4 font-bold text-slate-950">
        Operasyon özeti
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xs text-slate-500">
            Sefer no
          </div>
          <div className="mt-1 font-bold">
            {row.TMSDespatchesDocumentNo || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Proje
          </div>
          <div className="mt-1 font-bold">
            {row.ProjectName || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Plaka
          </div>
          <div className="mt-1 font-bold">
            {row.PlateNumber || "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Tarih
          </div>
          <div className="mt-1 font-bold">
            {date(row.TMSDespatchesDespatchDate)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Satış
          </div>
          <div className="mt-1 font-bold text-emerald-700">
            {money(sales)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Alış
          </div>
          <div className="mt-1 font-bold text-rose-700">
            {money(purchase)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Net kâr
          </div>
          <div className="mt-1 font-bold text-blue-700">
            {money(profit)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">
            Kâr marjı
          </div>
          <div className="mt-1 font-bold text-blue-700">
            %{margin.toFixed(2)}
          </div>
        </div>
      </div>
    </section>
  );
}
