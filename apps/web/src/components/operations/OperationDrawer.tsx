import { useEffect } from "react";
import { X } from "lucide-react";
import type { OperationRow } from "../../features/operations/types";
import { GeneralCard } from "./GeneralCard";
import { FinanceCard } from "./FinanceCard";
import { CustomerCard } from "./CustomerCard";
import { SystemCard } from "./SystemCard";
import { JsonCard } from "./JsonCard";
import { OperationSummaryCard } from "./OperationSummaryCard";
import { OperationTimelineCard } from "./OperationTimelineCard";

type Props = {
  row: OperationRow | null;
  onClose: () => void;
};

export function OperationDrawer({ row, onClose }: Props) {
  useEffect(() => {
    if (!row) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <aside className="ml-auto flex h-full w-full max-w-3xl flex-col bg-slate-50 shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-slate-950">
              {row.TMSDespatchesDocumentNo || "Operasyon detayı"}
            </div>

            <div className="mt-0.5 truncate text-sm text-slate-500">
              {row.ProjectName || "Proje bilgisi yok"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            aria-label="Detayı kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <OperationSummaryCard row={row} />
          <GeneralCard row={row} />
          <FinanceCard row={row} />
          <CustomerCard row={row} />
          <OperationTimelineCard row={row} />
          <SystemCard row={row} />

          {row.Description ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-bold text-slate-950">
                Açıklama
              </h3>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {row.Description}
              </p>
            </section>
          ) : null}

          <JsonCard row={row} />
        </div>
      </aside>
    </div>
  );
}


