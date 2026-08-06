import type { DashboardProjectRow } from "@dedsis/contracts";
import type { DashboardProjectSourceDetail } from "./dashboard.api";

type ExportPeriod = { startDate: string; endDate: string };
type DetailedProject = { project: DashboardProjectRow; detail: DashboardProjectSourceDetail };
type CellValue = string | number;

const money = '#,##0.00 "₺";[Red]-#,##0.00 "₺"';
const styles = `
<Styles>
 <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos" ss:Size="10"/><Borders/><Interior/><NumberFormat/><Protection/></Style>
 <Style ss:ID="Title"><Alignment ss:Vertical="Center"/><Font ss:FontName="Aptos Display" ss:Size="22" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F172A" ss:Pattern="Solid"/></Style>
 <Style ss:ID="Subtitle"><Font ss:FontName="Aptos" ss:Size="10" ss:Color="#BFDBFE"/><Interior ss:Color="#0F172A" ss:Pattern="Solid"/></Style>
 <Style ss:ID="Header"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2563EB" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/></Borders></Style>
 <Style ss:ID="Section"><Font ss:Size="12" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#334155" ss:Pattern="Solid"/></Style>
 <Style ss:ID="Project"><Font ss:Size="14" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/></Style>
 <Style ss:ID="KpiBlue"><Font ss:Bold="1" ss:Color="#1D4ED8"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#93C5FD"/></Borders></Style>
 <Style ss:ID="KpiGreen"><Font ss:Bold="1" ss:Color="#047857"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#6EE7B7"/></Borders></Style>
 <Style ss:ID="KpiRed"><Font ss:Bold="1" ss:Color="#BE123C"/><Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDA4AF"/></Borders></Style>
 <Style ss:ID="KpiAmber"><Font ss:Bold="1" ss:Color="#B45309"/><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FCD34D"/></Borders></Style>
 <Style ss:ID="Money"><NumberFormat ss:Format='${money}'/></Style><Style ss:ID="MoneyGreen"><Font ss:Bold="1" ss:Color="#047857"/><NumberFormat ss:Format='${money}'/></Style><Style ss:ID="MoneyRed"><Font ss:Bold="1" ss:Color="#BE123C"/><NumberFormat ss:Format='${money}'/></Style>
 <Style ss:ID="Percent"><NumberFormat ss:Format="0.0%"/></Style><Style ss:ID="Integer"><NumberFormat ss:Format="#,##0"/></Style>
 <Style ss:ID="Even"><Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/></Style><Style ss:ID="Note"><Font ss:Color="#64748B" ss:Italic="1"/><Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/></Style>
 <Style ss:ID="Healthy"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#047857"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/></Style><Style ss:ID="Follow"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#B45309"/><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/></Style><Style ss:ID="Risk"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#BE123C"/><Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/></Style>
</Styles>`;

