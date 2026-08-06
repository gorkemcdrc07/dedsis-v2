import { DashboardLoading } from "./DashboardLoading";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    PackageCheck,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import {
    Fragment,
    useMemo,
    useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import type {
    DashboardMetric,
    DashboardProjectRow,
} from "@dedsis/contracts";
import {
    getDashboardProjectDetail,
    getSyncJob,
    syncDashboard,
} from "../features/dashboard/dashboard.api";

import { useDashboard } from "../features/dashboard/useDashboard";

function toInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getInitialPeriod() {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(
        endDate.getDate() - 6,
    );

    return {
        startDate: toInputDate(startDate),
        endDate: toInputDate(endDate),
    };
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number) {
    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value);
}

function getMetricIcon(key: string) {
    switch (key) {
        case "shipments":
            return PackageCheck;
        case "revenue":
            return CircleDollarSign;
        case "expense":
            return Banknote;
        case "profit":
            return TrendingUp;
        default:
            return TrendingUp;
    }
}

function MetricCard({
    metric,
}: {
    metric: DashboardMetric;
}) {
    const Icon = getMetricIcon(metric.key);

    const isPositive =
        metric.changeRate === null ||
        metric.changeRate >= 0;

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                </div>

                {metric.changeRate !== null ? (
                    <span
                        className={[
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                            isPositive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700",
                        ].join(" ")}
                    >
                        {isPositive ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                        )}

                        %
                        {formatPercent(
                            Math.abs(metric.changeRate),
                        )}
                    </span>
                ) : null}
            </div>

            <div className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950">
                {metric.formattedValue}
            </div>

            <div className="mt-1 text-sm font-medium text-slate-500">
                {metric.label}
            </div>
        </article>
    );
}

type TripSummary = {
    tripId: string;
    plateNumber: string;
    revenue: number;
    expense: number;
    profit: number;
};

function getDetailValue(
    row: Record<string, unknown>,
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

    return null;
}

function parseDetailAmount(
    value: unknown,
): number {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : 0;
    }

    let normalized = String(value).trim();

    if (
        normalized.includes(",") &&
        normalized.includes(".")
    ) {
        normalized = normalized
            .replace(/\./g, "")
            .replace(",", ".");
    } else if (normalized.includes(",")) {
        normalized = normalized.replace(",", ".");
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
}

function buildTripSummaries(
    rows: Array<Record<string, unknown>>,
): TripSummary[] {
    const grouped = new Map<
        string,
        {
            tripId: string;
            plateNumber: string;
            revenues: number[];
            expenses: number[];
        }
    >();

    rows.forEach((row, index) => {
        const tripId = String(
            getDetailValue(row, [
                "TMSDespatchesId",
                "TripNo",
                "SeferNo",
                "DocumentNo",
                "id",
            ]) ?? `Kayıt-${index + 1}`,
        );

        const plateNumber = String(
            getDetailValue(row, [
                "PlateNumber",
                "PlateNo",
            ]) ?? "-",
        );

        const revenue = parseDetailAmount(
            getDetailValue(row, [
                "SalesInvoceIncome",
                "SalesInvoiceIncome",
            ]),
        );

        const expense = parseDetailAmount(
            getDetailValue(row, [
                "PurchaseInvoiceIncome",
                "SupplierInvoiceAmount",
            ]),
        );

        const current = grouped.get(tripId) ?? {
            tripId,
            plateNumber,
            revenues: [],
            expenses: [],
        };

        current.revenues.push(revenue);
        current.expenses.push(expense);

        if (
            current.plateNumber === "-" &&
            plateNumber !== "-"
        ) {
            current.plateNumber = plateNumber;
        }

        grouped.set(tripId, current);
    });

    return Array.from(grouped.values())
        .map((trip) => {
            /*
             * Aynı sefer birden fazla masraf satırıyla
             * gelebilir. Gelir tekrarlanabildiği için
             * en yüksek gelir değeri alınır.
             * Gider satırları ise toplanır.
             */
            const revenue = Math.max(
                0,
                ...trip.revenues,
            );

            const expense = trip.expenses.reduce(
                (total, value) => total + value,
                0,
            );

            return {
                tripId: trip.tripId,
                plateNumber: trip.plateNumber,
                revenue,
                expense,
                profit: revenue - expense,
            };
        })
        .sort((left, right) =>
            right.tripId.localeCompare(
                left.tripId,
                "tr-TR",
                {
                    numeric: true,
                },
            ),
        );
}

