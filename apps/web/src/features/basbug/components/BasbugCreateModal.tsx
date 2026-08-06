import { useState } from "react";
import { X, Plus } from "lucide-react";

import type {
    CreateBasbugDeliveryPayload
} from "../types";


type Props = {

    open:boolean;

    loading?:boolean;

    onClose:()=>void;

    onSave:(payload:CreateBasbugDeliveryPayload)=>void;

};



export function BasbugCreateModal({

    open,

    loading,

    onClose,

    onSave,

}:Props){


    const [form,setForm] =
        useState<CreateBasbugDeliveryPayload>({

            plaka:"",
            surucu_adi_soyadi:"",
            iletisim:"",
            yukleme_yeri:"",
            varis_noktasi:"",
            yukleme_tarihi:"",
            planlanan_teslim_tarihi:"",
            seyir_durumu:"Beklemede",

        });



    if(!open){

        return null;

    }



    function update(
        key:keyof CreateBasbugDeliveryPayload,
        value:string
    ){

        setForm(prev=>({

            ...prev,

            [key]:value,

        }));

    }



    return (

        <div
            className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            "
        >


            <div
                className="
                w-full
                max-w-xl
                rounded-3xl
                bg-white
                p-6
                shadow-2xl
                "
            >


                <div className="
                    flex
                    items-center
                    justify-between
                ">


                    <div>

                        <h2 className="text-xl font-bold">
                            Yeni Teslimat
                        </h2>

                        <p className="text-sm text-slate-500">
                            Basbug operasyon kaydı oluştur.
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-slate-100"
                    >
                        <X size={20}/>
                    </button>


                </div>



                <div className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-4
                ">


                    <Input
                        label="Plaka"
                        value={form.plaka}
                        onChange={v=>update("plaka",v)}
                    />


                    <Input
                        label="Sürücü"
                        value={form.surucu_adi_soyadi}
                        onChange={v=>update("surucu_adi_soyadi",v)}
                    />


                    <Input
                        label="Telefon"
                        value={form.iletisim}
                        onChange={v=>update("iletisim",v)}
                    />


                    <Input
                        label="Yükleme Yeri"
                        value={form.yukleme_yeri}
                        onChange={v=>update("yukleme_yeri",v)}
                    />


                    <Input
                        label="Varış Noktası"
                        value={form.varis_noktasi}
                        onChange={v=>update("varis_noktasi",v)}
                    />


                    <Input
                        label="Yükleme Tarihi"
                        type="date"
                        value={form.yukleme_tarihi}
                        onChange={v=>update("yukleme_tarihi",v)}
                    />


                    <Input
                        label="Teslim Tarihi"
                        type="date"
                        value={form.planlanan_teslim_tarihi}
                        onChange={v=>update("planlanan_teslim_tarihi",v)}
                    />



                    <select
                        value={form.seyir_durumu}
                        onChange={
                            e=>update(
                                "seyir_durumu",
                                e.target.value
                            )
                        }
                        className="
                        h-11
                        rounded-xl
                        border
                        px-3
                        "
                    >

                        <option value="Beklemede">
                            Beklemede
                        </option>

                        <option value="Yolda">
                            Yolda
                        </option>

                        <option value="Teslim Edildi">
                            Teslim Edildi
                        </option>

                    </select>


                </div>




                <div className="
                    mt-6
                    flex
                    justify-end
                    gap-3
                ">


                    <button
                        onClick={onClose}
                        className="
                        rounded-xl
                        px-5
                        py-3
                        font-semibold
                        text-slate-600
                        "
                    >
                        Vazgeç
                    </button>



                    <button
                        disabled={loading}
                        onClick={()=>{
                            onSave(form);
                        }}
                        className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-5
                        py-3
                        font-semibold
                        text-white
                        disabled:opacity-50
                        "
                    >

                        <Plus size={16}/>

                        Kaydet

                    </button>


                </div>


            </div>


        </div>

    );

}



function Input({

    label,

    value,

    onChange,

    type="text"

}:{

    label:string;

    value?:string;

    onChange:(value:string)=>void;

    type?:string;

}){


    return (

        <div>

            <label className="mb-1 block text-sm font-medium">
                {label}
            </label>

            <input

                type={type}

                value={value ?? ""}

                onChange={
                    e=>onChange(
                        e.target.value
                    )
                }

                className="
                h-11
                w-full
                rounded-xl
                border
                px-3
                "

            />

        </div>

    );

}



