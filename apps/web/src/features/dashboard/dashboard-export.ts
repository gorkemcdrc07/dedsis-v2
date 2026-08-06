import * as XLSX from "xlsx";
import type { DashboardProjectRow } from "@dedsis/contracts";
import type { DashboardProjectSourceDetail } from "./dashboard.api";

type ExportPeriod = { startDate: string; endDate: string };
type DetailedProject = { project: DashboardProjectRow; detail: DashboardProjectSourceDetail };

const currencyFormat = '₺#,##0;[Red]-₺#,##0';
const percentFormat = '0.0%';

function createSheet(rows: unknown[][], widths: number[], freezeRow = 1) {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  sheet["!freeze"] = { xSplit: 0, ySplit: freezeRow };
  sheet["!autofilter"] = rows.length > 1 ? { ref: `A1:${XLSX.utils.encode_col((rows[0]?.length ?? 1) - 1)}${rows.length}` } : undefined;
  return sheet;
}

function setColumnFormat(sheet: XLSX.WorkSheet, column: number, fromRow: number, toRow: number, format: string) {
  for (let row = fromRow; row <= toRow; row += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
    if (cell) cell.z = format;
  }
}

function fileDate(period: ExportPeriod) { return `${period.startDate}_${period.endDate}`; }

export function exportDashboardSummary(projects: DashboardProjectRow[], period: ExportPeriod) {
  const rows = [
    ["Proje", "API Proje Adı", "Sefer", "Gelir", "Gider", "Kâr", "Kâr Oranı", "Durum"],
    ...projects.map((project) => [project.projectName, project.realProjectName ?? "", project.shipmentCount, project.revenue, project.expense, project.profit, project.profitRate / 100, project.profitRate >= 20 ? "Sağlıklı" : project.profitRate >= 5 ? "Takip" : "Risk"]),
  ];
  const sheet = createSheet(rows, [30, 30, 12, 18, 18, 18, 14, 14]);
  [3, 4, 5].forEach((column) => setColumnFormat(sheet, column, 1, rows.length - 1, currencyFormat));
  setColumnFormat(sheet, 6, 1, rows.length - 1, percentFormat);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Proje Kârlılığı");
  XLSX.writeFile(workbook, `DEDSIS_Proje_Karliligi_${fileDate(period)}.xlsx`, { compression: true });
}

