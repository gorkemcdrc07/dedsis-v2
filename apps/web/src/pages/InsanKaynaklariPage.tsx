import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, LoaderCircle, RefreshCw, Search, Trash2, UserRoundCog } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import type { IKRow } from "../features/insan-kaynaklari/types";
import { deleteIKPeriod, getIKImports, getIKKayitlari } from "../features/insan-kaynaklari/api/insanKaynaklari.api";
import { IKStats } from "../features/insan-kaynaklari/components/IKStats";
import { IKUpload } from "../features/insan-kaynaklari/components/IKUpload";
import { IKTable } from "../features/insan-kaynaklari/components/IKTable";
import { getEmployeeProjects } from "../features/employee-projects/employee-projects.api";
import { MuhasebeProcessModal } from "../features/muhasebe/components/MuhasebeProcessModal";
import { hasPermission, type CurrentSession } from "../features/auth/auth";

const months=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
type Status="all"|"waiting"|"distributed";
type ImportRow={id:string|number;dosya_adi:string;kayit_sayisi:number;created_at?:string};

export default function InsanKaynaklariPage(){
  const session=useOutletContext<CurrentSession>(); const today=new Date();
  const [rows,setRows]=useState<IKRow[]>([]); const [imports,setImports]=useState<ImportRow[]>([]);
  const [month,setMonth]=useState(today.getMonth()+1); const [year,setYear]=useState(today.getFullYear());
  const [selectedIds,setSelectedIds]=useState<string[]>([]); const [projectNames,setProjectNames]=useState<Record<number,string>>({});
  const [query,setQuery]=useState(""); const [status,setStatus]=useState<Status>("waiting"); const [loading,setLoading]=useState(true); const [deleting,setDeleting]=useState(false);
  const [process,setProcess]=useState({open:false,title:"",message:"",percent:0});
  const canDelete=hasPermission(session,"hr.delete");
  const canImport=hasPermission(session,"hr.import");
  const canAssign=hasPermission(session,"hr.assign");

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [records,history,employeeProjects]=await Promise.all([getIKKayitlari({ay:month,yil:year}),getIKImports({ay:month,yil:year}),getEmployeeProjects()]);
      setProjectNames(Object.fromEntries(employeeProjects.projects.map((project)=>[project.id,project.display_name||project.name||project.code])));
      setRows(records.map((x:any)=>({id:String(x.id),kullaniciId:x.kullanici_id??null,projeId:x.proje_id??null,personelAdi:x.personel_adi,sicilNo:x.sicil_no,departman:x.departman,donemAy:x.donem_ay,donemYil:x.donem_yil,brutUcret:Number(x.brut_ucret||0),isverenMaliyeti:Number(x.isveren_maliyeti||0),dagitimDurumu:x.dagitimDurumu??"bekliyor",dagitimlar:x.dagitimlar??[],dagitimGuncel:x.dagitimGuncel,sonYetkilendirmeDegisikligi:x.sonYetkilendirmeDegisikligi,selected:false})));
      setImports(history as ImportRow[]); setSelectedIds([]);
    }catch(error){toast.error(error instanceof Error?error.message:"İK verileri alınamadı.");}finally{setLoading(false)}
  },[month,year]);
  useEffect(()=>{void load()},[load]);

  const filteredRows=useMemo(()=>{const needle=query.trim().toLocaleLowerCase("tr-TR");return rows.filter((row)=>{const statusMatch=status==="all"||(status==="waiting"?row.dagitimDurumu==="bekliyor":row.dagitimDurumu==="dagitildi");const text=`${row.personelAdi} ${row.sicilNo??""} ${row.departman??""}`.toLocaleLowerCase("tr-TR");return statusMatch&&(!needle||text.includes(needle))})},[rows,query,status]);
  function toggleSelect(id:string){setSelectedIds((current)=>current.includes(id)?current.filter((item)=>item!==id):[...current,id])}
  async function removePeriod(){if(!window.confirm(`${months[month-1]} ${year} dönemindeki tüm personel maliyet kayıtları ve dağıtımları kalıcı olarak silinecek. Devam edilsin mi?`))return;setDeleting(true);try{const result=await deleteIKPeriod(month,year);toast.success(`${result.deletedRecords} İK kaydı silindi.`);await load()}catch(error){toast.error(error instanceof Error?error.message:"Dönem silinemedi.")}finally{setDeleting(false)}}
  const uploaded=imports.reduce((sum,item)=>sum+Number(item.kayit_sayisi||0),0);

  return <div className="space-y-6">
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white shadow-xl shadow-slate-200 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200 ring-1 ring-violet-300/20"><UserRoundCog className="h-4 w-4" />İnsan ve maliyet yönetimi</div><h2 className="text-3xl font-black sm:text-4xl">İnsan Kaynakları</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Personel maliyetlerini dönem bazında yönetin ve proje dağılımlarını güvenle tamamlayın.</p></div><div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><label className="text-xs font-bold text-slate-300">Ay<select value={month} onChange={(e)=>setMonth(Number(e.target.value))} className="mt-1 block h-11 min-w-32 rounded-xl border border-white/10 bg-slate-800 px-3 text-sm font-bold text-white">{months.map((name,index)=><option key={name} value={index+1}>{name}</option>)}</select></label><label className="text-xs font-bold text-slate-300">Yıl<select value={year} onChange={(e)=>setYear(Number(e.target.value))} className="mt-1 block h-11 min-w-28 rounded-xl border border-white/10 bg-slate-800 px-3 text-sm font-bold text-white">{Array.from({length:7},(_,i)=>today.getFullYear()-3+i).map((item)=><option key={item}>{item}</option>)}</select></label><button onClick={()=>void load()} className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 hover:bg-white/20" aria-label="Yenile"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/></button></div></div></section>

    {canImport?<IKUpload ay={month} yil={year} busy={process.open&&process.percent<100} onProgress={(percent,title,message)=>setProcess({open:true,percent,title,message})} onComplete={async(count)=>{setProcess({open:true,percent:100,title:"Aktarım tamamlandı",message:`${count.toLocaleString("tr-TR")} personel başarıyla aktarıldı.`});toast.success("Personel Excel’i aktarıldı.");await load()}} onError={(message)=>{setProcess((value)=>({...value,open:false}));toast.error(message)}} />:null}

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black"><Database className="h-5 w-5 text-violet-600"/>{months[month-1]} {year} yüklemeleri</h3><p className="mt-1 text-sm text-slate-500">Döneme aktarılan personel dosyaları.</p></div><div className="flex flex-wrap gap-3"><span className="rounded-xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">{imports.length} dosya</span><span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">{uploaded.toLocaleString("tr-TR")} kayıt</span>{canDelete&&imports.length?<button onClick={()=>void removePeriod()} disabled={deleting} className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 hover:bg-red-100">{deleting?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Trash2 className="h-4 w-4"/>}Dönemi toplu sil</button>:null}</div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{imports.map((item)=><div key={item.id} className="flex items-center gap-3 rounded-2xl border p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5"/></span><span className="min-w-0"><span className="block truncate text-sm font-bold">{item.dosya_adi}</span><span className="text-xs text-slate-500">{Number(item.kayit_sayisi).toLocaleString("tr-TR")} personel</span></span></div>)}{!imports.length?<div className="col-span-full rounded-2xl border border-dashed py-8 text-center text-sm text-slate-400">Bu dönemde yükleme yok.</div>:null}</div></section>

    <IKStats rows={rows}/>
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-md"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Personel, sicil veya departman ara..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"/></div><div className="flex rounded-xl bg-slate-100 p-1">{([{key:"all",label:"Tümü"},{key:"waiting",label:"Bekleyen"},{key:"distributed",label:"Dağıtılan"}] as const).map((item)=><button key={item.key} onClick={()=>setStatus(item.key)} className={`rounded-lg px-3 py-2 text-xs font-black transition ${status===item.key?"bg-white text-violet-700 shadow-sm":"text-slate-500"}`}>{item.label}</button>)}</div></div></section>
    {loading?<div className="grid min-h-72 place-items-center rounded-3xl border bg-white"><LoaderCircle className="h-8 w-8 animate-spin text-violet-600"/></div>:<IKTable rows={filteredRows} selectedIds={selectedIds} onSelect={toggleSelect} projectNames={projectNames} onSaved={load} onProcess={setProcess} canAssign={canAssign}/>}
    <MuhasebeProcessModal open={process.open} title={process.title} message={process.message} percent={process.percent} onClose={()=>setProcess({...process,open:false})}/>
  </div>;
}
