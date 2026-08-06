import { Check, FileCheck2, LoaderCircle, Sparkles, X } from "lucide-react";

type Props = { open:boolean; title:string; message:string; percent:number; onClose:()=>void };

export function MuhasebeProcessModal({ open, title, message, percent, onClose }:Props){
  if(!open) return null;
  const complete = percent >= 100;
  const steps = [
    { label: "Dosya kontrol edildi", threshold: 20 },
    { label: "Kayıtlar hazırlandı", threshold: 55 },
    { label: "Veriler güvenle kaydedildi", threshold: 100 },
  ];

  return <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-md">
    <div className="relative w-full max-w-md animate-[scale-in_.25s_ease-out] overflow-hidden rounded-[2rem] bg-white p-7 shadow-2xl shadow-slate-950/30 sm:p-8">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 ${complete ? "bg-gradient-to-b from-emerald-100 to-transparent" : "bg-gradient-to-b from-blue-100 to-transparent"}`} />
      {complete ? <>{[12,25,42,63,78,91].map((left, index) => <span key={left} className={`absolute h-2 w-2 animate-bounce rounded-full ${index % 2 ? "bg-blue-400" : "bg-emerald-400"}`} style={{ left: `${left}%`, top: index % 2 ? "4rem" : "2.5rem", animationDelay: `${index * 100}ms` }} />)}</> : null}
      <button onClick={onClose} disabled={!complete} className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/70 hover:text-slate-700 disabled:invisible" aria-label="Kapat"><X className="h-4 w-4" /></button>
      <div className="relative text-center">
        <div className={`relative mx-auto grid h-24 w-24 place-items-center rounded-full ${complete ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
          {!complete ? <span className="absolute inset-1 animate-ping rounded-full border border-blue-300 opacity-40" /> : null}
          {complete ? <FileCheck2 className="h-11 w-11 animate-[bounce_.6s_ease-out]" /> : <LoaderCircle className="h-11 w-11 animate-spin" />}
        </div>
        <div className={`mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${complete ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{complete ? <Sparkles className="h-3.5 w-3.5" /> : <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}{complete ? "İşlem başarıyla tamamlandı" : "İşlem devam ediyor"}</div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      </div>
      <div className="relative mt-7"><div className="mb-2 flex justify-between text-xs font-bold"><span className="text-slate-500">İlerleme</span><span className={complete ? "text-emerald-600" : "text-blue-600"}>%{percent}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`relative h-full rounded-full transition-all duration-700 ease-out ${complete ? "bg-emerald-500" : "bg-gradient-to-r from-blue-600 to-cyan-400"}`} style={{width:`${percent}%`}}><span className="absolute inset-0 animate-pulse bg-white/25" /></div></div></div>
      <div className="relative mt-6 space-y-2">{steps.map((step) => { const done = percent >= step.threshold; return <div key={step.label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${done ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-400"}`}><span className={`grid h-6 w-6 place-items-center rounded-full ${done ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>{done ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}</span>{step.label}</div>})}</div>
      {complete ? <button onClick={onClose} className="relative mt-6 h-12 w-full rounded-xl bg-slate-950 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800">Tamam</button> : null}
    </div>
  </div>;
}
