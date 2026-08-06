import { useMemo, useState } from "react";
import { CalendarDays, LoaderCircle, Plus, Truck } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { hasPermission, type CurrentSession } from "../features/auth/auth";
import type { BasbugDelivery } from "../features/basbug/types";
import { useBasbugDeliveries } from "../features/basbug/hooks/useBasbugDeliveries";
import { BasbugStats } from "../features/basbug/components/BasbugStats";
import { BasbugTable } from "../features/basbug/components/BasbugTable";
import { BasbugFilters } from "../features/basbug/components/BasbugFilters";
import { BasbugCreateModal } from "../features/basbug/components/BasbugCreateModal";
import { BasbugDetailDrawer } from "../features/basbug/components/BasbugDetailDrawer";
import { useCreateBasbugDelivery, useUpdateBasbugDelivery } from "../features/basbug/hooks/useBasbugMutations";

const today=()=>new Date().toISOString().split("T")[0] ?? "";
export default function BasbugPage(){
  const session=useOutletContext<CurrentSession>(); const [date,setDate]=useState(today()); const [createOpen,setCreateOpen]=useState(false); const [status,setStatus]=useState(""); const [search,setSearch]=useState(""); const [selected,setSelected]=useState<BasbugDelivery|null>(null);
  const {data=[],loading}=useBasbugDeliveries(date); const createMutation=useCreateBasbugDelivery(); const updateMutation=useUpdateBasbugDelivery();
  const canCreate=hasPermission(session,"basbug.create"); const canEdit=hasPermission(session,"basbug.edit");
  const filtered=useMemo(()=>{const text=search.toLocaleLowerCase("tr-TR");return data.filter((item)=>(!status||item.seyir_durumu===status)&&(!text||`${item.plaka??""} ${item.surucu_adi_soyadi??""} ${item.varis_noktasi??""}`.toLocaleLowerCase("tr-TR").includes(text)))},[data,status,search]);
  const summary=useMemo(()=>({total:data.length,moving:data.filter((x)=>x.seyir_durumu==="Yolda").length,completed:data.filter((x)=>x.seyir_durumu==="Teslim Edildi").length,waiting:data.filter((x)=>x.seyir_durumu==="Beklemede").length}),[data]);
  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-orange-950 to-slate-900 p-6 text-white shadow-xl shadow-orange-100 sm:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"/><div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-200 ring-1 ring-orange-300/20"><Truck className="h-4 w-4"/>Başbuğ sevkiyat merkezi</div><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Teslimat Operasyonları</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Günlük sevkiyatları, araç konumlarını ve teslim süreçlerini hızlı ve güvenli şekilde takip edin.</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold"><CalendarDays className="h-5 w-5 text-orange-300"/><input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="bg-transparent text-white outline-none [color-scheme:dark]"/></label>{canCreate?<button onClick={()=>setCreateOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-black shadow-lg shadow-orange-950 transition hover:-translate-y-0.5 hover:bg-orange-500"><Plus className="h-5 w-5"/>Yeni teslimat</button>:null}</div></div></section>
    <BasbugStats total={summary.total} waiting={summary.waiting} moving={summary.moving} completed={summary.completed}/>
    <BasbugFilters status={status} search={search} onStatusChange={setStatus} onSearchChange={setSearch} onClear={()=>{setStatus("");setSearch("")}}/>
    <div className="flex items-center justify-between px-1"><div><h3 className="text-lg font-black text-slate-950">Günlük teslimat listesi</h3><p className="mt-1 text-sm text-slate-500">{filtered.length} kayıt gösteriliyor</p></div>{loading?<LoaderCircle className="h-5 w-5 animate-spin text-orange-600"/>:null}</div>
    {loading?<div className="grid min-h-72 place-items-center rounded-3xl border bg-white"><LoaderCircle className="h-8 w-8 animate-spin text-orange-600"/></div>:<BasbugTable deliveries={filtered} onDetail={setSelected} onStatusChange={(id,next)=>{if(canEdit)updateMutation.mutate({id,payload:{seyir_durumu:next}})}}/>}
    <BasbugCreateModal open={createOpen} loading={createMutation.isPending} onClose={()=>setCreateOpen(false)} onSave={async(payload)=>{try{await createMutation.mutateAsync([payload]);setCreateOpen(false);toast.success("Başbuğ teslimatı oluşturuldu.")}catch{toast.error("Teslimat oluşturulamadı.")}}}/>
    <BasbugDetailDrawer open={!!selected} delivery={selected} onClose={()=>setSelected(null)}/>
  </div>;
}
