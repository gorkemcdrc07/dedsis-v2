import {
    Wallet,
    BadgeDollarSign,
    CircleDollarSign,
    TrendingUp,
} from "lucide-react";


function formatCurrency(value: number = 0) {

    return new Intl.NumberFormat(
        "tr-TR",
        {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
        }
    ).format(value);

}



function KpiCard({
    title,
    value,
    type,
}: {
    title:string;
    value:number;
    type:"green"|"red"|"blue";
}) {


    const styles = {

        green:
            "bg-emerald-50 border-emerald-200 text-emerald-700",

        red:
            "bg-rose-50 border-rose-200 text-rose-700",

        blue:
            "bg-blue-50 border-blue-200 text-blue-700",

    };


    return (

        <div
            className={`
                rounded-2xl
                border
                p-4
                ${styles[type]}
            `}
        >

            <div
                className="
                text-[11px]
                font-bold
                opacity-70
                "
            >
                {title}
            </div>


            <div
                className="
                mt-2
                text-lg
                font-black
                "
            >
                {formatCurrency(value)}
            </div>


        </div>

    );

}




function ServiceCard({
    item
}:{
    item:any;
}){


    const kar =
        item.kar ??
        (
            (item.satis ?? 0)
            -
            (item.alis ?? 0)
        );


    const marj =
        item.satis > 0
            ?
            ((kar / item.satis) * 100)
            :
            0;



    return (

        <div
            className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            hover:shadow-md
            transition
            "
        >


            <div
                className="
                flex
                items-center
                justify-between
                mb-4
                "
            >

                <div
                    className="
                    font-black
                    text-sm
                    text-slate-800
                    "
                >
                    {item.isim}
                </div>


                <div
                    className="
                    text-[11px]
                    rounded-full
                    bg-emerald-50
                    text-emerald-700
                    px-2
                    py-1
                    font-bold
                    "
                >

                    %{Math.round(marj)}

                </div>


            </div>




            <div
                className="
                grid
                grid-cols-3
                gap-2
                "
            >


                <div
                    className="
                    rounded-xl
                    bg-emerald-50
                    p-3
                    "
                >

                    <div
                        className="
                        text-[10px]
                        text-emerald-700
                        "
                    >
                        Satış
                    </div>


                    <div
                        className="
                        mt-1
                        font-black
                        text-xs
                        text-emerald-800
                        "
                    >
                        {formatCurrency(
                            item.satis
                        )}
                    </div>

                </div>





                <div
                    className="
                    rounded-xl
                    bg-rose-50
                    p-3
                    "
                >

                    <div
                        className="
                        text-[10px]
                        text-rose-700
                        "
                    >
                        Alış
                    </div>


                    <div
                        className="
                        mt-1
                        font-black
                        text-xs
                        text-rose-800
                        "
                    >
                        {formatCurrency(
                            item.alis
                        )}
                    </div>

                </div>





                <div
                    className="
                    rounded-xl
                    bg-slate-900
                    p-3
                    text-white
                    "
                >

                    <div
                        className="
                        text-[10px]
                        text-slate-300
                        "
                    >
                        Kâr
                    </div>


                    <div
                        className="
                        mt-1
                        font-black
                        text-xs
                        "
                    >
                        {formatCurrency(
                            kar
                        )}
                    </div>

                </div>


            </div>


        </div>

    );

}




export function ReelOperationCard({
    data,
}:{
    data:any;
}){


    if(!data){
        return null;
    }


    const hizmetDetay =
        data.hizmetDetay ?? [];



    return (

        <div
            className="
            rounded-3xl
            border
            border-slate-200
            bg-gradient-to-br
            from-white
            via-blue-50
            to-emerald-50
            p-5
            shadow-sm
            "
        >


            <div
                className="
                flex
                justify-between
                items-center
                mb-5
                "
            >

                <div>

                    <div
                        className="
                        text-lg
                        font-black
                        text-slate-900
                        "
                    >
                        Reel Operasyon
                    </div>


                    <div
                        className="
                        text-xs
                        text-slate-500
                        "
                    >
                        Gelir - gider - kârlılık analizi
                    </div>

                </div>



                <div
                    className="
                    rounded-xl
                    bg-blue-100
                    p-3
                    "
                >

                    <Wallet
                        size={22}
                        className="text-blue-700"
                    />

                </div>


            </div>





            <div
                className="
                grid
                grid-cols-2
                gap-3
                "
            >

                <KpiCard
                    title="Satış"
                    value={data.gelir?.satis ?? 0}
                    type="green"
                />


                <KpiCard
                    title="Alış"
                    value={data.gelir?.alis ?? 0}
                    type="green"
                />


                <KpiCard
                    title="Hizmet"
                    value={data.gider?.hizmet ?? 0}
                    type="red"
                />


                <KpiCard
                    title="Masraf"
                    value={data.gider?.masraf ?? 0}
                    type="red"
                />


            </div>





            <div
                className="
                mt-5
                rounded-2xl
                border
                bg-white
                p-4
                "
            >

                <div
                    className="
                    flex
                    items-center
                    gap-2
                    mb-4
                    "
                >

                    <BadgeDollarSign
                        size={18}
                        className="text-blue-600"
                    />

                    <span
                        className="
                        text-sm
                        font-black
                        "
                    >
                        Hizmet Dağılımı
                    </span>


                </div>




                <div
                    className="
                    space-y-3
                    max-h-[520px]
                    overflow-y-auto
                    pr-1
                    "
                >

                {
                    hizmetDetay.map(
                        (
                            item:any,
                            index:number
                        )=>(
                            <ServiceCard
                                key={index}
                                item={item}
                            />
                        )
                    )
                }

                </div>


            </div>





            <div
                className="
                mt-5
                rounded-2xl
                bg-slate-950
                p-5
                text-white
                "
            >

                <div
                    className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-slate-300
                    "
                >

                    <CircleDollarSign size={16}/>

                    Net Kâr

                </div>


                <div
                    className="
                    mt-2
                    text-3xl
                    font-black
                    "
                >

                    {formatCurrency(
                        data.kar ?? 0
                    )}

                </div>


            </div>


        </div>

    );

}
