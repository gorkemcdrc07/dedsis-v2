import { useDeferredValue, useMemo, useState } from "react";
import { FileSearch, Search } from "lucide-react";
import type { MuhasebeRow } from "../types";

type Props={ rows:MuhasebeRow[]; selectedIds:string[]; onSelectionChange:(ids:string[])=>void };
const money = (value:number) => value.toLocaleString("tr-TR", { style:"currency", currency:"TRY" });
function formatDate(row:MuhasebeRow){
  const value = row.tarihObj ?? (row.tarih ? new Date(row.tarih) : null);
  return value && !Number.isNaN(value.getTime()) ? value.toLocaleDateString("tr-TR") : "-";
}

export function MuhasebeTable({ rows, selectedIds, onSelectionChange }:Props){
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("tr-TR"));
  const filteredRows = useMemo(() => !deferredQuery ? rows : rows.filter((row) =>
    [row.yevmiyeNo, row.fisTipi, row.hesapKodu, row.hesapAdi, row.aciklama].some((value) => String(value ?? "").toLocaleLowerCase("tr-TR").includes(deferredQuery))), [rows, deferredQuery]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = filteredRows.map((row) => String(row.id));
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

  function toggleRow(id:string){ onSelectionChange(selectedSet.has(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]); }
  function toggleAll(){ onSelectionChange(allVisibleSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedIds, ...visibleIds])]); }

  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div><h4 className="font-black text-slate-900">Muhasebe hareketleri</h4><p className="mt-1 text-xs text-slate-500">{filteredRows.length.toLocaleString("tr-TR")} / {rows.length.toLocaleString("tr-TR")} kayıt gösteriliyor</p></div>
      <div className="relative w-full sm:w-80"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hesap, açıklama veya yevmiye ara..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
    </div>
    <div className="max-h-[680px] overflow-auto">
      <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur"><tr className="text-xs font-black uppercase tracking-wide text-slate-500"><th className="w-14 border-b border-slate-200 p-4"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 rounded accent-blue-600" aria-label="Görünen kayıtların tümünü seç" /></th><th className="border-b p-4 text-left">Tarih</th><th className="border-b p-4 text-left">Yevmiye</th><th className="border-b p-4 text-left">Fiş tipi</th><th className="border-b p-4 text-left">Hesap</th><th className="border-b p-4 text-left">Açıklama</th><th className="border-b p-4 text-right">Borç</th><th className="border-b p-4 text-right">Alacak</th></tr></thead>
        <tbody>{filteredRows.map((row) => { const selected = selectedSet.has(String(row.id)); return <tr key={row.id} className={`group [content-visibility:auto] transition ${selected ? "bg-blue-50/80" : "hover:bg-slate-50"}`}><td className="border-b border-slate-100 p-4 text-center"><input type="checkbox" checked={selected} onChange={() => toggleRow(String(row.id))} className="h-4 w-4 rounded accent-blue-600" aria-label={`${row.hesapAdi || "Kayıt"} seç`} /></td><td className="border-b border-slate-100 p-4"><span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">{formatDate(row)}</span></td><td className="border-b border-slate-100 p-4 font-bold text-slate-700">{row.yevmiyeNo || "-"}</td><td className="border-b border-slate-100 p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{row.fisTipi || "-"}</span></td><td className="border-b border-slate-100 p-4"><p className="font-black text-slate-800">{row.hesapAdi || "-"}</p><p className="mt-0.5 text-xs font-medium text-slate-400">{row.hesapKodu || "Kod yok"}</p></td><td className="max-w-[380px] border-b border-slate-100 p-4"><p className="truncate text-slate-600" title={row.aciklama}>{row.aciklama || "-"}</p></td><td className="border-b border-slate-100 p-4 text-right font-black tabular-nums text-emerald-600">{money(Number(row.borc || 0))}</td><td className="border-b border-slate-100 p-4 text-right font-black tabular-nums text-rose-600">{money(Number(row.alacak || 0))}</td></tr>})}</tbody>
      </table>
      {!filteredRows.length ? <div className="grid min-h-64 place-items-center text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><FileSearch className="h-6 w-6" /></span><p className="mt-4 font-black text-slate-700">Kayıt bulunamadı</p><p className="mt-1 text-sm text-slate-400">Arama ifadenizi veya dönem seçimini kontrol edin.</p></div></div> : null}
    </div>
  </section>;
}
