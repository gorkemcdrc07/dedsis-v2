import * as XLSX from "xlsx";

import type {
    MuhasebeRow
} from "../types";



export function exportMuhasebeExcel(
    rows:MuhasebeRow[]
){


const data =
rows.map(row=>({


    Tarih:
        row.tarihObj
        ?
        row.tarihObj.toLocaleDateString("tr-TR")
        :
        row.tarih
        ?
        new Date(
            row.tarih
        ).toLocaleDateString("tr-TR")
        :
        "",


    "Yevmiye No":
        row.yevmiyeNo,


    "Fiş Tipi":
        row.fisTipi,


    "Hesap Kodu":
        row.hesapKodu,


    "Hesap Adı":
        row.hesapAdi,


    Açıklama:
        row.aciklama,


    Borç:
        row.borc,


    Alacak:
        row.alacak


}));



const worksheet =
    XLSX.utils.json_to_sheet(
        data
    );



const workbook =
    XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Muhasebe"
);



XLSX.writeFile(
    workbook,
    "Muhasebe_Rapor.xlsx"
);


}
