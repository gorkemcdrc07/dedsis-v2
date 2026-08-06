import type { OperationRow } from "../../features/operations/types";

type Props = {
  rows: OperationRow[];
  loading: boolean;
  onSelect: (row: OperationRow) => void;
};

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(value?: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function OperationsTable({
  rows,
  loading,
  onSelect,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-bold text-slate-950">
            Operasyon kayıtları
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            {rows.length.toLocaleString("tr-TR")} kayıt gösteriliyor
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Sefer no</th>
              <th className="px-4 py-3 text-left">Tarih</th>
              <th className="px-4 py-3 text-left">Proje</th>
              <th className="px-4 py-3 text-left">Plaka</th>
              <th className="px-4 py-3 text-left">Çalışma</th>
              <th className="px-4 py-3 text-left">Cari</th>
              <th className="px-4 py-3 text-left">Tedarikçi</th>
              <th className="px-4 py-3 text-right">Gelir</th>
              <th className="px-4 py-3 text-right">Gider</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-slate-500"
                >
                  Kayıtlar yükleniyor...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-slate-500"
                >
                  Seçilen tarihlerde kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={
                    row.TMSDespatchIncomeExpenseId ??
                    `${row.TMSDespatchesDocumentNo}-${index}`
                  }
                  onClick={() => onSelect(row)}
                  className="cursor-pointer transition hover:bg-blue-50/70"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-700">
                    {row.TMSDespatchesDocumentNo || "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(row.TMSDespatchesDespatchDate)}
                  </td>

                  <td className="max-w-64 px-4 py-3">
                    <div
                      className="truncate font-medium text-slate-900"
                      title={row.ProjectName}
                    >
                      {row.ProjectName || "-"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {row.PlateNumber || "-"}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3">
                    {row.VehicleWorkingTypeName || "-"}
                  </td>

                  <td className="max-w-64 px-4 py-3">
                    <div
                      className="truncate"
                      title={row.CurrentAccountsName}
                    >
                      {row.CurrentAccountsName || "-"}
                    </div>
                  </td>

                  <td className="max-w-64 px-4 py-3">
                    <div
                      className="truncate"
                      title={row.SupplierName}
                    >
                      {row.SupplierName || "-"}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-emerald-700">
                    {formatMoney(row.SalesInvoceIncome)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-rose-700">
                    {formatMoney(row.PurchaseInvoiceIncome)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
