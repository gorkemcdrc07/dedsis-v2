import { api } from "../../../lib/api";
import type {
    EvideaDelivery,
    CreateEvideaDeliveryPayload,
} from "../types";


export async function getEvideaDeliveries(
    date?:string
){

    const params =
        date
        ? `?date=${date}`
        : "";


    return api<EvideaDelivery[]>(
        `/api/v1/evidea/deliveries${params}`
    );

}


export async function createEvideaDeliveries(
    payload:CreateEvideaDeliveryPayload[]
){

    return api<EvideaDelivery[]>(
        "/api/v1/evidea/deliveries",
        {
            method:"POST",
            body:JSON.stringify(payload),
        }
    );

}


export async function updateEvideaDelivery(
    id:number,
    payload:Partial<EvideaDelivery>
){

    return api<EvideaDelivery>(
        `/api/v1/evidea/deliveries/${id}`,
        {
            method:"PATCH",
            body:JSON.stringify(payload),
        }
    );

}




export async function getEvideaDeliveryHistory(
    id:number
){

    return api<any[]>(
        `/api/v1/evidea/deliveries/${id}/history`
    );

}