function ProjectTable({
    projects,
    startDate,
    endDate,
}: {
    projects: DashboardProjectRow[];
    startDate: string;
    endDate: string;
    }) {
    const [
        expandedProjectId,
        setExpandedProjectId,
    ] = useState<string | null>(null);
    const projectDetailQuery = useQuery({
        queryKey: [
            "dashboard-project-detail",
            expandedProjectId,
            startDate,
            endDate,
        ],
        queryFn: () => {
            if (!expandedProjectId) {
                throw new Error("Proje seçilmedi.");
            }

            return getDashboardProjectDetail(
                expandedProjectId,
                {
                    startDate: new Date(`${startDate}T00:00:00`),
                    endDate: new Date(`${endDate}T00:00:00`),
                },
            );
        },
        enabled:
            Boolean(expandedProjectId) &&
            Boolean(startDate) &&
            Boolean(endDate),
    });

    if (projects.length === 0) {
        return (
            <div className="grid min-h-72 place-items-center px-6 text-center">
                <div>
                    <PackageCheck className="mx-auto h-9 w-9 text-slate-300" />

                    <h3 className="mt-3 font-bold text-slate-900">
                        Kayıt bulunamadı
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Seçilen tarih aralığında eşleşen proje verisi yok.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                        <th className="w-12 px-4 py-3" />

                        <th className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Proje
                        </th>

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Sefer
                        </th>

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Gelir
                        </th>

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Gider
                        </th>

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Kâr
                        </th>

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Kâr Oranı
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {projects.map((project) => {
                        const isExpanded =
                            expandedProjectId ===
                            project.projectId;

                        const isProfitable =
                            project.profit >= 0;

                        const detail =
                            isExpanded &&
                                projectDetailQuery.data?.project.projectId ===
                                project.projectId
                                ? projectDetailQuery.data.project
                                : null;

                        const trips = buildTripSummaries(
                            detail?.rows ?? [],
                        );
                        return (
                            <Fragment
                                key={project.projectId}
                            >
                                <tr
                                    className={[
                                        "cursor-pointer transition",
                                        isExpanded
                                            ? "bg-blue-50/60"
                                            : "hover:bg-slate-50",
                                    ].join(" ")}
                                    onClick={() =>
                                        setExpandedProjectId(
                                            isExpanded
                                                ? null
                                                : project.projectId,
                                        )
                                    }
                                >
                                    <td className="px-4 py-4">
                                        <span className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500">
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            className="text-left"
                                        >
                                            <div className="font-bold text-blue-700 transition hover:text-blue-900">
                                                {project.projectName}
                                            </div>

                                            {project.realProjectName &&
                                                project.realProjectName !==
                                                project.projectName ? (
                                                <div className="mt-1 text-xs text-slate-500">
                                                    API:{" "}
                                                    {project.realProjectName}
                                                </div>
                                            ) : null}
                                        </button>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-700">
                                        {formatNumber(
                                            project.shipmentCount,
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-700">
                                        {formatCurrency(
                                            project.revenue,
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-700">
                                        {formatCurrency(
                                            project.expense,
                                        )}
                                    </td>

                                    <td
                                        className={[
                                            "whitespace-nowrap px-5 py-4 text-right text-sm font-bold",
                                            isProfitable
                                                ? "text-emerald-700"
                                                : "text-red-700",
                                        ].join(" ")}
                                    >
                                        {formatCurrency(
                                            project.profit,
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                        <span
                                            className={[
                                                "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
                                                isProfitable
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700",
                                            ].join(" ")}
                                        >
                                            %
                                            {formatPercent(
                                                project.profitRate,
                                            )}
                                        </span>
                                    </td>
                                </tr>

                                {isExpanded ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="bg-slate-50 px-5 py-5"
                                        >
                                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-950">
                                                            Sefer detayları
                                                        </h4>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {project.projectName}
                                                            {" projesine ait "}
                                                            {trips.length}
                                                            {" sefer"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {projectDetailQuery.isFetching ? (
                                                    <div className="px-5 py-10 text-center text-sm font-medium text-slate-500">
                                                        Sefer detayları yükleniyor...
                                                    </div>
                                                ) : projectDetailQuery.isError ? (
                                                    <div className="px-5 py-10 text-center">
                                                        <div className="text-sm font-bold text-red-700">
                                                            Sefer detayları yüklenemedi.
                                                        </div>

                                                        <div className="mt-1 text-xs text-red-600">
                                                            {projectDetailQuery.error instanceof Error
                                                                ? projectDetailQuery.error.message
                                                                : "Beklenmeyen bir hata oluştu."}
                                                        </div>
                                                    </div>
                                                ) : trips.length === 0 ? (
                                                    <div className="px-5 py-10 text-center text-sm text-slate-500">
                                                        Bu projeye ait sefer detayı bulunamadı.
                                                    </div>
                                                        ) : (
                                                            <div className="overflow-x-auto">
                                                        <table className="min-w-full border-collapse">
                                                            <thead>
                                                                <tr className="border-b border-slate-200 bg-slate-50">
                                                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                                        Sefer No
                                                                    </th>

                                                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                                                        Plaka
                                                                    </th>

                                                                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                                                        Gelir
                                                                    </th>

                                                                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                                                        Gider
                                                                    </th>

                                                                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                                                        Kâr
                                                                    </th>
                                                                </tr>
                                                            </thead>

                                                            <tbody className="divide-y divide-slate-100">
                                                                {trips.map(
                                                                    (trip) => {
                                                                        const tripIsProfitable =
                                                                            trip.profit >= 0;

                                                                        return (
                                                                            <tr
                                                                                key={
                                                                                    trip.tripId
                                                                                }
                                                                                className="transition hover:bg-slate-50"
                                                                            >
                                                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-bold text-slate-950">
                                                                                    {
                                                                                        trip.tripId
                                                                                    }
                                                                                </td>

                                                                                <td className="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-slate-700">
                                                                                    {
                                                                                        trip.plateNumber
                                                                                    }
                                                                                </td>

                                                                                <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm font-semibold text-slate-700">
                                                                                    {formatCurrency(
                                                                                        trip.revenue,
                                                                                    )}
                                                                                </td>

                                                                                <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm font-semibold text-slate-700">
                                                                                    {formatCurrency(
                                                                                        trip.expense,
                                                                                    )}
                                                                                </td>

                                                                                <td
                                                                                    className={[
                                                                                        "whitespace-nowrap px-5 py-3.5 text-right text-sm font-extrabold",
                                                                                        tripIsProfitable
                                                                                            ? "text-emerald-700"
                                                                                            : "text-red-700",
                                                                                    ].join(
                                                                                        " ",
                                                                                    )}
                                                                                >
                                                                                    {formatCurrency(
                                                                                        trip.profit,
                                                                                    )}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    },
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export function DashboardPage() {
    const initialPeriod = useMemo(
        () => getInitialPeriod(),
        [],
    );

    const [startDate, setStartDate] =
        useState(initialPeriod.startDate);

    const [endDate, setEndDate] =
        useState(initialPeriod.endDate);

    const [
        appliedStartDate,
        setAppliedStartDate,
    ] = useState(initialPeriod.startDate);

    const [
        appliedEndDate,
        setAppliedEndDate,
    ] = useState(initialPeriod.endDate);
    const [isSyncing, setIsSyncing] =
        useState(false);

    const [syncError, setSyncError] =
        useState<string | null>(null);

    const [syncSuccess, setSyncSuccess] =
        useState<string | null>(null);

    const dashboardQuery = useDashboard({
        startDate: appliedStartDate,
        endDate: appliedEndDate,
    });
    const dashboard = dashboardQuery.data;

    const handleRefresh = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            setSyncError(null);
            setSyncSuccess(null);

            const { jobId } =
                await syncDashboard({
                    startDate,
                    endDate,
                });

            while (true) {
                const job =
                    await getSyncJob(jobId);

                if (job.status === "completed") {
                    break;
                }

                if (job.status === "failed") {
                    throw new Error(
                        job.error ??
                            "Senkronizasyon başarısız oldu.",
                    );
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, 2000),
                );
            }

            setAppliedStartDate(startDate);
            setAppliedEndDate(endDate);

            setSyncSuccess(
                "API verileri güncellendi ve dashboard yenilendi.",
            );
        } catch (error) {
            setSyncError(
                error instanceof Error
                    ? error.message
                    : "API verileri güncellenirken beklenmeyen bir hata oluştu.",
            );
        } finally {
            setIsSyncing(false);
        }
    };

    const isBusy =
        isSyncing ||
        dashboardQuery.isFetching;

    return (
        <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Operasyon özeti
                        </div>

                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">
                            Finansal ve operasyonel görünüm
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Seçilen dönemdeki proje, sefer, gelir, gider ve kârlılık verileri.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label className="grid gap-1.5">
                            <span className="text-xs font-bold text-slate-600">
                                Başlangıç
                            </span>

                            <input
                                type="date"
                                value={startDate}
                                max={endDate}
                                disabled={isBusy}
                                onChange={(event) =>
                                    setStartDate(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <label className="grid gap-1.5">
                            <span className="text-xs font-bold text-slate-600">
                                Bitiş
                            </span>

                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                disabled={isBusy}
                                onChange={(event) =>
                                    setEndDate(
                                        event.target.value,
                                    )
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isBusy}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={[
                                    "h-4 w-4",
                                    dashboardQuery.isFetching &&
                                        !isSyncing
                                        ? "animate-spin"
                                        : "",
                                ].join(" ")}
                            />

                            Yenile
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                void handleSync()
                            }
                            disabled={isBusy}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                className={[
                                    "h-4 w-4",
                                    isSyncing
                                        ? "animate-spin"
                                        : "",
                                ].join(" ")}
                            />

                            {isSyncing
                                ? "Güncelleniyor..."
                                : "API'den Güncelle"}
                        </button>
                    </div>
                </div>
            </div>

            {syncSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
                    {syncSuccess}
                </div>
            ) : null}

            {syncError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                        <div>
                            <h3 className="font-bold text-red-900">
                                API güncellemesi başarısız
                            </h3>

                            <p className="mt-1 text-sm text-red-700">
                                {syncError}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {dashboardQuery.isFetching && !isSyncing ? (
                <DashboardLoading />
            ) : null}
            {dashboardQuery.isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                        <div>
                            <h3 className="font-bold text-red-900">
                                Dashboard yüklenemedi
                            </h3>

                            <p className="mt-1 text-sm text-red-700">
                                {dashboardQuery.error instanceof
                                    Error
                                    ? dashboardQuery.error.message
                                    : "Veriler alınırken beklenmeyen bir hata oluştu."}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}

            {dashboard ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {dashboard.metrics.map(
                            (metric) => (
                                <MetricCard
                                    key={metric.key}
                                    metric={metric}
                                />
                            ),
                        )}
                    </div>

                    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
                            <div>
                                <h3 className="font-extrabold text-slate-950">
                                    Proje bazlı kârlılık
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    {dashboard.period.startDate}
                                    {" – "}
                                    {dashboard.period.endDate}
                                    {" dönemine ait "}
                                    {dashboard.projects.length}
                                    {" proje"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span
                                    className={[
                                        "h-2 w-2 rounded-full",
                                        dashboard.system.api ===
                                            "online"
                                            ? "bg-emerald-500"
                                            : "bg-amber-500",
                                    ].join(" ")}
                                />

                                API: {dashboard.system.api}
                            </div>
                        </div>

                        <ProjectTable
                            projects={dashboard.projects}
                            startDate={dashboard.period.startDate}
                            endDate={dashboard.period.endDate}
                        />
                    </article>
                </>
            ) : null}
        </section>
    );
}









