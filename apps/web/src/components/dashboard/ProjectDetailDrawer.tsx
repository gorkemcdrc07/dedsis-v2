import {
  ChevronRight,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import type {
  DashboardDetailRow,
  DashboardProjectDetail,
} from "@dedsis/contracts";

type ProjectDetailDrawerProps = {
  detail: DashboardProjectDetail | null;
  onClose: () => void;
};

function getRowValue(
  row: DashboardDetailRow,
  keys: string[],
): unknown {
  for (const key of keys) {
    const value = row[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      return value;
    }
  }

  return "-";
}

function formatValue(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold text-slate-900">
        {formatValue(value)}
      </div>
    </div>
  );
}

export function ProjectDetailDrawer({
  detail,
  onClose,
}: ProjectDetailDrawerProps) {
  const [selectedRow, setSelectedRow] =
    useState<DashboardDetailRow | null>(
      null,
    );

  const rows = detail?.rows ?? [];

  const selectedEntries = useMemo(
    () =>
      selectedRow
        ? Object.entries(selectedRow)
        : [],
    [selectedRow],
  );

  if (!detail) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Detay panelini kapat"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-6xl flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Proje detayı
            </div>

            <h2 className="mt-1 text-xl font-extrabold text-slate-950">
              {detail.projectName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {rows.length} operasyon kaydı
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
          <section className="min-h-0 overflow-auto border-r border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Sefer No
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Plaka
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Müşteri
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Tedarikçi
                    </th>

                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, index) => (
                    <tr
                      key={String(
                        row.id ??
                          row.TMSDespatchesId ??
                          index,
                      )}
                      onClick={() =>
                        setSelectedRow(row)
                      }
                      className={[
                        "cursor-pointer transition hover:bg-blue-50/60",
                        selectedRow === row
                          ? "bg-blue-50"
                          : "",
                      ].join(" ")}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-900">
                        {formatValue(
                          getRowValue(row, [
                            "DocumentNo",
                            "TripNo",
                            "SeferNo",
                            "TMSDespatchesId",
                            "id",
                          ]),
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700">
                        {formatValue(
                          getRowValue(row, [
                            "PlateNumber",
                            "PlateNo",
                          ]),
                        )}
                      </td>

                      <td className="max-w-60 px-4 py-3 text-sm text-slate-700">
                        {formatValue(
                          getRowValue(row, [
                            "CustomerFullTitle",
                            "CustomerName",
                            "CariAdi",
                          ]),
                        )}
                      </td>

                      <td className="max-w-60 px-4 py-3 text-sm text-slate-700">
                        {formatValue(
                          getRowValue(row, [
                            "SupplierName",
                            "VendorName",
                            "TedarikciAdi",
                          ]),
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="min-h-0 overflow-auto bg-slate-50/60 p-5">
            {selectedRow ? (
              <div className="space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-950">
                    Operasyon kaydı
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Harici servisten gelen tüm alanlar
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailField
                    label="Sefer No"
                    value={getRowValue(
                      selectedRow,
                      [
                        "DocumentNo",
                        "TripNo",
                        "SeferNo",
                        "TMSDespatchesId",
                      ],
                    )}
                  />

                  <DetailField
                    label="Plaka"
                    value={getRowValue(
                      selectedRow,
                      [
                        "PlateNumber",
                        "PlateNo",
                      ],
                    )}
                  />

                  <DetailField
                    label="Gelir"
                    value={getRowValue(
                      selectedRow,
                      [
                        "SalesInvoceIncome",
                        "SalesInvoiceIncome",
                      ],
                    )}
                  />

                  <DetailField
                    label="Gider"
                    value={getRowValue(
                      selectedRow,
                      [
                        "PurchaseInvoiceIncome",
                      ],
                    )}
                  />
                </div>

                <div className="grid gap-3">
                  {selectedEntries.map(
                    ([key, value]) => (
                      <DetailField
                        key={key}
                        label={key}
                        value={value}
                      />
                    ),
                  )}
                </div>
              </div>
            ) : (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Bir kayıt seç
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Tüm alanları görmek için soldaki tablodan bir operasyona tıkla.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
