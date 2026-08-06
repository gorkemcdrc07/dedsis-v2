import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { OperationDrawer } from "../components/operations/OperationDrawer";
import { OperationFilters } from "../components/operations/OperationFilters";
import { OperationsTable } from "../components/operations/OperationsTable";
import { OperationDashboardSummary } from "../components/operations/OperationDashboardSummary";
import { useOperations } from "../features/operations/useOperations";
import type { OperationRow } from "../features/operations/types";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function OperationsPage() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    projectName: searchParams.get("projectName") ?? "",
    plateNumber: "",
    customerName: "",
    supplierName: "",
    documentNo: "",
  });



  const [rows, setRows] = useState<OperationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalProfit: 0,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [selectedRow, setSelectedRow] =
    useState<OperationRow | null>(null);

  const operations = useOperations();

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize),
  );

  const firstVisibleRecord =
    totalCount === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastVisibleRecord = Math.min(
    page * pageSize,
    totalCount,
  );

  async function loadOperations(
    targetPage = page,
    targetPageSize = pageSize,
  ) {
    if (startDate > endDate) {
      return;
    }

    try {
      const result = await operations.mutateAsync({
        startDate: new Date(
          `${startDate}T00:00:00.000Z`,
        ).toISOString(),

        endDate: new Date(
          `${endDate}T23:59:59.999Z`,
        ).toISOString(),

        page: targetPage,
        pageSize: targetPageSize,
        filters,
      });

      setRows(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);

      setSummary(
        result.summary ?? {
          totalSales: 0,
          totalPurchase: 0,
          totalProfit: 0,
        },
      );
      setPage(result.page ?? targetPage);
      setPageSize(result.pageSize ?? targetPageSize);
      setSelectedRow(null);
      setHasLoaded(true);
    } catch {
      setRows([]);
      setTotalCount(0);
      setHasLoaded(true);
    }
  }

  function handleClearFilters() {
    setFilters({
      projectName: "",
      plateNumber: "",
      documentNo: "",
      customerName: "",
      supplierName: "",
    });
  }
  useEffect(() => {
    if (searchParams.get("projectName")) {
      void loadOperations(1, pageSize);
    }
  }, []);
  function clearDashboardFilter() {
    navigate("/operations");

    setFilters({
      projectName: "",
      plateNumber: "",
      customerName: "",
      supplierName: "",
      documentNo: "",
    });
  }
  function handleSubmit() {
    setPage(1);
    void loadOperations(1, pageSize);
  }

  function handlePreviousPage() {
    if (page <= 1 || operations.isPending) {
      return;
    }

    const previousPage = page - 1;

    setPage(previousPage);
    void loadOperations(previousPage, pageSize);
  }

  function handleNextPage() {
    if (
      page >= totalPages ||
      operations.isPending
    ) {
      return;
    }

    const nextPage = page + 1;

    setPage(nextPage);
    void loadOperations(nextPage, pageSize);
  }

  function handlePageSizeChange(
    value: number,
  ) {
    setPage(1);
    setPageSize(value);

    if (hasLoaded) {
      void loadOperations(1, value);
    }
  }

  const invalidDateRange =
    startDate > endDate;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Operasyon Kayıtları
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Senkronize edilmiş sefer ve finans
            kayıtlarını detaylı olarak inceleyin.
          </p>
        </div>

        <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
          Toplam:{" "}
          {totalCount.toLocaleString("tr-TR")}
        </div>
      </div>

      {searchParams.get("projectName") ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <div className="font-semibold">
            Dashboard filtresi aktif
          </div>

          <div className="mt-1 flex items-center justify-between gap-4">
            <span>
              Proje: {searchParams.get("projectName")}
            </span>

            <button
              type="button"
              onClick={clearDashboardFilter}
              className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Temizle
            </button>
          </div>
        </div>
      ) : null}
      <OperationDashboardSummary
        summary={summary}
        totalCount={totalCount}
      />

      <OperationFilters
        startDate={startDate}
        endDate={endDate}
        loading={operations.isPending}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={handleSubmit}
      />

      {invalidDateRange ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Başlangıç tarihi, bitiş tarihinden
          sonra olamaz.
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

      {hasLoaded ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {totalCount === 0 ? (
              "Kayıt bulunamadı."
            ) : (
              <>
                <span className="font-semibold text-slate-900">
                  {firstVisibleRecord.toLocaleString(
                    "tr-TR",
                  )}
                  –
                  {lastVisibleRecord.toLocaleString(
                    "tr-TR",
                  )}
                </span>{" "}
                arası gösteriliyor. Toplam{" "}
                <span className="font-semibold text-slate-900">
                  {totalCount.toLocaleString("tr-TR")}
                </span>{" "}
                kayıt.
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Sayfa başına

              <select
                value={pageSize}
                disabled={operations.isPending}
                onChange={(event) =>
                  handlePageSizeChange(
                    Number(event.target.value),
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {PAGE_SIZE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ),
                )}
              </select>
            </label>

            <button
              type="button"
              disabled={
                page <= 1 ||
                operations.isPending ||
                totalCount === 0
              }
              onClick={handlePreviousPage}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Önceki
            </button>

            <div className="min-w-28 text-center text-sm font-semibold text-slate-700">
              Sayfa {page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={
                page >= totalPages ||
                operations.isPending ||
                totalCount === 0
              }
              onClick={handleNextPage}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        </div>
      ) : null}

      <OperationDrawer
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </div>
  );
}























