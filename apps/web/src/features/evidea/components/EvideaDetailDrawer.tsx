import {
    X,
    Truck,
    Phone,
    MapPin,
    CalendarDays,
    Copy,
    Check
} from "lucide-react";

import { useEffect, useState } from "react";

import type {
    EvideaDelivery
} from "../types";

import {
    EvideaStatusBadge
} from "./EvideaStatusBadge";
import {
    useUpdateEvideaDelivery
} from "../hooks/useEvideaMutations";


import {
    useEvideaHistory
} from "../hooks/useEvideaHistory";


type Props = {

    open:boolean;

    delivery:EvideaDelivery | null;

    onClose:()=>void;

};



export function EvideaDetailDrawer({

    delivery,

    onClose,

}:Props){


    const [status,setStatus] =
        useState("");

    const [newStatus,setNewStatus] =
        useState("");

    const [saving,setSaving] =
        useState(false);

    const [saved,setSaved] =
        useState(false);


    const [copied,setCopied] =
        useState(false);


    const [statuses,setStatuses] =
        useState([
            "Beklemede",
            "Yolda",
            "Teslim Edildi"
        ]);


    const updateMutation =
        useUpdateEvideaDelivery();


    const {
        data:history
    } = useEvideaHistory(
        delivery?.id
    );


    useEffect(()=>{

        if(delivery){

            setStatus(
                delivery.seyir_durumu ?? ""
            );

        }

    },[delivery]);



    useEffect(()=>{

        const handler = (event:KeyboardEvent)=>{

            if(event.key === "Escape"){

                onClose();

            }

        };


        window.addEventListener(
            "keydown",
            handler
        );


        return ()=>{

            window.removeEventListener(
                "keydown",
                handler
            );

        };

    },[onClose]);



    console.log("DRAWER DATA", delivery);


    const copyPlate = async()=>{

        await navigator.clipboard.writeText(
            delivery?.plaka ?? ""
        );

        setCopied(true);

        setTimeout(()=>{

            setCopied(false);

        },1500);

    };


    if(!delivery){

        return null;

    }



    return (

        <div
            className="
            fixed
            inset-0
            z-50
            flex
            justify-end
            bg-black/30
            "
        >


            <div
                className="
                h-full
                w-full
                max-w-md
                bg-white
                p-6
                shadow-xl
                "
            >


                <div
                    className="
                    rounded-2xl
                    bg-slate-900
                    p-5
                    text-white
                    flex
                    items-center
                    justify-between
                    "
                >

                    <div className="
                    flex
                    items-center
                    gap-3
                    ">

                        <Truck size={32}/>

                        <div>

                            <h2 className="text-2xl font-bold">
                                {delivery.plaka}
                            </h2>

                            <p className="text-sm text-slate-300">
                                {delivery.surucu_adi_soyadi}
                            </p>

                        </div>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                        rounded-xl
                        p-2
                        hover:bg-slate-100
                        "
                    >

                        <X size={20}/>

                    </button>


                </div>




                <div className="mt-6 space-y-5">



                    <div className="rounded-2xl bg-slate-50 p-4">

                        <p className="text-xs text-slate-500">
                            Durum
                        </p>

                        <div className="mt-2">

                            <EvideaStatusBadge
                                status={
                                    status
                                }
                            />


                            <div className="
                            mt-4
                            flex
                            gap-2
                            flex-wrap
                            ">

                                {
                                    [
                                        "Beklemede",
                                        "Yolda",
                                        "Teslim Edildi"
                                    ].map(item=>(

                                        <button

                                            key={item}

                                            onClick={()=>
                                                setStatus(item)
                                            }

                                            className={
                                                "rounded-full border px-4 py-2 text-sm " +
                                                (status === item
                                                    ? "bg-slate-900 text-white"
                                                    : "hover:bg-slate-100")
                                            }

                                        >

                                            {item}

                                        </button>

                                    ))
                                }

                            </div>


                            <select
                                value={
                                    status
                                }
                                onChange={
                                    e=>setStatus(
                                        e.target.value
                                    )
                                }
                                className="
                                mt-3
                                h-10
                                w-full
                                rounded-xl
                                border
                                px-3
                                "
                            >

                                {
                                    statuses.map(item=>(
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    ))
                                }

                            </select>


                            <div className="
                            mt-3
                            flex
                            gap-2
                            ">

                                <input

                                    value={
                                        newStatus
                                    }

                                    onChange={
                                        e=>setNewStatus(
                                            e.target.value
                                        )
                                    }

                                    placeholder="Yeni durum"

                                    className="
                                    h-10
                                    flex-1
                                    rounded-xl
                                    border
                                    px-3
                                    "

                                />


                                <button

                                    onClick={()=>{

                                        const value =
                                            newStatus.trim();


                                        if(!value){
                                            return;
                                        }


                                        if(!statuses.includes(value)){

                                            setStatuses([
                                                ...statuses,
                                                value
                                            ]);

                                        }


                                        setStatus(value);

                                        setNewStatus("");

                                    }}

                                    className="
                                    rounded-xl
                                    bg-slate-200
                                    px-4
                                    text-sm
                                    "

                                >

                                    Ekle

                                </button>


                            </div>


                            <button

                                onClick={async()=>{

                                    setSaving(true);

                                    setSaved(false);


                                    await updateMutation.mutateAsync({

                                        id:delivery.id,

                                        payload:{
                                            seyir_durumu:status
                                        }

                                    });


                                    setSaving(false);

                                    setSaved(true);


                                    setTimeout(()=>{

                                        setSaved(false);

                                    },2000);


                                }}

                                className="
                                mt-3
                                w-full
                                rounded-xl
                                bg-slate-900
                                px-4
                                py-2
                                text-white
                                "

                            >

                                {
                                    saving
                                    ?
                                    "Kaydediliyor..."
                                    :
                                    saved
                                    ?
                                    "Kaydedildi ✓"
                                    :
                                    "Durumu Kaydet"
                                }

                            </button>

                        </div>

                    </div>





                    <div className="
                    rounded-2xl
                    border
                    bg-white
                    p-5
                    shadow-sm
                    ">

                        <div className="
                        mb-4
                        flex
                        items-center
                        gap-2
                        font-bold
                        ">
                            <Truck size={20}/>
                            Araç Bilgileri
                        </div>


                        <div className="space-y-3 text-sm">

                            <div className="flex items-center justify-between">

    <span className="text-slate-500">
        Plaka
    </span>


    <div className="flex items-center gap-2">

        <span className="font-semibold">
            {delivery.plaka}
        </span>


        <button

            onClick={copyPlate}

            className="
            rounded-lg
            p-1.5
            text-slate-500
            hover:bg-slate-100
            "

        >

            {
                copied
                ?
                <Check size={15}/>
                :
                <Copy size={15}/>
            }

        </button>

    </div>

</div>


                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Sürücü
                                </span>

                                <span className="font-semibold">
                                    {delivery.surucu_adi_soyadi}
                                </span>
                            </div>


                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Telefon
                                </span>

                                <span className="font-semibold">
                                    {delivery.iletisim}
                                </span>
                            </div>

                        </div>

                    </div>



                    <div className="
                    rounded-2xl
                    border
                    bg-white
                    p-5
                    shadow-sm
                    ">

                        <div className="
                        mb-4
                        flex
                        items-center
                        gap-2
                        font-bold
                        ">
                            <MapPin size={20}/>
                            Rota
                        </div>


                        <div className="text-sm">

                            <div>
                                {delivery.yukleme_yeri}
                            </div>


                            <div className="
                            my-3
                            text-center
                            text-xl
                            text-slate-400
                            ">
                                ↓
                            </div>


                            <div className="font-semibold">
                                {delivery.varis_noktasi}
                            </div>

                        </div>

                    </div>



                    <div className="
                    rounded-2xl
                    border
                    bg-white
                    p-5
                    shadow-sm
                    ">

                        <div className="
                        mb-4
                        flex
                        items-center
                        gap-2
                        font-bold
                        ">
                            <CalendarDays size={20}/>
                            Planlama
                        </div>


                        <div className="space-y-3 text-sm">


                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Yükleme
                                </span>

                                <span className="font-semibold">
                                    {delivery.yukleme_tarihi}
                                    {" "}
                                    {delivery.planlanan_yukleme_saati}
                                </span>

                            </div>


                            <div className="flex justify-between">

                                <span className="text-slate-500">
                                    Teslim
                                </span>

                                <span className="font-semibold">
                                    {delivery.planlanan_teslim_tarihi}
                                </span>

                            </div>


                        </div>

                    </div>


                </div>


            </div>


        </div>

    );

}




















