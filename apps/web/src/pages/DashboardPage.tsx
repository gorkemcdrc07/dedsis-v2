import { DashboardLoading } from "./DashboardLoading";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    BriefcaseBusiness,
    CalendarDays,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Filter,
    LoaderCircle,
    PackageCheck,
    RefreshCw,
    Search,
    Sparkles,
    TrendingUp,
} from "lucide-react";
import {
    Fragment,
    useMemo,
    useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import type {
    DashboardMetric,
    DashboardProjectRow,
} from "@dedsis/contracts";
import {
    getDashboardProjectDetail,
    getSyncJob,
    syncDashboard,
    getDashboardProjectSourceDetail,
} from "../features/dashboard/dashboard.api";

import { useDashboard } from "../features/dashboard/useDashboard";
import { ReelOperationCard } from "../features/dashboard/components/ReelOperationCard";

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

function getMetricStyle(key: string) {
    switch (key) {
        case "shipments":
            return {
                icon: "bg-blue-50 text-blue-700",
                border: "border-blue-100",
            };

        case "revenue":
            return {
                icon: "bg-emerald-50 text-emerald-700",
                border: "border-emerald-100",
            };

        case "expense":
            return {
                icon: "bg-rose-50 text-rose-700",
                border: "border-rose-100",
            };

        case "profit":
            return {
                icon: "bg-green-50 text-green-700",
                border: "border-green-100",
            };

        case "profitRate":
            return {
                icon: "bg-purple-50 text-purple-700",
                border: "border-purple-100",
            };

        case "projects":
            return {
                icon: "bg-orange-50 text-orange-700",
                border: "border-orange-100",
            };

        default:
            return {
                icon: "bg-slate-100 text-slate-700",
                border: "border-slate-200",
            };
    }
}

function MetricCard({
    metric,
}: {
    metric: DashboardMetric;
}) {
    const Icon = getMetricIcon(metric.key);
    const style = getMetricStyle(metric.key);

    const isPositive =
        metric.changeRate === null ||
        metric.changeRate >= 0;

    return (
        <article className={["rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md", style.border].join(" ")}>
            <div className="flex items-start justify-between gap-4">
                <div className={["grid h-11 w-11 place-items-center rounded-xl", style.icon].join(" ")}>
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
    navigate,
}: {
    projects: DashboardProjectRow[];
    startDate: string;
    endDate: string;
    navigate: ReturnType<typeof useNavigate>;
}) {
    const [
        expandedProjectId,
        setExpandedProjectId,
    ] = useState<string | null>(null);
    const [sortMode, setSortMode] =
        useState<
            "profit" | "shipment" | "revenue" | "risk"
        >("profit");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState<
            "all" | "healthy" | "follow" | "risk"
        >("all");

    function getProjectStatus(rate: number) {
        if (rate >= 20) {
            return {
                text: "Sağlıklı",
                className:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            };
        }

        if (rate >= 5) {
            return {
                text: "Takip",
                className:
                    "bg-amber-50 text-amber-700 border-amber-200",
            };
        }

        return {
            text: "Risk",
            className:
                "bg-rose-50 text-rose-700 border-rose-200",
        };
    }


    const projectSourceDetailQuery = useQuery({

        queryKey: [
            "dashboard-project-source-detail",
            expandedProjectId,
            startDate,
            endDate,
        ],

        queryFn: () => {

            if (!expandedProjectId) {
                throw new Error("Proje seçilmedi.");
            }


            return getDashboardProjectSourceDetail(
                expandedProjectId,
                startDate,
                endDate,
            );

        },

        enabled:
            Boolean(expandedProjectId) &&
            Boolean(startDate) &&
            Boolean(endDate),

    });

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

    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.projectName
                .toLocaleLowerCase("tr-TR")
                .includes(
                    searchTerm.toLocaleLowerCase("tr-TR"),
                );

        const status = getProjectStatus(
            project.profitRate,
        );

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "healthy" &&
                status.text === "Sağlıklı") ||
            (statusFilter === "follow" &&
                status.text === "Takip") ||
            (statusFilter === "risk" &&
                status.text === "Risk");

        return (
            matchesSearch &&
            matchesStatus
        );
    });

    const sortedProjects = filteredProjects
        .slice()
        .sort((a, b) => {
            switch (sortMode) {
                case "shipment":
                    return (
                        b.shipmentCount -
                        a.shipmentCount
                    );

                case "revenue":
                    return (
                        b.revenue -
                        a.revenue
                    );

                case "risk":
                    return (
                        a.profitRate -
                        b.profitRate
                    );

                case "profit":
                default:
                    return (
                        b.profit -
                        a.profit
                    );
            }
        });

    if (sortedProjects.length === 0) {
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
        <div>
            <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Proje adına göre ara..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500">
                        <option value="all">Tüm durumlar</option><option value="healthy">Sağlıklı</option><option value="follow">Takip</option><option value="risk">Risk</option>
                    </select>
                    <select value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500">
                        <option value="profit">Kâra göre sırala</option><option value="revenue">Gelire göre sırala</option><option value="shipment">Sefere göre sırala</option><option value="risk">Riske göre sırala</option>
                    </select>
                    <span className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700">{sortedProjects.length} proje</span>
                </div>
            </div>
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

                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Durum
                        </th>         </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                    {sortedProjects.map((project) => {
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
                                            onClick={(event) => {
                                                event.stopPropagation();

                                                navigate(
                                                    `/operasyon-kayitlari?projectName=${encodeURIComponent(project.projectName)}`
                                                );
                                            }}
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
                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                        <span className={["inline-flex rounded-full border px-2.5 py-1 text-xs font-black", getProjectStatus(project.profitRate).className].join(" ")}>
                                            {getProjectStatus(project.profitRate).text}
                                        </span>
                                    </td>
                                </tr>

                                {isExpanded ? (

                                    <tr>

                                        <td
                                            colSpan={8}
                                            className="bg-gradient-to-b from-blue-50/70 to-slate-50 px-5 py-6"
                                        >
                                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600"><BriefcaseBusiness className="h-4 w-4" />Proje maliyet merkezi</div><h4 className="mt-1 text-lg font-black text-slate-950">{project.projectName} ayrıntıları</h4><p className="mt-1 text-xs text-slate-500">İnsan Kaynakları, muhasebe ve reel operasyon verileri tek görünümde.</p></div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="rounded-xl border border-white bg-white/90 px-3 py-2 shadow-sm"><span className="block text-[10px] font-bold text-slate-400">GELİR</span><b className="text-xs text-emerald-700">{formatCurrency(project.revenue)}</b></div>
                                                    <div className="rounded-xl border border-white bg-white/90 px-3 py-2 shadow-sm"><span className="block text-[10px] font-bold text-slate-400">GİDER</span><b className="text-xs text-rose-700">{formatCurrency(project.expense)}</b></div>
                                                    <div className="rounded-xl border border-white bg-white/90 px-3 py-2 shadow-sm"><span className="block text-[10px] font-bold text-slate-400">NET KÂR</span><b className={project.profit >= 0 ? "text-xs text-emerald-700" : "text-xs text-rose-700"}>{formatCurrency(project.profit)}</b></div>
                                                </div>
                                            </div>
                                            {projectSourceDetailQuery.isLoading ? <div className="mb-4 flex items-center gap-2 rounded-2xl border border-blue-100 bg-white p-4 text-sm font-bold text-blue-700"><LoaderCircle className="h-4 w-4 animate-spin" />Kaynak ayrıntıları hazırlanıyor...</div> : null}
                                            {projectSourceDetailQuery.isError ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">Proje kaynak ayrıntıları alınamadı.</div> : null}

                                            <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
            ">


                                                <div className="
                    rounded-3xl
                    border border-slate-200/80
                    bg-white
                    p-5 shadow-sm
                ">

                                                    <h4 className="
                        font-bold
                        text-slate-900
                        mb-4
                    ">
                                                        İnsan Kaynakları
                                                    </h4>


                                                    <div className="space-y-3 text-sm">

                                                        {
                                                            projectSourceDetailQuery.data?.ik?.length
                                                                ?
                                                                projectSourceDetailQuery.data.ik.map(
                                                                    (item: any, index: number) => (
                                                                        <div
                                                                            key={index}
                                                                            className="rounded-xl border border-slate-200 p-3"
                                                                        >

                                                                            <div className="font-bold text-slate-900">
                                                                                {item.personel}
                                                                            </div>

                                                                            <div className="flex justify-between mt-1 text-xs text-slate-500">

                                                                                <span>
                                                                                    Dağılım %{item.oran}
                                                                                </span>

                                                                                <b className="text-slate-900">
                                                                                    {formatCurrency(item.tutar)}
                                                                                </b>

                                                                            </div>

                                                                        </div>
                                                                    )
                                                                )
                                                                :
                                                                <div className="text-sm text-slate-500">
                                                                    IK dağılımı bulunamadı.
                                                                </div>
                                                        }


                                                        <div className="
    mt-4
    pt-3
    border-t
    text-sm
    font-bold
    text-slate-900
">
                                                            IK Toplam:
                                                            {" "}
                                                            {formatCurrency(
                                                                projectSourceDetailQuery.data?.toplamlar?.ik ?? 0
                                                            )}
                                                        </div>


                                                    </div>
                                                </div>



                                                <div className="
                    rounded-3xl
                    border border-slate-200/80
                    bg-white
                    p-5 shadow-sm
                ">

                                                    <h4 className="
                        font-bold
                        text-slate-900
                        mb-4
                    ">
                                                        Muhasebe
                                                    </h4>


                                                    <div className="space-y-3 text-sm">

                                                        {
                                                            projectSourceDetailQuery.data?.muhasebe?.length
                                                                ?
                                                                projectSourceDetailQuery.data.muhasebe.map(
                                                                    (item: any, index: number) => (
                                                                        <div
                                                                            key={index}
                                                                            className="rounded-xl border border-slate-200 p-3"
                                                                        >

                                                                            <div className="font-bold text-slate-900">
                                                                                {item.hesap}
                                                                            </div>


                                                                            <div className="mt-1 text-xs text-slate-500">
                                                                                {item.aciklama}
                                                                            </div>


                                                                            <div className="flex justify-between mt-2 text-xs">

                                                                                <span>
                                                                                    %{item.oran}
                                                                                </span>


                                                                                <b className="text-slate-900">
                                                                                    {formatCurrency(
                                                                                        Number(item.tutar ?? 0)
                                                                                    )}
                                                                                </b>

                                                                            </div>

                                                                        </div>
                                                                    )
                                                                )
                                                                :
                                                                <div className="text-sm text-slate-500">
                                                                    Muhasebe dağılımı bulunamadı.
                                                                </div>
                                                        }


                                                        <div className="
    mt-4
    pt-3
    border-t
    text-sm
    font-bold
    text-slate-900
">
                                                            Muhasebe Toplam:
                                                            {" "}
                                                            {formatCurrency(
                                                                projectSourceDetailQuery.data?.toplamlar?.muhasebe ?? 0
                                                            )}
                                                        </div>


                                                    </div>


                                                    {/* GERÇEK OPERASYON CARD */}

                                                    <div
                                                        className="rounded-2xl border border-slate-200 bg-white p-5"
                                                    >

                                                        <ReelOperationCard
                                                            data={
                                                                projectSourceDetailQuery.data?.reel
                                                            }
                                                        />

                                                    </div>
                                                </div>

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
        </div>
    );
}

export function DashboardPage() {
    const navigate = useNavigate();
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
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                        {dashboard.metrics.map(
                            (metric) => (
                                <MetricCard
                                    key={metric.key}
                                    metric={metric}
                                />
                            ),
                        )}
                    </div>

                    <article className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
                        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white sm:px-8">
                            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                            <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                                    <Sparkles className="h-3.5 w-3.5" /> Canlı finans görünümü
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">
                                    Proje bazlı kârlılık
                                </h3>
                                <p className="mt-2 text-sm text-slate-300">
                                    {dashboard.period.startDate}
                                    {" – "}
                                    {dashboard.period.endDate}
                                    {" dönemine ait "}
                                    {dashboard.projects.length}
                                    {" proje"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 backdrop-blur">
                                <span
                                    className={[
                                        "h-2 w-2 rounded-full",
                                        dashboard.system.api ===
                                            "online"
                                            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.8)]"
                                            : "bg-amber-400",
                                    ].join(" ")}
                                />

                                Veri bağlantısı: {dashboard.system.api}
                            </div>
                            </div>
                        </div>

                        <ProjectTable
                            projects={dashboard.projects}
                            startDate={dashboard.period.startDate}
                            endDate={dashboard.period.endDate}
                            navigate={navigate}
                        />
                    </article>
                </>
            ) : null}
        </section>
    );
}



