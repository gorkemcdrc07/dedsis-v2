import { ArrowDownRight, ArrowUpRight, Route, Sparkles, WalletCards } from "lucide-react";
import type { DashboardProjectSourceDetail } from "../dashboard.api";

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function AmountTile({ label, value, tone }: { label: string; value: number; tone: "green" | "red" | "blue" | "slate" }) {
  const styles = { green: "bg-emerald-50 text-emerald-700", red: "bg-rose-50 text-rose-700", blue: "bg-blue-50 text-blue-700", slate: "bg-slate-100 text-slate-700" };
  return <div className={`rounded-2xl p-3 ${styles[tone]}`}><span className="block text-[10px] font-black uppercase tracking-wider opacity-70">{label}</span><strong className="mt-1 block truncate text-sm font-black" title={formatCurrency(value)}>{formatCurrency(value)}</strong></div>;
}

export function ReelOperationCard({ data }: { data?: DashboardProjectSourceDetail["reel"] }) {
  if (!data) return <div className="grid min-h-56 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center"><div><Route className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-black text-slate-700">Reel operasyon verisi yok</p><p className="mt-1 text-xs text-slate-400">Bu dönem için gelir veya gider kaydı bulunamadı.</p></div></div>;
  const services = data.hizmetDetay ?? [];
  const profitRate = data.toplamGelir > 0 ? (data.kar / data.toplamGelir) * 100 : 0;
  return <article className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-white via-blue-50/70 to-emerald-50/60 shadow-sm">
    <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
    <header className="relative flex items-start justify-between gap-4 border-b border-blue-100/80 p-5">
      <div><div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-blue-600"><Sparkles className="h-3.5 w-3.5" />Canlı operasyon</div><h5 className="mt-1 text-lg font-black text-slate-950">Reel veriler</h5><p className="mt-1 text-xs text-slate-500">Gelir, gider ve hizmet kârlılığı</p></div>
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200"><WalletCards className="h-5 w-5" /></span>
    </header>
    <div className="relative p-5">
      <div className="grid grid-cols-2 gap-2"><AmountTile label="Satış" value={data.gelir?.satis ?? 0} tone="green" /><AmountTile label="Alış" value={data.gelir?.alis ?? 0} tone="blue" /><AmountTile label="Hizmet gideri" value={data.gider?.hizmet ?? 0} tone="red" /><AmountTile label="Masraf" value={data.gider?.masraf ?? 0} tone="slate" /></div>
      <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-300"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold text-slate-300">{data.kar >= 0 ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-rose-400" />}Net kâr</span><span className={`rounded-full px-2 py-1 text-[10px] font-black ${data.kar >= 0 ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>%{profitRate.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span></div><strong className="mt-2 block text-2xl font-black">{formatCurrency(data.kar ?? 0)}</strong></div>
      <div className="mt-4"><div className="mb-2 flex items-center justify-between"><h6 className="text-xs font-black uppercase tracking-wider text-slate-500">Hizmet dağılımı</h6><span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500 shadow-sm">{services.length} kalem</span></div>{services.length ? <div className="max-h-80 space-y-2 overflow-y-auto pr-1">{services.map((item, index) => {
        const profit = Number(item.kar ?? (Number(item.satis ?? 0) - Number(item.alis ?? 0)));
        const margin = Number(item.satis ?? 0) > 0 ? (profit / Number(item.satis)) * 100 : 0;
        return <div key={`${item.isim}-${index}`} className="rounded-2xl border border-white bg-white/90 p-3 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-black text-slate-800">{item.isim || "Hizmet"}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${profit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>%{margin.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><ServiceAmount label="Satış" value={item.satis} tone="green" /><ServiceAmount label="Alış" value={item.alis} tone="blue" /><ServiceAmount label="Ek gider" value={Number(item.hizmet ?? 0) + Number(item.masraf ?? 0)} tone="red" /><ServiceAmount label="Kâr" value={profit} tone={profit >= 0 ? "dark" : "red"} /></div></div>;
      })}</div> : <p className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-4 text-center text-xs text-slate-400">Hizmet detayı bulunamadı.</p>}</div>
    </div>
  </article>;
}

function ServiceAmount({ label, value, tone }: { label: string; value?: number; tone: "green" | "blue" | "red" | "dark" }) {
  const styles = { green: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", red: "bg-rose-50 text-rose-700", dark: "bg-slate-950 text-white" };
  return <div className={`min-w-0 rounded-xl p-2 ${styles[tone]}`}><span className="block text-[9px] font-bold uppercase tracking-wide opacity-70">{label}</span><strong className="mt-1 block truncate text-[11px] font-black" title={formatCurrency(Number(value ?? 0))}>{formatCurrency(Number(value ?? 0))}</strong></div>;
}
