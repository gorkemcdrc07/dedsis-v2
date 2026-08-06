import {
    Clock,
    Truck,
    CheckCircle2,
    Circle
} from "lucide-react";


type Props = {

    status:string | null;

};


export function EvideaStatusBadge({
    status
}:Props){


    const value = status ?? "Bilinmiyor";


    const config:any = {

        "Beklemede":{
            icon:Clock,
            style:"bg-amber-100 text-amber-700 border-amber-200"
        },

        "Yolda":{
            icon:Truck,
            style:"bg-blue-100 text-blue-700 border-blue-200"
        },

        "Teslim Edildi":{
            icon:CheckCircle2,
            style:"bg-emerald-100 text-emerald-700 border-emerald-200"
        }

    };


    const current =
        config[value] ?? {
            icon:Circle,
            style:"bg-slate-100 text-slate-600 border-slate-200"
        };


    const Icon =
        current.icon;


    return (

        <span
            className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${current.style}
            `}
        >

            <Icon size={14}/>

            {value}

        </span>

    );

}
