import { CheckCircle2, Clock3, Package, Truck } from "lucide-react";
type Props={total:number;waiting:number;moving:number;completed:number;accent:"blue"|"orange"};
export function DeliveryStats({total,waiting,moving,completed,accent}:Props){
  const movingColor=accent==="blue"?"bg-blue-50 text-blue-700":"bg-orange-50 text-orange-700";
  const cards=[{title:"Toplam teslimat",value:total,icon:Package,color:"bg-slate-100 text-slate-700"},{title:"Beklemede",value:waiting,icon:Clock3,color:"bg-amber-50 text-amber-700"},{title:"Yolda",value:moving,icon:Truck,color:movingColor},{title:"Teslim edildi",value:completed,icon:CheckCircle2,color:"bg-emerald-50 text-emerald-700"}];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({title,value,icon:Icon,color})=><div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}><Icon className="h-5 w-5"/></span><p className="mt-4 text-sm font-bold text-slate-500">{title}</p><p className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value.toLocaleString("tr-TR")}</p></div>)}</div>;
}
