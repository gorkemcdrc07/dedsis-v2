import {
  Activity,
  ArrowUpRight,
  Clock3,
  Database,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

type PlaceholderPageProps = {
  title: string;
};

const metrics = [
  {
    label: "Toplam Evrak",
    value: "1.284",
    change: "+12,4%",
    icon: FileText,
  },
  {
    label: "Aktif Sefer",
    value: "186",
    change: "+8,1%",
    icon: Truck,
  },
  {
    label: "Bekleyen İşlem",
    value: "27",
    change: "-4,6%",
    icon: Clock3,
  },
  {
    label: "Aktif Kullanıcı",
    value: "18",
    change: "+2",
    icon: Users,
  },
];

export function PlaceholderPage({
  title,
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative px-6 py-7 lg:px-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                DEDSİS V2
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Hoş geldiniz
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {title} ekranı üzerinden operasyonel süreçleri,
                kullanıcı işlemlerini ve sistem durumunu tek
                merkezden takip edebilirsiniz.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Hızlı işlem
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {metric.change}
                </span>
              </div>

              <div className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                {metric.value}
              </div>

              <div className="mt-1 text-sm font-medium text-slate-500">
                {metric.label}
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 className="font-bold text-slate-950">
                Son işlemler
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Sistemde gerçekleşen son hareketler
              </p>
            </div>

            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Tümünü görüntüle
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              ["Evrak kaydı oluşturuldu", "2 dakika önce"],
              ["Kullanıcı rolü güncellendi", "18 dakika önce"],
              ["Sefer bilgisi düzenlendi", "36 dakika önce"],
              ["Rapor dışa aktarıldı", "1 saat önce"],
            ].map(([label, time]) => (
              <div
                key={label}
                className="flex items-center gap-4 px-6 py-4"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Activity className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-950">
              Sistem durumu
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Servislerin anlık çalışma durumu
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              ["API Servisi", Activity],
              ["Supabase", Database],
              ["Yetkilendirme", ShieldCheck],
              ["Web Uygulaması", LayoutDashboard],
            ].map(([label, Icon]) => {
              const StatusIcon = Icon as typeof Activity;

              return (
                <div
                  key={String(label)}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <StatusIcon className="h-4 w-4 text-slate-500" />

                  <span className="flex-1 text-sm font-medium text-slate-700">
                    {String(label)}
                  </span>

                  <span className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Çalışıyor
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}

