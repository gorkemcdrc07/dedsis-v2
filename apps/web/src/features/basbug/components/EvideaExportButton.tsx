import { Download } from "lucide-react";
import * as XLSX from "xlsx";

import type {
    BasbugDelivery
} from "../types";


type Props = {

    data:BasbugDelivery[];

};



export function BasbugExportButton({
    data
}:Props){


    function exportExcel(){

        const rows =
            data.map((item,index)=>({

                "#":
                    index + 1,

                "Plaka":
                    item.plaka,

                "Sürücü":
                    item.surucu_adi_soyadi,

                "Telefon":
                    item.iletisim,

                "Yükleme":
                    item.yukleme_yeri,

                "Varış":
                    item.varis_noktasi,

                "Planlanan Teslim":
                    item.planlanan_teslim_tarihi,

                "Durum":
                    item.seyir_durumu,

            }));


        const sheet =
            XLSX.utils.json_to_sheet(
                rows
            );


        const book =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            book,
            sheet,
            "Basbug"
        );


        XLSX.writeFile(
            book,
            "basbug-operasyon.xlsx"
        );

    }



    return (

        <button

            onClick={exportExcel}

            className="
            flex
            h-11
            items-center
            gap-2
            rounded-xl
            border
            bg-white
            px-5
            font-semibold
            text-slate-700
            hover:bg-slate-50
            "

        >

            <Download size={17}/>

            Excel İndir

        </button>

    );

}


