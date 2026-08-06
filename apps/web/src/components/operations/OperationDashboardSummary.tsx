function money(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
    }).format(value);
}

export function OperationDashboardSummary({
    summary,
    totalCount,
}: {
    summary: {
        totalSales: number;
        totalPurchase: number;
        totalProfit: number;
    };
    totalCount: number;
}) {
    const cards = [
        {
            title: "Toplam Sefer",
            value: totalCount.toLocaleString("tr-TR"),
        },
        {
            title: "Toplam Gelir",
            value: money(summary.totalSales),
        },
        {
            title: "Toplam Gider",
            value: money(summary.totalPurchase),
        },
        {
            title: "Toplam Kâr",
            value: money(summary.totalProfit),
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {card.title}
                    </div>

                    <div className="mt-2 text-2xl font-extrabold text-slate-950">
                        {card.value}
                    </div>
                </div>
            ))}
        </div>
    );
}
