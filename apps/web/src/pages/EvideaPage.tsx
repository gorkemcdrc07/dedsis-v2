import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import type {
    CurrentSession
} from "../features/auth/auth";

import {
    hasRole
} from "../features/auth/auth";
import type {
    EvideaDelivery
} from "../features/evidea/types";

import {
    useEvideaDeliveries,
} from "../features/evidea/hooks/useEvideaDeliveries";


import {
    EvideaHeader,
} from "../features/evidea/components/EvideaHeader";


import {
    EvideaStats,
} from "../features/evidea/components/EvideaStats";


import {
    EvideaTable,
} from "../features/evidea/components/EvideaTable";

import {
    EvideaFilters
} from "../features/evidea/components/EvideaFilters";


import {
    EvideaCreateModal
} from "../features/evidea/components/EvideaCreateModal";


import {
    EvideaDetailDrawer
} from "../features/evidea/components/EvideaDetailDrawer";


import {
    useCreateEvideaDelivery,
    useUpdateEvideaDelivery
} from "../features/evidea/hooks/useEvideaMutations";



function today(){

    return new Date()
        .toISOString()
        .split("T")[0];

}



export default function EvideaPage(){

    const session =
        useOutletContext<CurrentSession>();


    const [date,setDate] =
        useState(today());


    const [createOpen,setCreateOpen] =
        useState(false);
const [status,setStatus] =
    useState("");

const [search,setSearch] =
    useState("");
const [
    selectedDelivery,
    setSelectedDelivery
] = useState<EvideaDelivery | null>(null);



    const {
    data=[],
    loading,
} =
    useEvideaDeliveries(date);


    const createMutation =
        useCreateEvideaDelivery();


    const updateMutation =
        useUpdateEvideaDelivery();

const filteredData =
    useMemo(()=>{

        return data.filter(item=>{

            const matchStatus =
                !status ||
                item.seyir_durumu === status;


            const text =
                search.toLowerCase();


            const matchSearch =
                !search ||
                item.plaka
                    ?.toLowerCase()
                    .includes(text)
                ||
                item.surucu_adi_soyadi
                    ?.toLowerCase()
                    .includes(text);



            return matchStatus && matchSearch;

        });

    },[
        data,
        status,
        search
    ]);



    const summary =
        useMemo(()=>{

            return {

                total:
                    data.length,


                moving:
                    data.filter(
                        x =>
                        x.seyir_durumu === "Yolda"
                    ).length,


                completed:
                    data.filter(
                        x =>
                        x.seyir_durumu === "Teslim Edildi"
                    ).length,


                waiting:
                    data.filter(
                        x =>
                        x.seyir_durumu === "Beklemede"
                    ).length,

            };

        },[data]);



    return (

        <div className="space-y-6">


            <EvideaHeader

                date={date}

                onDateChange={
                    setDate
                }

                onCreate={() =>
                    setCreateOpen(true)
                }

            />

<EvideaFilters

    status={status}

    search={search}

    onStatusChange={
        setStatus
    }

    onSearchChange={
        setSearch
    }

    onClear={()=>{
        setStatus("");
        setSearch("");
    }}

/>



            <EvideaStats

                total={
                    summary.total
                }

                waiting={
                    summary.waiting
                }

                moving={
                    summary.moving
                }

                completed={
                    summary.completed
                }

            />



            <div
                className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                bg-white
                px-5
                py-3
                text-sm
                shadow-sm
                "
            >

                <span className="text-slate-500">
                    Gösterilen teslimat
                </span>


                <span className="font-bold text-slate-900">
                    {filteredData.length} kayıt
                </span>

            </div>



            {
    loading ?

    <div className="space-y-4">

        {[1,2,3].map(item=>(

            <div
                key={item}
                className="
                h-24
                animate-pulse
                rounded-2xl
                border
                bg-slate-100
                "
            />

        ))}

    </div>

    :

  <EvideaTable
    deliveries={filteredData}

    onDetail={
        (item)=>{
            console.log("DETAY TIKLANDI", item);
            setSelectedDelivery(item);
        }
    }


    onStatusChange={
        (id,status)=>{

            updateMutation.mutate({

                id,

                payload:{
                    seyir_durumu:status
                }

            });

        }
    }

/>

}


            <EvideaCreateModal

                open={
                    createOpen
                }

                loading={
                    createMutation.isPending
                }

                onClose={() =>
                    setCreateOpen(false)
                }

                onSave={async(payload)=>{

                    await createMutation.mutateAsync([
                        payload
                    ]);

                    setCreateOpen(false);

                }}

            />


            <EvideaDetailDrawer

                open={
                    !!selectedDelivery
                }

                delivery={
                    selectedDelivery
                }

                onClose={() =>
                    setSelectedDelivery(null)
                }

            />


        </div>

    );

}















