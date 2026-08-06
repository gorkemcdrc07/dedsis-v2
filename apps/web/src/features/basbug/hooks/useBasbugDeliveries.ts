import { useQuery } from "@tanstack/react-query";

import {
    getBasbugDeliveries,
} from "../api/basbug.api";


export function useBasbugDeliveries(
    date?:string
){

    const query =
        useQuery({

            queryKey:[
                "basbug-deliveries",
                date,
            ],


            queryFn:()=>
                getBasbugDeliveries(date),

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





