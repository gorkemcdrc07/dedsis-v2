import type { BasbugDelivery } from "../types";
import { BasbugStatusBadge } from "./BasbugStatusBadge";


function formatDate(value:string|null){

    if(!value) return "-";

    return new Date(value).toLocaleDateString(
        "tr-TR",
        {
            day:"2-digit",
            month:"short"
        }
    );

}


type Props = {
    deliveries: BasbugDelivery[];

    onDetail:(delivery:BasbugDelivery)=>void;

    onStatusChange:(id:number,status:string)=>void;
};

export function BasbugTable({
    deliveries,
    onDetail
}:Props){


    return (

        <div
            className="
            overflow-hidden
            rounded-2xl
            border
            bg-white
            shadow-sm
            "
        >

            <div className="overflow-x-auto">


                <table className="min-w-full text-sm">


                    <thead
                        className="
                        sticky
                        top-0
                        bg-slate-50
                        "
                    >

                        <tr>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                #
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Plaka
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Sürücü
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                İletişim
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Yükleme
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Varış
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Teslim Tarihi
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                Durum
                            </th>


                            <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                İşlem
                            </th>


                        </tr>


                    </thead>



                    <tbody>


                    {
                        deliveries.map(
                            (item,index)=>(

                            <tr
                                key={item.id}
                                onClick={(e)=>{

        e.stopPropagation();

        onDetail(item);

    }}
                                className="
                                border-t
                                cursor-pointer
                                transition
                                group
                                hover:bg-slate-50
                                "
                            >


                                <td className="px-5 py-4 text-slate-400">
                                    {index + 1}
                                </td>



                                <td className="
                                    px-5
                                    py-4
                                    font-semibold
                                    text-slate-900
                                ">
                                    {item.plaka ?? "-"}
                                </td>



                                <td className="px-5 py-4">
                                    {item.surucu_adi_soyadi ?? "-"}
                                </td>



                                <td className="px-5 py-4">
                                    {item.iletisim ?? "-"}
                                </td>



                                <td className="px-5 py-4">
                                    {item.yukleme_yeri ?? "-"}
                                </td>



                                <td className="px-5 py-4">
                                    {item.varis_noktasi ?? "-"}
                                </td>



                                <td className="px-5 py-4">
                                    {
                                        formatDate(item.planlanan_teslim_tarihi)
                                        ?? "-"
                                    }
                                </td>



                                <td className="px-5 py-4">

                                    <BasbugStatusBadge
                                        status={
                                            item.seyir_durumu
                                        }
                                    />

                                </td>



                                <td className="px-5 py-4">

                                   <button
    onClick={(e)=>{

        e.stopPropagation();

        onDetail(item);

    }}
    className="
    rounded-lg
    border
    px-3
    py-1.5
    text-xs
    font-semibold
    text-blue-600
    hover:bg-blue-50
    "
>
    Detay
</button>


                                </td>


                            </tr>

                        ))
                    }



                    {
                        deliveries.length === 0 && (

                            <tr>

                                <td
                                    colSpan={9}
                                    className="
                                    px-5
                                    py-16
                                    text-center
                                    text-slate-500
                                    "
                                >

                                    <div className="text-lg font-semibold">
                                        Kayıt bulunamadı
                                    </div>

                                    <div className="mt-1 text-sm">
                                        Seçilen tarih için teslimat bulunmuyor.
                                    </div>

                                </td>


                            </tr>

                        )
                    }


                    </tbody>


                </table>


            </div>


        </div>

    );

}




















