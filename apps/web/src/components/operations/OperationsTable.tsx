import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import type { OperationRow } from "../../features/operations/types";

const COLUMN_DEFINITIONS = [
  {
    key: "documentNo",
    label: "Sefer no",
  },
  {
    key: "date",
    label: "Tarih",
  },
  {
    key: "project",
    label: "Proje",
  },
  {
    key: "plate",
    label: "Plaka",
  },
  {
    key: "workingType",
    label: "Çalışma",
  },
  {
    key: "vehicleType",
    label: "Araç Tipi",
  },
  {
    key: "tonnage",
    label: "Tonaj",
  },
  {
    key: "customer",
    label: "Cari",
  },
  {
    key: "supplier",
    label: "Tedarikçi",
  },
  {
    key: "income",
    label: "Gelir",
  },
  {
    key: "expense",
    label: "Gider",
  },
  {
    key: "profit",
    label: "Kâr",
  },
  {
    key: "status",
    label: "Durum",
  },
] as const;

type ColumnKey =
  typeof COLUMN_DEFINITIONS[number]["key"];

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

function getProfitClass(row: OperationRow) {
  const profit =
    Number(row.SalesInvoceIncome ?? 0) -
    Number(row.PurchaseInvoiceIncome ?? 0);

  if (profit > 0) {
    return "font-semibold text-emerald-700";
  }

  if (profit < 0) {
    return "font-semibold text-rose-700";
  }

  return "font-semibold text-slate-500";
}
function getStatusBadge(row: OperationRow) {
  if (row.ErpSalesInvoceCreateDate) {
    return {
      text: "ERP Aktarıldı",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (row.SalesInvoceIncome) {
    return {
      text: "Fatura Var",
      className:
        "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    text: "Bekliyor",
    className:
      "bg-slate-50 text-slate-600 border-slate-200",
  };
}
function exportOperations(rows: OperationRow[]) {
  const data = rows.map((row) => {
    const profit =
      Number(row.SalesInvoceIncome ?? 0) -
      Number(row.PurchaseInvoiceIncome ?? 0);

    const status = getStatusBadge(row);

    return {
      "Sefer No": row.TMSDespatchesDocumentNo ?? "",
      "Tarih": row.TMSDespatchesDespatchDate ?? "",
      "Proje": row.ProjectName ?? "",
      "Plaka": row.PlateNumber ?? "",
      "Çalışma": row.VehicleWorkingTypeName ?? "",
      "Cari": row.CurrentAccountsName ?? "",
      "Tedarikçi": row.SupplierName ?? "",
      "Gelir": row.SalesInvoceIncome ?? 0,
      "Gider": row.PurchaseInvoiceIncome ?? 0,
      "Kâr": profit,
      "Durum": status.text,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Operasyonlar",
  );

  XLSX.writeFile(
    workbook,
    "operasyonlar.xlsx",
  );
}
function renderColumnValue(
  row: OperationRow,
  column: ColumnKey,
) {
  switch (column) {
    case "documentNo":
      return row.TMSDespatchesDocumentNo || "-";

    case "date":
      return formatDate(
        row.TMSDespatchesDespatchDate,
      );

    case "project":
      return row.ProjectName || "-";

    case "plate":
      return row.PlateNumber || "-";

    case "workingType":
      return row.VehicleWorkingTypeName || "-";

    case "customer":
      return row.CurrentAccountsName || "-";

    case "supplier":
      return row.SupplierName || "-";

    case "income":
      return formatMoney(
        row.SalesInvoceIncome,
      );

    case "expense":
      return formatMoney(
        row.PurchaseInvoiceIncome,
      );

    case "profit":
      return formatMoney(
        Number(row.SalesInvoceIncome ?? 0) -
        Number(row.PurchaseInvoiceIncome ?? 0),
      );

    default:
      return "-";
  }
}

export function OperationsTable({
  rows,
  loading,
  onSelect,
}: Props) {
  const [showColumnMenu, setShowColumnMenu] =
    useState(false);

const [visibleColumns, setVisibleColumns] =
    useState<ColumnKey[]>(() => {
      const saved =
        localStorage.getItem(
          "dedsis.operations.columns",
        );

      if (!saved) {
        return COLUMN_DEFINITIONS.map(
          (column) => column.key,
        );
      }

      try {
        return JSON.parse(saved);
      } catch {
        return COLUMN_DEFINITIONS.map(
          (column) => column.key,
        );
      }
    });
  useEffect(() => {
    localStorage.setItem(
      "dedsis.operations.columns",
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportOperations(rows)}
            disabled={rows.length === 0}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Excel indir
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setShowColumnMenu((value) => !value)
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Kolonlar
            </button>

            {showColumnMenu ? (
            <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="mb-2 text-xs font-bold text-slate-500">
                Görünen kolonlar
              </div>

              <div className="space-y-2">
                {COLUMN_DEFINITIONS.map((column) => (
                  <label
                    key={column.key}
                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(column.key)}
                      onChange={() => {
                        setVisibleColumns((current) =>
                          current.includes(column.key)
                            ? current.filter(
                                (item) =>
                                  item !== column.key,
                              )
                            : [
                                ...current,
                                column.key,
                              ],
                        );
                      }}
                    />

                    {column.label}
                  </label>
                ))}
              </div>

              <div className="mt-3 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleColumns(
                      COLUMN_DEFINITIONS.map(
                        (column) => column.key,
                      ),
                    )
                  }
                  className="w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Varsayılanlara dön
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {COLUMN_DEFINITIONS
                .filter((column) =>
                  visibleColumns.includes(column.key),
                )
                .map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left"
                  >
                    {column.label}
                  </th>
                ))}
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
                  {visibleColumns.map((column) => (
                    <td
                      key={column}
                      className={[
                        "px-4 py-3 whitespace-nowrap",
                        column === "profit"
                          ? getProfitClass(row)
                          : "",
                      ].join(" ")}
                    >
                      {column === "status" ? (
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            getStatusBadge(row).className,
                          ].join(" ")}
                        >
                          {getStatusBadge(row).text}
                        </span>
                      ) : (
                        renderColumnValue(
                          row,
                          column,
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

























