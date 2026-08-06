import { useState } from "react";
import type { OperationRow } from "../../features/operations/types";

export function JsonCard({ row }: { row: OperationRow }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="font-bold text-slate-950">
          Ham JSON
        </span>

        <span className="text-xs font-semibold text-blue-600">
          {open ? "Gizle" : "Göster"}
        </span>
      </button>

      {open ? (
        <pre className="max-h-[600px] overflow-auto border-t border-slate-800 bg-slate-950 p-5 text-xs leading-6 text-emerald-300">
          {JSON.stringify(row, null, 2)}
        </pre>
      ) : null}
    </section>
  );
}
