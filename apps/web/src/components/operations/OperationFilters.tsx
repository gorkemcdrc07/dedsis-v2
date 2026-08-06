type Props = {
  startDate: string;
  endDate: string;
  loading: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSubmit: () => void;
};

export function OperationFilters({
  startDate,
  endDate,
  loading,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: Props) {
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
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Bitiş tarihi
          </span>

          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              onEndDateChange(event.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </label>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !startDate || !endDate}
          className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Yükleniyor..." : "Kayıtları getir"}
        </button>
      </div>
    </div>
  );
}
