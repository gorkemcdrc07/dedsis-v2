import { useMemo, useState } from "react";
import { CalendarDays, LoaderCircle, Plus, Sofa } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { hasPermission, type CurrentSession } from "../features/auth/auth";
import type { EvideaDelivery } from "../features/evidea/types";
import { useEvideaDeliveries } from "../features/evidea/hooks/useEvideaDeliveries";
import { EvideaStats } from "../features/evidea/components/EvideaStats";
import { EvideaTable } from "../features/evidea/components/EvideaTable";
import { EvideaFilters } from "../features/evidea/components/EvideaFilters";
import { EvideaCreateModal } from "../features/evidea/components/EvideaCreateModal";
import { EvideaDetailDrawer } from "../features/evidea/components/EvideaDetailDrawer";
import { useCreateEvideaDelivery, useUpdateEvideaDelivery } from "../features/evidea/hooks/useEvideaMutations";

const today=()=>new Date().toISOString().split("T")[0] ?? "";
export default function EvideaPage(){
  const session=useOutletContext<CurrentSession>(); const [date,setDate]=useState(today()); const [createOpen,setCreateOpen]=useState(false); const [status,setStatus]=useState(""); const [search,setSearch]=useState(""); const [selected,setSelected]=useState<EvideaDelivery|null>(null);
  const {data=[],loading}=useEvideaDeliveries(date); const createMutation=useCreateEvideaDelivery(); const updateMutation=useUpdateEvideaDelivery();
  const canCreate=hasPermission(session,"evidea.create"); const canEdit=hasPermission(session,"evidea.edit");
  const filtered=useMemo(()=>{const text=search.toLocaleLowerCase("tr-TR");return data.filter((item)=>(!status||item.seyir_durumu===status)&&(!text||`${item.plaka??""} ${item.surucu_adi_soyadi??""} ${item.varis_noktasi??""}`.toLocaleLowerCase("tr-TR").includes(text)))},[data,status,search]);
  const summary=useMemo(()=>({total:data.length,moving:data.filter((x)=>x.seyir_durumu==="Yolda").length,completed:data.filter((x)=>x.seyir_durumu==="Teslim Edildi").length,waiting:data.filter((x)=>x.seyir_durumu==="Beklemede").length}),[data]);
  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-6 text-white shadow-xl shadow-blue-100 sm:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"/><div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200 ring-1 ring-blue-300/20"><Sofa className="h-4 w-4"/>Evidea lojistik merkezi</div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Teslimat Operasyonları</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Araçların günlük teslimat akışını, sürücüleri ve güncel seyir durumunu tek ekrandan yönetin.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold"><CalendarDays className="h-5 w-5 text-blue-300"/><input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="bg-transparent text-white outline-none [color-scheme:dark]"/></label>{canCreate?<button onClick={()=>setCreateOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black shadow-lg shadow-blue-950 transition hover:-translate-y-0.5 hover:bg-blue-500"><Plus className="h-5 w-5"/>Yeni teslimat</button>:null}</div></div></section>
    <EvideaStats total={summary.total} waiting={summary.waiting} moving={summary.moving} completed={summary.completed}/>
    <EvideaFilters status={status} search={search} onStatusChange={setStatus} onSearchChange={setSearch} onClear={()=>{setStatus("");setSearch("")}}/>
    <div className="flex items-center justify-between px-1"><div><h3 className="text-lg font-black text-slate-950">Günlük teslimat listesi</h3><p className="mt-1 text-sm text-slate-500">{filtered.length} kayıt gösteriliyor</p></div>{loading?<LoaderCircle className="h-5 w-5 animate-spin text-blue-600"/>:null}</div>
    {loading?<div className="grid min-h-72 place-items-center rounded-3xl border bg-white"><LoaderCircle className="h-8 w-8 animate-spin text-blue-600"/></div>:<EvideaTable deliveries={filtered} onDetail={setSelected} onStatusChange={(id,next)=>{if(canEdit)updateMutation.mutate({id,payload:{seyir_durumu:next}})}}/>}
    <EvideaCreateModal open={createOpen} loading={createMutation.isPending} onClose={()=>setCreateOpen(false)} onSave={async(payload)=>{try{await createMutation.mutateAsync([payload]);setCreateOpen(false);toast.success("Evidea teslimatı oluşturuldu.")}catch{toast.error("Teslimat oluşturulamadı.")}}}/>
    <EvideaDetailDrawer open={!!selected} delivery={selected} onClose={()=>setSelected(null)}/>
  </div>;
}
