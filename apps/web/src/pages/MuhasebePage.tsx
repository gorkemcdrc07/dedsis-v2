import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Database, LoaderCircle, RefreshCw, Trash2, WalletCards } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { parseMuhasebeExcel } from "../features/muhasebe/utils/muhasebeParser";
import { createMuhasebeImport, deleteMuhasebePeriod, getMuhasebeImports, getMuhasebeKayitlari, getMuhasebeStats, saveMuhasebeDistribution } from "../features/muhasebe/api/muhasebe.api";
import { getEmployeeProjects } from "../features/employee-projects/employee-projects.api";
import type { MuhasebeRow } from "../features/muhasebe/types";
import { MuhasebeUploadPanel } from "../features/muhasebe/components/MuhasebeUploadPanel";
import { MuhasebeTable } from "../features/muhasebe/components/MuhasebeTable";
import { MuhasebeProcessModal } from "../features/muhasebe/components/MuhasebeProcessModal";
import { MuhasebeDistributionDrawer } from "../features/muhasebe/components/MuhasebeDistributionDrawer";
import { MuhasebeDashboard } from "../features/muhasebe/components/MuhasebeDashboard";
import { hasPermission, type CurrentSession } from "../features/auth/auth";

const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
type ImportRow = { id: string | number; dosya_adi: string; kayit_sayisi: number; created_at?: string };

