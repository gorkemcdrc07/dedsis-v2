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

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() <= 1900
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
  }).format(parsed);
}

export function FinanceCard({ row }: { row: OperationRow }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-5 font-bold text-slate-950">Finans</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <div className="text-xs font-semibold text-emerald-700">
            Satış faturası
          </div>

          <div className="mt-1 text-xl font-bold text-emerald-800">
            {money(row.SalesInvoceIncome)}
          </div>

          <div className="mt-3 text-xs text-emerald-700">
            {row.SalesInvoceNo || "Fatura numarası yok"}
          </div>

          <div className="mt-1 text-xs text-emerald-700">
            {date(row.InvoiceSaleDate)}
          </div>
        </div>

        <div className="rounded-xl bg-rose-50 p-4">
          <div className="text-xs font-semibold text-rose-700">
            Alış faturası
          </div>

          <div className="mt-1 text-xl font-bold text-rose-800">
            {money(row.PurchaseInvoiceIncome)}
          </div>

          <div className="mt-3 text-xs text-rose-700">
            {row.PurchaseInvoicNo || "Fatura numarası yok"}
          </div>

          <div className="mt-1 text-xs text-rose-700">
            {date(row.PurchaseInvoiceDate)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500">Hizmet geliri</div>
          <div className="mt-1 font-semibold">
            {money(row.ServiceIncome)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Maliyet geliri</div>
          <div className="mt-1 font-semibold">
            {money(row.CostIncome)}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">KDV oranı</div>
          <div className="mt-1 font-semibold">
            %{Number(row.VatRate ?? 0) * 100}
          </div>
        </div>
      </div>
    </section>
  );
}
