import { useState } from "react";
import { OperationDrawer } from "../components/operations/OperationDrawer";
import { OperationFilters } from "../components/operations/OperationFilters";
import { OperationsTable } from "../components/operations/OperationsTable";
import { useOperations } from "../features/operations/useOperations";
import type { OperationRow } from "../features/operations/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function OperationsPage() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [rows, setRows] = useState<OperationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRow, setSelectedRow] =
    useState<OperationRow | null>(null);

  const operations = useOperations();

  async function loadOperations() {
    if (startDate > endDate) {
      return;
    }

    try {
      const result = await operations.mutateAsync({
        startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
        endDate: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
        page: 1,
        pageSize: 500,
      });

      setRows(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setSelectedRow(null);
    } catch {
      setRows([]);
      setTotalCount(0);
    }
  }

  const invalidDateRange = startDate > endDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Operasyon Kayıtları
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Legacy API üzerinden gelen sefer ve finans kayıtlarını
            detaylı olarak inceleyin.
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          Toplam: {totalCount.toLocaleString("tr-TR")}
        </div>
      </div>

      <OperationFilters
        startDate={startDate}
        endDate={endDate}
        loading={operations.isPending}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={() => void loadOperations()}
      />

      {invalidDateRange ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Başlangıç tarihi, bitiş tarihinden sonra olamaz.
        </div>
      ) : null}

      {operations.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {operations.error instanceof Error
            ? operations.error.message
            : "Kayıtlar alınırken bir hata oluştu."}
        </div>
      ) : null}

      <OperationsTable
        rows={rows}
        loading={operations.isPending}
        onSelect={setSelectedRow}
      />

      <OperationDrawer
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}

