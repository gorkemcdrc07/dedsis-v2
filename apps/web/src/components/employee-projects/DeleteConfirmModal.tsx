import { Trash2, X } from "lucide-react";


type Props = {

    open:boolean;

    projectName:string;

    loading?:boolean;

    onClose:()=>void;

    onConfirm:()=>void;

};



export function DeleteConfirmModal({
    open,
    projectName,
    loading,
    onClose,
    onConfirm,
}:Props){


    if(!open){
        return null;
    }



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">


                <div className="flex items-center justify-between">


                    <div className="flex items-center gap-3">

                        <div className="rounded-2xl bg-red-100 p-3 text-red-600">
                            <Trash2 size={22}/>
                        </div>


                        <div>

                            <h3 className="text-xl font-bold">
                                Projeyi Sil
                            </h3>

                            <p className="text-sm text-slate-500">
                                Bu işlem geri alınamaz.
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




                <div className="mt-6 rounded-2xl bg-slate-50 p-4">


                    <div className="text-sm text-slate-500">
                        Silinecek proje
                    </div>


                    <div className="mt-1 text-lg font-bold text-slate-900">
                        {projectName}
                    </div>


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
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        Sil
                    </button>


                </div>


            </div>


        </div>

    );

}
