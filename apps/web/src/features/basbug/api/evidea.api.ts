import { api } from "../../../lib/api";
import type {
    BasbugDelivery,
    CreateBasbugDeliveryPayload,
} from "../types";


export async function getBasbugDeliveries(
    date?:string
){

    const params =
        date
        ? `?date=${date}`
        : "";


    return api<BasbugDelivery[]>(
        `/api/v1/basbug/deliveries${params}`
    );

}


export async function createBasbugDeliveries(
    payload:CreateBasbugDeliveryPayload[]
){

    return api<BasbugDelivery[]>(
        "/api/v1/basbug/deliveries",
        {
            method:"POST",
            body:JSON.stringify(payload),
        }
    );

}


export async function updateBasbugDelivery(
    id:number,
    payload:Partial<BasbugDelivery>
){

    return api<BasbugDelivery>(
        `/api/v1/basbug/deliveries/${id}`,
        {
            method:"PATCH",
            body:JSON.stringify(payload),
        }
    );

}




export async function getBasbugDeliveryHistory(
    id:number
){

    return api<any[]>(
        `/api/v1/basbug/deliveries/${id}/history`
    );

}



