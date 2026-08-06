import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";


type Props = {

    onEdit:()=>void;

    onDelete:()=>void;

};



export function ProjectActionsMenu({
    onEdit,
    onDelete,
}:Props){

    const [open,setOpen] =
        useState(false);



    return (

        <div className="relative">


            <button
                onClick={() =>
                    setOpen(!open)
                }
                className="rounded-xl p-2 text-slate-500 hover:bg-white hover:text-slate-900"
            >
                <MoreVertical size={18}/>
            </button>



            {
                open &&

                <>

                    <div
                        className="fixed inset-0 z-10"
                        onClick={() =>
                            setOpen(false)
                        }
                    />


                    <div className="absolute right-0 top-10 z-20 w-40 rounded-2xl border bg-white p-2 shadow-xl">


                        <button
                            onClick={()=>{
                                setOpen(false);
                                onEdit();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-blue-50"
                        >

                            <Pencil size={16}/>
                            Düzenle

                        </button>



                        <button
                            onClick={()=>{
                                setOpen(false);
                                onDelete();
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >

                            <Trash2 size={16}/>
                            Sil

                        </button>


                    </div>

                </>

            }


        </div>

    );

}
