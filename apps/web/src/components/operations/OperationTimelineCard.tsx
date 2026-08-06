import type { OperationRow } from "../../features/operations/types";

type TimelineItem = {
  title: string;
  date?: string | null;
  user?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

export function OperationTimelineCard({
  row,
}: {
  row: OperationRow;
}) {
  const items: TimelineItem[] = [
    {
      title: "Sefer oluşturuldu",
      date: row.CreatedDate,
      user: row.CreatedByName,
    },
    {
      title: "Son değişiklik yapıldı",
      date: row.LastModifiedDate,
      user: row.LastModifiedByName,
    },
    {
      title: "Satış faturası oluşturuldu",
      date: row.InvoiceSaleDate,
      user: undefined,
    },
    {
      title: "ERP satış aktarımı yapıldı",
      date: row.ErpSalesInvoceCreateDate,
      user: row.ErpSalesInvoceCreateBy,
    },
  ].filter(
    (item) => item.date,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-5 font-bold text-slate-950">
        Operasyon geçmişi
      </h3>

      <div className="space-y-5">
        {items.length === 0 ? (
          <div className="text-sm text-slate-500">
            Geçmiş bilgisi bulunamadı.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="relative flex gap-4"
            >
              <div className="mt-1">
                <div className="h-3 w-3 rounded-full bg-blue-600" />
              </div>

              <div>
                <div className="font-semibold text-slate-900">
                  {item.title}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {formatDate(item.date)}
                </div>

                {item.user ? (
                  <div className="mt-1 text-xs text-slate-500">
                    Kullanıcı: {item.user}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
