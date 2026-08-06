import {
    Package,
    Clock3,
    Truck,
    CheckCircle2
} from "lucide-react";


type Props = {
    total:number;
    waiting:number;
    moving:number;
    completed:number;
};


export function EvideaStats({

    total,
    waiting,
    moving,
    completed

}:Props){


    const cards = [

        {
            title:"Toplam Teslimat",
            value:total,
            icon:Package,
            style:"bg-slate-50 text-slate-700"
        },


        {
            title:"Beklemede",
            value:waiting,
            icon:Clock3,
            style:"bg-amber-50 text-amber-700"
        },


        {
            title:"Yolda",
            value:moving,
            icon:Truck,
            style:"bg-blue-50 text-blue-700"
        },


        {
            title:"Teslim Edildi",
            value:completed,
            icon:CheckCircle2,
            style:"bg-emerald-50 text-emerald-700"
        }

    ];



    return (

        <div
            className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-4
            "
        >

            {
                cards.map(card=>{


                    const Icon =
                        card.icon;


                    return (

                        <div
                            key={card.title}
                            className="
                            group
                            rounded-2xl
                            border
                            bg-white
                            p-5
                            shadow-sm
                            transition
                            hover:-translate-y-1
                            hover:shadow-md
                            "
                        >


                            <div
                                className={`
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-xl
                                ${card.style}
                                `}
                            >

                                <Icon size={22}/>

                            </div>



                            <p className="
                            mt-4
                            text-sm
                            text-slate-500
                            ">
                                {card.title}
                            </p>



                            <p className="
                            mt-1
                            text-3xl
                            font-bold
                            text-slate-900
                            ">
                                {card.value}
                            </p>


                        </div>

                    );

                })
            }


        </div>

    );

}
