type Filters = {
  projectName: string;
  plateNumber: string;
  documentNo: string;
  customerName: string;
  supplierName: string;
};

type Props = {
  startDate: string;
  endDate: string;
  loading: boolean;

  filters: Filters;
  onFiltersChange: (
    value: Filters,
  ) => void;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
  onClearFilters: () => void;
};

export function OperationFilters({
  startDate,
  endDate,
  loading,
  filters,
  onFiltersChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
  onClearFilters,
}: Props) {
  function updateFilter(
    key: keyof Filters,
    value: string,
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Başlangıç tarihi
          </span>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              onStartDateChange(e.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Bitiş tarihi
          </span>

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              onEndDateChange(e.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Proje
          </span>

          <input
            value={filters.projectName}
            onChange={(e) =>
              updateFilter(
                "projectName",
                e.target.value,
              )
            }
            placeholder="Proje adı"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Plaka
          </span>

          <input
            value={filters.plateNumber}
            onChange={(e) =>
              updateFilter(
                "plateNumber",
                e.target.value,
              )
            }
            placeholder="34ABC"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Sefer No
          </span>

          <input
            value={filters.documentNo}
            onChange={(e) =>
              updateFilter(
                "documentNo",
                e.target.value,
              )
            }
            placeholder="SFR..."
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Cari
          </span>

          <input
            value={filters.customerName}
            onChange={(e) =>
              updateFilter(
                "customerName",
                e.target.value,
              )
            }
            placeholder="Cari"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Tedarikçi
          </span>

          <input
            value={filters.supplierName}
            onChange={(e) =>
              updateFilter(
                "supplierName",
                e.target.value,
              )
            }
            placeholder="Tedarikçi"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          />
        </label>


        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !startDate || !endDate}
          className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          {loading
            ? "Yükleniyor..."
            : "Kayıtları getir"}
        </button>

        <button
          type="button"
          onClick={onClearFilters}
          disabled={loading}
          className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:bg-slate-100"
        >
          Filtreleri temizle
        </button>

      </div>
    </div>
  );
}

