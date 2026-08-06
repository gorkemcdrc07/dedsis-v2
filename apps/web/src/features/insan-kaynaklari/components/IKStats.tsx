import { BadgeCheck, CircleDollarSign, Clock3, UsersRound } from "lucide-react";
import type { IKRow } from "../types";

export function IKStats({ rows }:{rows:IKRow[]}){
  const total = rows.reduce((sum,row)=>sum+Number(row.isverenMaliyeti||0),0);
  const waiting = rows.filter((row)=>row.dagitimDurumu === "bekliyor").length;
  const cards = [
    { title:"Toplam personel", value:rows.length.toLocaleString("tr-TR"), note:"Seçilen dönemde", icon:UsersRound, color:"bg-blue-50 text-blue-700" },
    { title:"İşveren maliyeti", value:total.toLocaleString("tr-TR",{style:"currency",currency:"TRY"}), note:"Toplam dönem maliyeti", icon:CircleDollarSign, color:"bg-violet-50 text-violet-700" },
    { title:"Dağıtım bekleyen", value:waiting.toLocaleString("tr-TR"), note:"İşlem gerektiren kayıt", icon:Clock3, color:"bg-amber-50 text-amber-700" },
    { title:"Dağıtımı tamamlanan", value:(rows.length-waiting).toLocaleString("tr-TR"), note:"Projeye dağıtıldı", icon:BadgeCheck, color:"bg-emerald-50 text-emerald-700" },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({title,value,note,icon:Icon,color})=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}><Icon className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold text-slate-500">{title}</p><p className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950" title={value}>{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>)}</div>;
}
