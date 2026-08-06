import { useQuery } from "@tanstack/react-query";

import {
    getBasbugDeliveryHistory
} from "../api/basbug.api";


export function useBasbugHistory(
    id:number | undefined
){

    const query =
        useQuery({

            queryKey:[
                "basbug-history",
                id
            ],


            queryFn:()=>
                getBasbugDeliveryHistory(
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




