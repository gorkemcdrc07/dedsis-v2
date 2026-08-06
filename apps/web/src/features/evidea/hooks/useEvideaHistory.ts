import { useQuery } from "@tanstack/react-query";

import {
    getEvideaDeliveryHistory
} from "../api/evidea.api";


export function useEvideaHistory(
    id:number | undefined
){

    const query =
        useQuery({

            queryKey:[
                "evidea-history",
                id
            ],


            queryFn:()=>
                getEvideaDeliveryHistory(
                    id!
                ),


            enabled:
                !!id

        });


    return {

        data:
            query.data ?? [],


        loading:
            query.isLoading

    };

}

