import { useRef, useState } from "react";
import { FileSpreadsheet, LoaderCircle, UploadCloud } from "lucide-react";

type Props = {
  ay: number;
  yil: number;
  busy?: boolean;
  onUpload: (file: File, ay: number, yil: number) => void | Promise<void>;
};

const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export function MuhasebeUploadPanel({ ay, yil, busy = false, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  function acceptFile(file?: File) {
    if (!file || busy || !/\.(xlsx|xls)$/i.test(file.name)) return;
    setFileName(file.name);
    void onUpload(file, ay, yil);
  }

  return (
    <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[0.8fr_1.2fr] lg:p-6">
      <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><FileSpreadsheet className="h-5 w-5" /></span>
        <h3 className="mt-4 text-lg font-black text-slate-950">Excel’den veri aktar</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">Dosya <strong className="text-slate-700">{months[ay - 1]} {yil}</strong> dönemine kaydedilecek. Yüklemeden önce dönemi kontrol edin.</p>
      </div>
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
        className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"}`}
      >
        <UploadCloud className={`h-8 w-8 ${dragging ? "text-blue-600" : "text-slate-400"}`} />
        <p className="mt-3 text-sm font-black text-slate-800">Dosyayı buraya sürükleyin</p>
        <p className="mt-1 text-xs text-slate-400">veya bilgisayarınızdan .xlsx / .xls seçin</p>
        {fileName ? <p className="mt-3 max-w-full truncate rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">{fileName}</p> : null}
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}{busy ? "Aktarılıyor…" : "Excel dosyası seç"}
        </button>
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event) => { acceptFile(event.target.files?.[0]); event.target.value = ""; }} />
      </div>
    </section>
  );
}
