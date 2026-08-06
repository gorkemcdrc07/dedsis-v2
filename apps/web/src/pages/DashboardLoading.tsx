import {
    BarChart3,
    Check,
    Database,
    Layers3,
    LoaderCircle,
    PieChart,
    Sparkles,
} from "lucide-react";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

type LoadingStep = {
    title: string;
    description: string;
    icon: typeof Database;
};

const loadingSteps: LoadingStep[] = [
    {
        title: "Sistem bağlantısı",
        description: "Veri kaynağına güvenli bağlantı kuruluyor.",
        icon: Database,
    },
    {
        title: "Sevkiyat kayıtları",
        description: "Seçilen döneme ait kayıtlar okunuyor.",
        icon: Layers3,
    },
    {
        title: "Proje eşleştirmeleri",
        description: "Sevkiyatlar proje bazında gruplandırılıyor.",
        icon: BarChart3,
    },
    {
        title: "Finansal hesaplamalar",
        description: "Gelir, gider ve kârlılık değerleri hesaplanıyor.",
        icon: PieChart,
    },
    {
        title: "Dashboard hazırlanıyor",
        description: "Kartlar ve tablolar görüntülenmeye hazırlanıyor.",
        icon: Sparkles,
    },
];

function LoadingSkeletonCard() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
            </div>

            <div className="mt-6 h-8 w-32 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
    );
}