function esc(value: CellValue) { return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function cell(value: CellValue = "", style = "Default", mergeAcross = 0) { const type = typeof value === "number" ? "Number" : "String"; return `<Cell ss:StyleID="${style}"${mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : ""}><Data ss:Type="${type}">${esc(value)}</Data></Cell>`; }
function row(cells: string[], height?: number) { return `<Row${height ? ` ss:Height="${height}"` : ""}>${cells.join("")}</Row>`; }
function columns(widths: number[]) { return widths.map((width) => `<Column ss:AutoFitWidth="0" ss:Width="${width}"/>`).join(""); }
function worksheet(name: string, widths: number[], rows: string[], freezeRows = 0) { return `<Worksheet ss:Name="${esc(name)}"><Table>${columns(widths)}${rows.join("")}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><Selected/><ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios>${freezeRows ? `<FreezePanes/><FrozenNoSplit/><SplitHorizontal>${freezeRows}</SplitHorizontal><TopRowBottomPane>${freezeRows}</TopRowBottomPane><ActivePane>2</ActivePane>` : ""}</WorksheetOptions></Worksheet>`; }
function workbookXml(sheets: string[]) { return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>DEDSİS</Author><Company>DEDSİS</Company><Title>Proje Kârlılık Raporu</Title></DocumentProperties>${styles}${sheets.join("")}</Workbook>`; }
function download(xml: string, filename: string) { const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
function filename(period: ExportPeriod) { return `${period.startDate}_${period.endDate}`; }
function titleRows(title: string, period: ExportPeriod, span: number) { return [row([cell(title, "Title", span - 1)], 36), row([cell(`Dönem: ${period.startDate} – ${period.endDate}  •  Oluşturulma: ${new Date().toLocaleString("tr-TR")}`, "Subtitle", span - 1)], 22), row([cell("", "Default", span - 1)], 10)]; }

export function exportDashboardSummary(projects: DashboardProjectRow[], period: ExportPeriod) {
  const totals = projects.reduce((sum, item) => ({ trips: sum.trips + item.shipmentCount, revenue: sum.revenue + item.revenue, expense: sum.expense + item.expense, profit: sum.profit + item.profit }), { trips: 0, revenue: 0, expense: 0, profit: 0 });
  const rows = [...titleRows("DEDSİS · PROJE KÂRLILIK RAPORU", period, 8), row([cell("TOPLAM SEFER", "KpiBlue"), cell(totals.trips, "KpiBlue"), cell("TOPLAM GELİR", "KpiGreen"), cell(totals.revenue, "MoneyGreen"), cell("TOPLAM GİDER", "KpiRed"), cell(totals.expense, "MoneyRed"), cell("NET KÂR", "KpiGreen"), cell(totals.profit, totals.profit >= 0 ? "MoneyGreen" : "MoneyRed")], 28), row([cell("", "Default", 7)], 10), row(["PROJE", "API PROJE ADI", "SEFER", "GELİR", "GİDER", "KÂR", "KÂR ORANI", "DURUM"].map((value) => cell(value, "Header")), 25)];
  projects.forEach((project, index) => { const status = project.profitRate >= 20 ? "Sağlıklı" : project.profitRate >= 5 ? "Takip" : "Risk"; rows.push(row([cell(project.projectName, index % 2 ? "Even" : "Default"), cell(project.realProjectName ?? "", index % 2 ? "Even" : "Default"), cell(project.shipmentCount, "Integer"), cell(project.revenue, "Money"), cell(project.expense, "Money"), cell(project.profit, project.profit >= 0 ? "MoneyGreen" : "MoneyRed"), cell(project.profitRate / 100, "Percent"), cell(status, status === "Sağlıklı" ? "Healthy" : status === "Takip" ? "Follow" : "Risk")], 22)); });
  download(workbookXml([worksheet("Proje Kârlılığı", [180, 180, 70, 110, 110, 110, 85, 80], rows, 6)]), `DEDSIS_Modern_Proje_Raporu_${filename(period)}.xls`);
}

export function exportDashboardDetails(items: DetailedProject[], period: ExportPeriod) {
  const summaryRows = [...titleRows("DEDSİS · DETAYLI MALİYET RAPORU", period, 9), row(["PROJE", "SEFER", "GELİR", "REEL GİDER", "İK", "MUHASEBE", "TOPLAM GİDER", "NET KÂR", "KÂR ORANI"].map((value) => cell(value, "Header")), 25)];
  const detailRows = [...titleRows("DEDSİS · PROJE MALİYET MERKEZLERİ", period, 10)];
  const ikRows = [...titleRows("İNSAN KAYNAKLARI DAĞILIMLARI", period, 4), row(["PROJE", "PERSONEL", "DAĞILIM", "TUTAR"].map((value) => cell(value, "Header")), 25)];
  const accountingRows = [...titleRows("MUHASEBE DAĞILIMLARI", period, 5), row(["PROJE", "HESAP", "AÇIKLAMA", "DAĞILIM", "TUTAR"].map((value) => cell(value, "Header")), 25)];
  const reelRows = [...titleRows("REEL HİZMET KÂRLILIĞI", period, 8), row(["PROJE", "HİZMET", "SATIŞ", "ALIŞ", "HİZMET GİDERİ", "MASRAF", "KÂR", "KÂR ORANI"].map((value) => cell(value, "Header")), 25)];
  items.forEach(({ project, detail }) => {
    const ik = Number(detail.toplamlar?.ik ?? 0), accounting = Number(detail.toplamlar?.muhasebe ?? 0), reelExpense = Number(detail.reel?.toplamGider ?? detail.reel?.gelir?.alis ?? 0), totalExpense = reelExpense + ik + accounting, profit = project.revenue - totalExpense, rate = project.revenue ? profit / project.revenue : 0;
    summaryRows.push(row([cell(project.projectName), cell(project.shipmentCount, "Integer"), cell(project.revenue, "Money"), cell(reelExpense, "Money"), cell(ik, "Money"), cell(accounting, "Money"), cell(totalExpense, "MoneyRed"), cell(profit, profit >= 0 ? "MoneyGreen" : "MoneyRed"), cell(rate, "Percent")], 22));
    detailRows.push(row([cell(`PROJE · ${project.projectName}`, "Project", 9)], 28), row([cell("Sefer", "KpiBlue"), cell(project.shipmentCount, "Integer"), cell("Gelir", "KpiGreen"), cell(project.revenue, "MoneyGreen"), cell("Toplam Gider", "KpiRed"), cell(totalExpense, "MoneyRed"), cell("Net Kâr", profit >= 0 ? "KpiGreen" : "KpiRed"), cell(profit, profit >= 0 ? "MoneyGreen" : "MoneyRed"), cell("Kâr Oranı", "KpiBlue"), cell(rate, "Percent")], 26));
    detailRows.push(row([cell("REEL OPERASYON", "Section", 9)], 22), row([cell("Satış", "KpiGreen"), cell(detail.reel?.gelir?.satis ?? 0, "MoneyGreen"), cell("Alış", "KpiBlue"), cell(detail.reel?.gelir?.alis ?? 0, "Money"), cell("Hizmet Gideri", "KpiRed"), cell(detail.reel?.gider?.hizmet ?? 0, "MoneyRed"), cell("Masraf", "KpiAmber"), cell(detail.reel?.gider?.masraf ?? 0, "Money"), cell("", "Default", 1)], 24));
    detailRows.push(row([cell("İNSAN KAYNAKLARI", "Section", 9)], 22), row([cell(""), cell("PERSONEL", "Header"), cell("DAĞILIM", "Header"), cell("TUTAR", "Header"), cell("", "Default", 5)]));
    if (detail.ik.length) detail.ik.forEach((item, index) => detailRows.push(row([cell(""), cell(item.personel, index % 2 ? "Even" : "Default"), cell(item.oran / 100, "Percent"), cell(item.tutar, "Money"), cell("", "Default", 5)]))); else detailRows.push(row([cell(""), cell("Kayıt bulunamadı", "Note", 8)]));
    detailRows.push(row([cell("MUHASEBE", "Section", 9)], 22), row([cell(""), cell("HESAP", "Header"), cell("AÇIKLAMA", "Header"), cell("DAĞILIM", "Header"), cell("TUTAR", "Header"), cell("", "Default", 4)]));
    if (detail.muhasebe.length) detail.muhasebe.forEach((item: { hesap?: string; aciklama?: string; oran?: number; tutar?: number }, index: number) => detailRows.push(row([cell(""), cell(item.hesap ?? "", index % 2 ? "Even" : "Default"), cell(item.aciklama ?? "", index % 2 ? "Even" : "Default"), cell(Number(item.oran ?? 0) / 100, "Percent"), cell(Number(item.tutar ?? 0), "Money"), cell("", "Default", 4)]))); else detailRows.push(row([cell(""), cell("Kayıt bulunamadı", "Note", 8)]));
    detailRows.push(row([cell("", "Default", 9)], 12));
    detail.ik.forEach((item) => ikRows.push(row([cell(project.projectName), cell(item.personel), cell(item.oran / 100, "Percent"), cell(item.tutar, "Money")])));
    detail.muhasebe.forEach((item: { hesap?: string; aciklama?: string; oran?: number; tutar?: number }) => accountingRows.push(row([cell(project.projectName), cell(item.hesap ?? ""), cell(item.aciklama ?? ""), cell(Number(item.oran ?? 0) / 100, "Percent"), cell(Number(item.tutar ?? 0), "Money")])));
    (detail.reel?.hizmetDetay ?? []).forEach((item) => { const itemProfit = Number(item.kar ?? item.satis - item.alis); reelRows.push(row([cell(project.projectName), cell(item.isim), cell(item.satis, "Money"), cell(item.alis, "Money"), cell(item.hizmet, "Money"), cell(item.masraf, "Money"), cell(itemProfit, itemProfit >= 0 ? "MoneyGreen" : "MoneyRed"), cell(item.satis ? itemProfit / item.satis : 0, "Percent")])) });
  });
  const sheets = [worksheet("Yönetici Özeti", [190, 65, 105, 105, 105, 105, 110, 110, 85], summaryRows, 4), worksheet("Proje Detayları", [45, 180, 220, 90, 100, 100, 100, 100, 95, 85], detailRows, 3), worksheet("İnsan Kaynakları", [190, 180, 85, 110], ikRows, 4), worksheet("Muhasebe", [190, 220, 270, 85, 110], accountingRows, 4), worksheet("Reel Hizmetler", [180, 180, 105, 105, 105, 105, 105, 85], reelRows, 4)];
  download(workbookXml(sheets), `DEDSIS_Modern_Detayli_Rapor_${filename(period)}.xls`);
}