export default function MuhasebePage() {
  const session = useOutletContext<CurrentSession>();
  const today = new Date();
  const [rows, setRows] = useState<MuhasebeRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [distributionOpen, setDistributionOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [process, setProcess] = useState({ open: false, title: "", message: "", percent: 0 });
  const canDelete = hasPermission(session, "accounting.delete");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [records, stat, history, projectData] = await Promise.all([
        getMuhasebeKayitlari({ ay: selectedMonth, yil: selectedYear }), getMuhasebeStats({ ay: selectedMonth, yil: selectedYear }),
        getMuhasebeImports({ ay: selectedMonth, yil: selectedYear }), getEmployeeProjects(),
      ]);
      setRows(records as MuhasebeRow[]); setStats((stat as any).data ?? stat);
      setImports(history as ImportRow[]); setProjects(projectData.projects ?? []); setSelectedIds([]);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Muhasebe verileri alınamadı."); }
    finally { setLoading(false); }
  }, [selectedMonth, selectedYear]);

  useEffect(() => { void load(); }, [load]);

  async function upload(file: File, ay: number, yil: number) {
    try {
      setProcess({ open: true, title: "Excel okunuyor", message: "Muhasebe kayıtları kontrol ediliyor.", percent: 20 });
      const result = await parseMuhasebeExcel(file);
      if (!result.rows.length) throw new Error("Dosyada aktarılabilecek kayıt bulunamadı.");
      setProcess({ open: true, title: "Kayıtlar aktarılıyor", message: `${result.rows.length.toLocaleString("tr-TR")} kayıt kaydediliyor.`, percent: 60 });
      await createMuhasebeImport({ dosyaAdi: file.name, rows: result.rows, donemAy: ay, donemYil: yil });
      setProcess({ open: true, title: "Aktarım tamamlandı", message: `${result.rows.length.toLocaleString("tr-TR")} kayıt eklendi.`, percent: 100 });
      toast.success("Muhasebe dosyası aktarıldı."); await load();
    } catch (error) { setProcess((value) => ({ ...value, open: false })); toast.error(error instanceof Error ? error.message : "Dosya aktarılamadı."); }
  }

  async function removePeriod() {
    const label = `${monthNames[selectedMonth - 1]} ${selectedYear}`;
    if (!window.confirm(`${label} dönemine ait tüm muhasebe kayıtları ve dağıtımları kalıcı olarak silinecek. Devam edilsin mi?`)) return;
    setDeleting(true);
    try { const result = await deleteMuhasebePeriod(selectedMonth, selectedYear); toast.success(`${result.deletedRecords.toLocaleString("tr-TR")} kayıt silindi.`); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Dönem silinemedi."); }
    finally { setDeleting(false); }
  }

  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.includes(String(row.id))), [rows, selectedIds]);
  async function distribute(distribution: any[]) {
    setProcess({ open: true, title: "Dağıtım yapılıyor", message: "Kayıtlar projelere dağıtılıyor.", percent: 50 });
    try { await saveMuhasebeDistribution({ records: selectedRows, distribution }); setProcess({ open: true, title: "Tamamlandı", message: "Dağıtım tamamlandı.", percent: 100 }); setSelectedIds([]); await load(); }
    catch (error) { setProcess((value) => ({ ...value, open: false })); toast.error(error instanceof Error ? error.message : "Dağıtım yapılamadı."); }
  }

  const uploadedCount = imports.reduce((sum, item) => sum + Number(item.kayit_sayisi || 0), 0);

  return <div className="space-y-6">
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-blue-300/20"><WalletCards className="h-4 w-4" />Finans operasyon merkezi</div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Muhasebe Yönetimi</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Dönem seçin, kayıtları aktarın ve proje dağılımlarını tek merkezden yönetin.</p></div><div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><label className="text-xs font-bold text-slate-300">Ay<select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="mt-1 block h-11 min-w-32 rounded-xl border border-white/10 bg-slate-800 px-3 text-sm font-bold text-white">{monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label><label className="text-xs font-bold text-slate-300">Yıl<select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="mt-1 block h-11 min-w-28 rounded-xl border border-white/10 bg-slate-800 px-3 text-sm font-bold text-white">{Array.from({ length: 7 }, (_, i) => today.getFullYear() - 3 + i).map((year) => <option key={year}>{year}</option>)}</select></label><button onClick={() => void load()} className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="Yenile"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div></div></section>

    <MuhasebeUploadPanel ay={selectedMonth} yil={selectedYear} busy={process.open && process.percent < 100} onUpload={upload} />

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black"><Database className="h-5 w-5 text-blue-600" />{monthNames[selectedMonth - 1]} {selectedYear} yüklemeleri</h3><p className="mt-1 text-sm text-slate-500">Bu döneme yüklenen dosyaları toplu olarak takip edin.</p></div><div className="flex flex-wrap gap-3"><span className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">{imports.length} dosya</span><span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">{uploadedCount.toLocaleString("tr-TR")} kayıt</span>{canDelete && imports.length ? <button onClick={() => void removePeriod()} disabled={deleting} className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60">{deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Dönemi toplu sil</button> : null}</div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{imports.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 hover:border-blue-200"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate text-sm font-bold">{item.dosya_adi}</span><span className="text-xs text-slate-500">{Number(item.kayit_sayisi).toLocaleString("tr-TR")} kayıt{item.created_at ? ` · ${new Date(item.created_at).toLocaleDateString("tr-TR")}` : ""}</span></span></div>)}{!imports.length ? <div className="col-span-full rounded-2xl border border-dashed py-9 text-center text-sm text-slate-400">Bu dönem için dosya yüklenmemiş.</div> : null}</div></section>

    {loading ? <div className="grid min-h-64 place-items-center rounded-3xl border bg-white"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600" /></div> : <><MuhasebeDashboard stats={stats} pending={rows.length} distributed={Math.max(0, (stats?.totalCount ?? 0) - rows.length)} />{selectedIds.length > 0 ? <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl bg-blue-600 p-4 text-white shadow-xl"><span className="font-black">{selectedIds.length} kayıt seçildi</span><button onClick={() => setDistributionOpen(true)} className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-blue-700">Projelere dağıt</button></div> : null}<div><div className="mb-3 flex items-center justify-between"><div><h3 className="text-lg font-black">Dağıtım bekleyen kayıtlar</h3><p className="text-sm text-slate-500">{rows.length.toLocaleString("tr-TR")} kayıt listeleniyor.</p></div><CalendarDays className="h-5 w-5 text-slate-400" /></div><MuhasebeTable rows={rows} selectedIds={selectedIds} onSelectionChange={setSelectedIds} /></div></>}
    <MuhasebeProcessModal open={process.open} title={process.title} message={process.message} percent={process.percent} onClose={() => setProcess({ ...process, open: false })} />
    <MuhasebeDistributionDrawer open={distributionOpen} onClose={() => setDistributionOpen(false)} rows={selectedRows} projects={projects} onSave={async(distribution:any) => { await distribute(distribution); setDistributionOpen(false); }} />
  </div>;
}
