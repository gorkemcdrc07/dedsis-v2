import { useQuery } from "@tanstack/react-query";

import {
    getEvideaDeliveries,
} from "../api/evidea.api";


export function useEvideaDeliveries(
    date?:string
){

    const query =
        useQuery({

            queryKey:[
                "evidea-deliveries",
                date,
            ],


            queryFn:()=>
                getEvideaDeliveries(date),

        });


    return {

        data:
            query.data ?? [],


        loading:
            query.isLoading,


        error:
            query.error instanceof Error
            ? query.error.message
            : null,

    };

}



