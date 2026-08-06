import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

import { useEmployeeProjectHistory } from "../../features/employee-projects/useEmployeeProjectHistory";


type Props = {

    employeeId:number;

};



export function EmployeeProjectHistory({
    employeeId,
}:Props){

    const [open,setOpen] =
        useState(false);


    const {
        data,
        loading,
    } =
        useEmployeeProjectHistory(
            open ? employeeId : 0
        );



    return (

        <div className="mt-4">


            <button
                onClick={() =>
                    setOpen(!open)
                }
                className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >

                <span className="flex items-center gap-2">

                    <Clock size={16}/>

                    Son Değişiklikler

                </span>


                <ChevronDown
                    size={16}
                    className={
                        open
                        ? "rotate-180 transition"
                        : "transition"
                    }
                />

            </button>



            {
                open &&

                <div className="mt-3 space-y-2">


                    {
                        loading ?

                        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                            Yükleniyor...
                        </div>


                        :

                        data.length===0 ?

                        <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center">

                            <div className="text-2xl">
                                🕒
                            </div>


                            <div className="mt-2 font-semibold text-slate-700">
                                Henüz değişiklik yok
                            </div>


                            <div className="mt-1 text-sm text-slate-500">
                                Bu kullanıcı için proje değişiklik geçmişi bulunmuyor.
                            </div>

                        </div>


                        :

                        data.map(item => {

                            const oldValue =
                                Number(item.old_percentage ?? 0);

                            const newValue =
                                Number(item.new_percentage ?? 0);

                            const diff =
                                newValue - oldValue;


                            return (

                                <div
                                    key={item.id}
                                    className="rounded-2xl border bg-white p-4 shadow-sm"
                                >

                                    <div className="flex items-start gap-3">

                                        <div
                                            className={
                                                diff > 0
                                                ?
                                                "mt-1 h-3 w-3 rounded-full bg-emerald-500"
                                                :
                                                diff < 0
                                                ?
                                                "mt-1 h-3 w-3 rounded-full bg-red-500"
                                                :
                                                "mt-1 h-3 w-3 rounded-full bg-slate-400"
                                            }
                                        />


                                        <div className="flex-1">


                                            <div className="text-xs text-slate-400">
                                                {
                                                    new Date(
                                                        item.created_at
                                                    ).toLocaleString("tr-TR")
                                                }
                                            </div>


                                            <div className="mt-2 font-semibold text-slate-800">
                                                {
                                                    item.projects?.display_name ??
                                                    "Proje"
                                                }
                                            </div>


                                            <div className="mt-2 flex items-center gap-3 text-sm">


                                                <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold">
                                                    %{oldValue}
                                                </span>


                                                <span className="text-slate-400">
                                                    →
                                                </span>


                                                <span className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                                                    %{newValue}
                                                </span>


                                            </div>


                                            <div
                                                className={
                                                    diff > 0
                                                    ?
                                                    "mt-3 text-sm font-bold text-emerald-600"
                                                    :
                                                    diff < 0
                                                    ?
                                                    "mt-3 text-sm font-bold text-red-600"
                                                    :
                                                    "mt-3 text-sm font-bold text-slate-500"
                                                }
                                            >

                                                Değişim:
                                                {" "}
                                                {
                                                    diff > 0
                                                    ? "+"
                                                    : ""
                                                }
                                                {diff}%

                                            </div>


                                        </div>

                                    </div>


                                </div>

                            );

                        })

                    }


                </div>

            }


        </div>

    );

}


