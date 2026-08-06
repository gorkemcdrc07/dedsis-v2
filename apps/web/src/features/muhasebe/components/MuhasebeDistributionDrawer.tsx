import { useEffect, useMemo, useState } from "react";
import { Calculator, Check, ChevronRight, Equal, PieChart, Plus, Search, Trash2, X } from "lucide-react";
import type { MuhasebeRow } from "../types";

type Project = { id:number; display_name:string };
type Distribution = { projectId:number; rate:number };
type Props = { open:boolean; onClose:()=>void; rows:MuhasebeRow[]; projects:Project[]; onSave:(data:Distribution[])=>void };
const money = (value:number) => value.toLocaleString("tr-TR", { style:"currency", currency:"TRY" });

export function MuhasebeDistributionDrawer({ open, onClose, rows, projects, onSave }:Props){
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { if(open){ setDistribution([]); setQuery(""); } }, [open, rows]);
  const total = useMemo(() => rows.reduce((sum, row) => sum + Number(row.borc || row.alacak || 0), 0), [rows]);
  const totalRate = Number(distribution.reduce((sum, item) => sum + Number(item.rate), 0).toFixed(2));
  const valid = distribution.length > 0 && Math.abs(totalRate - 100) <= 0.01;
  const available = projects.filter((project) => !distribution.some((item) => item.projectId === project.id) && project.display_name.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))).slice(0, 8);

  function addProject(projectId:number){ setDistribution((current) => [...current, { projectId, rate: 0 }]); setQuery(""); }
  function updateRate(projectId:number, rate:number){ setDistribution((current) => current.map((item) => item.projectId === projectId ? { ...item, rate: Math.max(0, Math.min(100, rate || 0)) } : item)); }
  function equalize(){
    if(!distribution.length) return;
    const rate = Number((100 / distribution.length).toFixed(2));
    setDistribution((current) => current.map((item, index) => ({ ...item, rate: index === current.length - 1 ? Number((100 - rate * (current.length - 1)).toFixed(2)) : rate })));
  }
  if(!open) return null;

  return <div className="fixed inset-0 z-[130] bg-slate-950/50 backdrop-blur-sm" onMouseDown={(event) => { if(event.target === event.currentTarget) onClose(); }}>
    <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl animate-[slide-in_.3s_ease-out] flex-col overflow-hidden bg-slate-50 shadow-2xl shadow-slate-950/30">
      <header className="relative overflow-hidden bg-slate-950 px-6 py-6 text-white sm:px-8"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-blue-600/20 blur-2xl" /><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white" aria-label="Kapat"><X className="h-4 w-4" /></button><div className="relative flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950"><PieChart className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-widest text-blue-300">Akıllı dağıtım</p><h2 className="mt-1 text-2xl font-black">Projelere dağıt</h2><p className="mt-1 text-sm text-slate-400">{rows.length} muhasebe kaydı seçildi</p></div></div></header>
      <div className="flex-1 overflow-y-auto p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-400">Dağıtılacak toplam</p><p className="mt-2 text-xl font-black text-slate-950">{money(total)}</p></div><div className={`rounded-2xl border p-4 ${valid ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><p className={`text-xs font-bold ${valid ? "text-emerald-600" : "text-amber-600"}`}>Toplam dağıtım oranı</p><p className={`mt-2 text-xl font-black ${valid ? "text-emerald-700" : "text-amber-700"}`}>%{totalRate}</p></div></div>
        <div className="mt-6"><div className="flex items-end justify-between"><div><h3 className="font-black text-slate-900">Proje seçimi</h3><p className="mt-1 text-xs text-slate-500">Dağıtıma dahil edilecek projeleri ekleyin.</p></div>{distribution.length > 1 ? <button onClick={equalize} className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 hover:bg-blue-100"><Equal className="h-4 w-4" />Eşit paylaştır</button> : null}</div>
          <div className="relative mt-3"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Proje adıyla ara ve ekle..." className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></div>
          {query ? <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">{available.map((project) => <button key={project.id} onClick={() => addProject(project.id)} className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm font-bold text-slate-700 last:border-0 hover:bg-blue-50 hover:text-blue-700"><span>{project.display_name}</span><Plus className="h-4 w-4" /></button>)}{!available.length ? <p className="p-4 text-center text-sm text-slate-400">Eşleşen proje bulunamadı.</p> : null}</div> : null}
        </div>
        <div className="mt-5 space-y-3">{distribution.map((item, index) => { const project = projects.find((candidate) => candidate.id === item.projectId); return <div key={item.projectId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-800">{project?.display_name}</p><p className="mt-0.5 text-xs font-semibold text-emerald-600">{money(total * item.rate / 100)}</p></div><div className="relative"><input type="number" min="0" max="100" step="0.01" value={item.rate} onChange={(event) => updateRate(item.projectId, Number(event.target.value))} className="h-10 w-24 rounded-xl border border-slate-200 pr-7 text-center text-sm font-black outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span></div><button onClick={() => setDistribution((current) => current.filter((row) => row.projectId !== item.projectId))} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Projeyi kaldır"><Trash2 className="h-4 w-4" /></button></div><input type="range" min="0" max="100" step="0.1" value={item.rate} onChange={(event) => updateRate(item.projectId, Number(event.target.value))} className="mt-4 h-1.5 w-full cursor-pointer accent-blue-600" /></div>})}{!distribution.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center"><Calculator className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-500">Henüz proje eklenmedi</p></div> : null}</div>
      </div>
      <footer className="border-t border-slate-200 bg-white p-5 sm:px-7"><div className="mb-3 flex items-center justify-between text-xs font-bold"><span className={valid ? "text-emerald-600" : "text-slate-500"}>{valid ? <span className="flex items-center gap-1"><Check className="h-4 w-4" />Dağıtım hazır</span> : `Tamamlanması için %${Math.max(0, 100 - totalRate).toFixed(2)} kaldı`}</span><span className="text-slate-400">Toplam %100 olmalı</span></div><button disabled={!valid} onClick={() => onSave(distribution)} className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:hover:translate-y-0">Dağıtımı başlat <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" /></button></footer>
    </aside>
  </div>;
}