function LoadingSkeletonTable() {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                <div>
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />

                    <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>

            <div className="overflow-hidden">
                <div className="grid grid-cols-[48px_1fr_90px_130px_130px_130px] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-3 animate-pulse rounded bg-slate-200"
                        />
                    ))}
                </div>

                {Array.from({ length: 4 }).map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="grid grid-cols-[48px_1fr_90px_130px_130px_130px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                    >
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />

                        <div>
                            <div
                                className={[
                                    "h-4 animate-pulse rounded bg-slate-200",
                                    rowIndex % 2 === 0
                                        ? "w-40"
                                        : "w-52",
                                ].join(" ")}
                            />

                            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
                        </div>

                        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-100" />

                        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-100" />

                        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-100" />

                        <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardLoading() {
    const [progress, setProgress] = useState(8);
    const [elapsedSeconds, setElapsedSeconds] =
        useState(0);

    useEffect(() => {
        const progressInterval = window.setInterval(() => {
            setProgress((currentProgress) => {
                if (currentProgress >= 92) {
                    return currentProgress;
                }

                const remaining = 92 - currentProgress;
                const increase = Math.max(
                    1,
                    Math.ceil(remaining * 0.08),
                );

                return Math.min(
                    currentProgress + increase,
                    92,
                );
            });
        }, 850);

        const elapsedInterval = window.setInterval(() => {
            setElapsedSeconds(
                (currentSeconds) =>
                    currentSeconds + 1,
            );
        }, 1000);

        return () => {
            window.clearInterval(progressInterval);
            window.clearInterval(elapsedInterval);
        };
    }, []);

    const activeStepIndex = useMemo(() => {
        if (progress < 20) {
            return 0;
        }

        if (progress < 42) {
            return 1;
        }

        if (progress < 62) {
            return 2;
        }

        if (progress < 82) {
            return 3;
        }

        return 4;
    }, [progress]);

    const activeStep =
        loadingSteps[activeStepIndex];

    const elapsedText =
        elapsedSeconds < 60
            ? `${elapsedSeconds} saniye`
            : `${Math.floor(elapsedSeconds / 60)} dk ${elapsedSeconds % 60
            } sn`;

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-slate-950 shadow-xl shadow-blue-950/10">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-24 h-72 w-72 animate-pulse rounded-full bg-blue-600/30 blur-3xl" />

                    <div className="absolute -bottom-32 right-0 h-80 w-80 animate-pulse rounded-full bg-cyan-500/20 blur-3xl [animation-delay:700ms]" />

                    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />
                </div>

                <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1fr_420px] lg:px-10 lg:py-10">
                    <div className="flex flex-col justify-center">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />

                                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                            </span>

                            DEDSİS veri işleme merkezi
                        </div>

                        <div className="mt-6 flex items-start gap-4">
                            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
                                <LoaderCircle className="h-8 w-8 animate-spin text-cyan-300" />

                                <div className="absolute inset-0 animate-ping rounded-2xl border border-cyan-300/20" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                                    Dashboard hazırlanıyor
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                                    Seçilen tarih aralığındaki operasyonel ve
                                    finansal kayıtlar analiz ediliyor. İşlem
                                    tamamlandığında dashboard otomatik olarak
                                    görüntülenecek.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="mb-3 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {activeStep.title}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {activeStep.description}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="text-2xl font-extrabold tabular-nums text-white">
                                        %{progress}
                                    </span>

                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                        Geçen süre: {elapsedText}
                                    </p>
                                </div>
                            </div>

                            <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/10">
                                <div
                                    className="relative h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-[width] duration-700 ease-out"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                >
                                    <div className="absolute inset-0 animate-[loading-shine_1.8s_linear_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                                <span>Başlatıldı</span>
                                <span>Veriler işleniyor</span>
                                <span>Tamamlanıyor</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl sm:p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-extrabold text-white">
                                    İşlem durumu
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Veriler aşamalı olarak hazırlanıyor
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-cyan-200">
                                {activeStepIndex + 1}/
                                {loadingSteps.length}
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {loadingSteps.map(
                                (step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted =
                                        index <
                                        activeStepIndex;
                                    const isActive =
                                        index ===
                                        activeStepIndex;

                                    return (
                                        <div
                                            key={step.title}
                                            className={[
                                                "flex items-center gap-3 rounded-xl border px-3 py-3 transition-all duration-500",
                                                isCompleted
                                                    ? "border-emerald-400/20 bg-emerald-400/10"
                                                    : isActive
                                                        ? "border-cyan-300/30 bg-cyan-300/10 shadow-lg shadow-cyan-950/20"
                                                        : "border-white/5 bg-white/[0.025]",
                                            ].join(
                                                " ",
                                            )}
                                        >
                                            <div
                                                className={[
                                                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                                                    isCompleted
                                                        ? "border-emerald-400/20 bg-emerald-400/20 text-emerald-300"
                                                        : isActive
                                                            ? "border-cyan-300/20 bg-cyan-300/15 text-cyan-200"
                                                            : "border-white/5 bg-white/5 text-slate-500",
                                                ].join(
                                                    " ",
                                                )}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-4 w-4" />
                                                ) : isActive ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Icon className="h-4 w-4" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p
                                                    className={[
                                                        "truncate text-xs font-bold",
                                                        isCompleted
                                                            ? "text-emerald-200"
                                                            : isActive
                                                                ? "text-white"
                                                                : "text-slate-500",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {
                                                        step.title
                                                    }
                                                </p>

                                                <p
                                                    className={[
                                                        "mt-0.5 truncate text-[11px]",
                                                        isCompleted
                                                            ? "text-emerald-300/70"
                                                            : isActive
                                                                ? "text-cyan-100/70"
                                                                : "text-slate-600",
                                                    ].join(
                                                        " ",
                                                    )}
                                                >
                                                    {isCompleted
                                                        ? "Tamamlandı"
                                                        : isActive
                                                            ? "Şu anda işleniyor"
                                                            : "Bekliyor"}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative border-t border-white/10 bg-white/[0.035] px-6 py-3 text-center backdrop-blur lg:px-10">
                    <p className="text-xs font-medium text-slate-400">
                        Büyük tarih aralıklarında işlem süresi uzayabilir.
                        Veriler tamamlanana kadar sayfayı kapatmayın.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                            Dashboard görünümü hazırlanıyor
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            Kartlar ve proje tablosu veri geldiğinde otomatik
                            olarak doldurulacak.
                        </p>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 sm:flex">
                        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        Canlı hazırlanıyor
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <LoadingSkeletonCard
                                key={index}
                            />
                        ),
                    )}
                </div>

                <LoadingSkeletonTable />
            </section>

            <style>
                {`
                    @keyframes loading-shine {
                        0% {
                            transform: translateX(-100%);
                        }

                        100% {
                            transform: translateX(100%);
                        }
                    }
                `}
            </style>
        </div>
    );
}