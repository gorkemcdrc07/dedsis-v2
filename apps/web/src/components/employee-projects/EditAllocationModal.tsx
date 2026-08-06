import { useState } from "react";
import { X, Save } from "lucide-react";


type Props = {

    open:boolean;

    projectName:string;

    current:number;

    max:number;

    loading?:boolean;

    onClose:()=>void;

    onSave:(value:number)=>void;

};



export function EditAllocationModal({
    open,
    projectName,
    current,
    max,
    loading,
    onClose,
    onSave,
}:Props){


    const [value,setValue] =
        useState(
            current.toString()
        );



    if(!open){
        return null;
    }



    const numberValue =
        Number(value);



    const invalid =
        numberValue > max ||
        numberValue < 0;



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">


                <div className="flex items-center justify-between">


                    <div>

                        <h3 className="text-xl font-bold text-slate-900">
                            Proje Dağılımı Düzenle
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {projectName}
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-slate-100"
                    >
                        <X size={20}/>
                    </button>


                </div>




                <div className="mt-6">


                    <label className="text-sm font-semibold text-slate-600">
                        Yeni yüzde
                    </label>


                    <div className="mt-2 flex items-center gap-2">


                        <input
                            value={value}
                            onChange={
                                e=>setValue(e.target.value)
                            }
                            type="number"
                            className="h-12 w-full rounded-xl border px-4 text-lg font-bold outline-none focus:border-blue-500"
                        />


                        <span className="font-bold">
                            %
                        </span>


                    </div>


                </div>




                <div className="mt-5 rounded-2xl bg-blue-50 p-4">


                    <div className="text-sm text-blue-700">
                        Kullanılabilir maksimum
                    </div>


                    <div className="mt-1 text-2xl font-bold text-blue-800">
                        %{max}
                    </div>


                </div>




                {
                    invalid &&

                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">

                        Maksimum %{max} verebilirsiniz.

                    </div>

                }




                <div className="mt-6 flex justify-end gap-3">


                    <button
                        onClick={onClose}
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Vazgeç
                    </button>



                    <button
                        disabled={
                            invalid ||
                            loading
                        }
                        onClick={() =>
                            onSave(numberValue)
                        }
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >

                        <Save size={16}/>

                        Kaydet

                    </button>


                </div>


            </div>


        </div>

    );

}
