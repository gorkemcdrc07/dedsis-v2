import { useRef, useState } from "react";
import { FileSpreadsheet, LoaderCircle, UploadCloud, UsersRound } from "lucide-react";
import * as XLSX from "xlsx";
import { createIKImport } from "../api/insanKaynaklari.api";

type Props = {
  ay:number; yil:number; busy?:boolean;
  onProgress:(percent:number, title:string, message:string)=>void;
  onComplete:(count:number)=>void | Promise<void>;
  onError:(message:string)=>void;
};
const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function IKUpload({ ay, yil, busy=false, onProgress, onComplete, onError }:Props){
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  async function acceptFile(file?:File){
    if(!file || busy) return;
    if(!/\.(xlsx|xls)$/i.test(file.name)){ onError("Yalnızca .xlsx veya .xls dosyası yükleyebilirsiniz."); return; }
    setFileName(file.name);
    try{
      onProgress(15, "Excel okunuyor", "Personel sütunları ve değerleri kontrol ediliyor.");
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheetName = workbook.SheetNames[0];
      if(!sheetName) throw new Error("Excel dosyasında çalışma sayfası bulunamadı.");
      const sheet = workbook.Sheets[sheetName];
      if(!sheet) throw new Error("Excel çalışma sayfası okunamadı.");
      const source = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      const rows = source.map((row) => ({
        personelAdi: row["Personel"] ?? row["Personel Adı"] ?? row["Adı Soyadı"] ?? row["Ad Soyad"] ?? row["Çalışan"] ?? "",
        sicilNo: row["Sicil No"] ?? row["Sicil"] ?? row["Personel Kodu"] ?? null,
        departman: row["Departman"] ?? row["Bölüm"] ?? null,
        brutUcret: Number(row["Brüt Ücret"] ?? row["Brut Ücret"] ?? row["Maaş"] ?? 0),
        isverenMaliyeti: Number(row["İşveren Maliyeti"] ?? row["İşveren maliyeti"] ?? row["Isveren Maliyeti"] ?? row["Toplam Maliyet"] ?? 0),
      })).filter((row) => String(row.personelAdi).trim());
      if(!rows.length) throw new Error("Dosyada geçerli personel satırı bulunamadı. Personel adı sütununu kontrol edin.");
      onProgress(60, "Personeller aktarılıyor", `${rows.length.toLocaleString("tr-TR")} personel ${months[ay-1]} ${yil} dönemine kaydediliyor.`);
      await createIKImport({ dosyaAdi:file.name, donemAy:ay, donemYil:yil, rows });
      await onComplete(rows.length);
    }catch(error){ onError(error instanceof Error ? error.message : "Excel aktarımı sırasında hata oluştu."); }
  }

  return <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[.8fr_1.2fr] lg:p-6"><div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-5"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><UsersRound className="h-5 w-5" /></span><h3 className="mt-4 text-lg font-black">Personel Excel’i aktar</h3><p className="mt-2 text-sm leading-6 text-slate-500">Dosya <strong className="text-slate-700">{months[ay-1]} {yil}</strong> dönemine kaydedilecek. Personel adı ve işveren maliyeti sütunlarını kontrol edin.</p></div><div onDragEnter={(event)=>{event.preventDefault();setDragging(true)}} onDragOver={(event)=>event.preventDefault()} onDragLeave={()=>setDragging(false)} onDrop={(event)=>{event.preventDefault();setDragging(false);void acceptFile(event.dataTransfer.files[0])}} className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-violet-500 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/30"}`}><UploadCloud className={`h-8 w-8 ${dragging ? "text-violet-600" : "text-slate-400"}`} /><p className="mt-3 text-sm font-black">Dosyayı buraya sürükleyin</p><p className="mt-1 text-xs text-slate-400">.xlsx veya .xls</p>{fileName ? <p className="mt-3 max-w-full truncate rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">{fileName}</p> : null}<button type="button" disabled={busy} onClick={()=>inputRef.current?.click()} className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}{busy ? "Aktarılıyor…" : "Excel dosyası seç"}</button><input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event)=>{void acceptFile(event.target.files?.[0]);event.target.value=""}} /></div></section>;
}
