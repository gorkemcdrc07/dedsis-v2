import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";


type Props = {

    open:boolean;

    employee:{
        id:number;
        name:string;
        username:string;
        is_active:boolean;
    } | null;

    loading?:boolean;

    onClose:()=>void;

    onSave:(payload:{
        id:number;
        full_name:string;
        username:string;
        is_active:boolean;
    })=>void;

};



export function EditEmployeeModal({

    open,

    employee,

    loading,

    onClose,

    onSave,

}:Props){


    const [name,setName] =
        useState("");


    const [username,setUsername] =
        useState("");


    const [active,setActive] =
        useState(true);



    useEffect(()=>{

        if(employee){

            setName(employee.name);

            setUsername(employee.username);

            setActive(employee.is_active);

        }

    },[employee]);



    if(!open || !employee){

        return null;

    }



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">


                <div className="flex items-center justify-between">


                    <div className="flex items-center gap-3">


                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">

                            <Pencil size={22}/>

                        </div>


                        <div>

                            <h3 className="text-xl font-bold">
                                Kullanıcı Düzenle
                            </h3>

                            <p className="text-sm text-slate-500">
                                Kullanıcı bilgilerini güncelleyin.
                            </p>

                        </div>


                    </div>



                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-slate-100"
                    >

                        <X size={20}/>

                    </button>


                </div>



                <div className="mt-6 space-y-4">


                    <div>

                        <label className="text-sm text-slate-500">
                            Ad Soyad
                        </label>

                        <input
                            value={name}
                            onChange={e=>setName(e.target.value)}
                            className="mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-500"
                        />

                    </div>



                    <div>

                        <label className="text-sm text-slate-500">
                            Kullanıcı Adı
                        </label>

                        <input
                            value={username}
                            onChange={e=>setUsername(e.target.value)}
                            className="mt-1 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:border-blue-500"
                        />

                    </div>



                    <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm">

                        <input
                            type="checkbox"
                            checked={active}
                            onChange={e=>setActive(e.target.checked)}
                        />

                        Aktif kullanıcı

                    </label>


                </div>



                <div className="mt-6 flex justify-end gap-3">


                    <button
                        onClick={onClose}
                        className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >

                        Vazgeç

                    </button>



                    <button
                        disabled={loading}
                        onClick={()=>{

                            onSave({

                                id:employee.id,

                                full_name:name,

                                username,

                                is_active:active

                            });

                        }}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >

                        Kaydet

                    </button>


                </div>


            </div>


        </div>

    );

}