export function exportDashboardDetails(items: DetailedProject[], period: ExportPeriod) {
  const workbook = XLSX.utils.book_new();
  const indexRows: unknown[][] = [["Proje", "Sefer", "Gelir", "Reel Gider", "İK", "Muhasebe", "Toplam Gider", "Net Kâr", "Kâr Oranı"]];
  const detailRows: unknown[][] = [["DEDSİS DETAYLI PROJE MALİYET RAPORU"], [`Dönem: ${period.startDate} – ${period.endDate}`], []];
  const ikRows: unknown[][] = [["Proje", "Personel", "Dağılım Oranı", "Tutar"]];
  const accountingRows: unknown[][] = [["Proje", "Hesap", "Açıklama", "Dağılım Oranı", "Tutar"]];
  const reelRows: unknown[][] = [["Proje", "Hizmet", "Satış", "Alış", "Hizmet Gideri", "Masraf", "Kâr", "Kâr Oranı"]];

  for (const { project, detail } of items) {
    const ikTotal = Number(detail.toplamlar?.ik ?? 0); const accountingTotal = Number(detail.toplamlar?.muhasebe ?? 0);
    const reelExpense = Number(detail.reel?.toplamGider ?? detail.reel?.gelir?.alis ?? 0); const totalExpense = reelExpense + ikTotal + accountingTotal; const profit = project.revenue - totalExpense;
    indexRows.push([project.projectName, project.shipmentCount, project.revenue, reelExpense, ikTotal, accountingTotal, totalExpense, profit, project.revenue ? profit / project.revenue : 0]);
    detailRows.push([`PROJE · ${project.projectName}`], ["Sefer", project.shipmentCount, "Gelir", project.revenue, "Toplam Gider", totalExpense, "Net Kâr", profit, "Kâr Oranı", project.revenue ? profit / project.revenue : 0]);
    detailRows.push(["REEL OPERASYON"], ["Satış", detail.reel?.gelir?.satis ?? 0, "Alış", detail.reel?.gelir?.alis ?? 0, "Hizmet Gideri", detail.reel?.gider?.hizmet ?? 0, "Masraf", detail.reel?.gider?.masraf ?? 0]);
    detailRows.push(["İNSAN KAYNAKLARI", "Personel", "Oran", "Tutar"]);
    if (detail.ik.length) detail.ik.forEach((row) => detailRows.push(["", row.personel, row.oran / 100, row.tutar])); else detailRows.push(["", "Kayıt yok"]);
    detailRows.push(["MUHASEBE", "Hesap", "Açıklama", "Oran", "Tutar"]);
    if (detail.muhasebe.length) detail.muhasebe.forEach((row: { hesap?: string; aciklama?: string; oran?: number; tutar?: number }) => detailRows.push(["", row.hesap ?? "", row.aciklama ?? "", Number(row.oran ?? 0) / 100, Number(row.tutar ?? 0)])); else detailRows.push(["", "Kayıt yok"]);
    detailRows.push([]);
    detail.ik.forEach((row) => ikRows.push([project.projectName, row.personel, row.oran / 100, row.tutar]));
    detail.muhasebe.forEach((row: { hesap?: string; aciklama?: string; oran?: number; tutar?: number }) => accountingRows.push([project.projectName, row.hesap ?? "", row.aciklama ?? "", Number(row.oran ?? 0) / 100, Number(row.tutar ?? 0)]));
    (detail.reel?.hizmetDetay ?? []).forEach((row) => { const profitValue = Number(row.kar ?? (row.satis - row.alis)); reelRows.push([project.projectName, row.isim, row.satis, row.alis, row.hizmet, row.masraf, profitValue, row.satis ? profitValue / row.satis : 0]); });
  }

  const indexSheet = createSheet(indexRows, [30, 11, 17, 17, 17, 17, 17, 17, 14]);
  [2, 3, 4, 5, 6, 7].forEach((column) => setColumnFormat(indexSheet, column, 1, indexRows.length - 1, currencyFormat)); setColumnFormat(indexSheet, 8, 1, indexRows.length - 1, percentFormat);
  const detailSheet = createSheet(detailRows, [28, 25, 18, 18, 18, 18, 18, 18, 18, 15], 3); detailSheet["!autofilter"] = undefined;
  const ikSheet = createSheet(ikRows, [30, 28, 16, 18]); setColumnFormat(ikSheet, 2, 1, ikRows.length - 1, percentFormat); setColumnFormat(ikSheet, 3, 1, ikRows.length - 1, currencyFormat);
  const accountingSheet = createSheet(accountingRows, [30, 32, 45, 16, 18]); setColumnFormat(accountingSheet, 3, 1, accountingRows.length - 1, percentFormat); setColumnFormat(accountingSheet, 4, 1, accountingRows.length - 1, currencyFormat);
  const reelSheet = createSheet(reelRows, [30, 30, 17, 17, 17, 17, 17, 14]); [2, 3, 4, 5, 6].forEach((column) => setColumnFormat(reelSheet, column, 1, reelRows.length - 1, currencyFormat)); setColumnFormat(reelSheet, 7, 1, reelRows.length - 1, percentFormat);
  XLSX.utils.book_append_sheet(workbook, indexSheet, "Proje Özeti"); XLSX.utils.book_append_sheet(workbook, detailSheet, "Hiyerarşik Detay"); XLSX.utils.book_append_sheet(workbook, ikSheet, "İnsan Kaynakları"); XLSX.utils.book_append_sheet(workbook, accountingSheet, "Muhasebe"); XLSX.utils.book_append_sheet(workbook, reelSheet, "Reel Hizmetler");
  XLSX.writeFile(workbook, `DEDSIS_Detayli_Proje_Raporu_${fileDate(period)}.xlsx`, { compression: true });
}
