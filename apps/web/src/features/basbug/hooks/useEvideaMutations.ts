import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createBasbugDeliveries,
    updateBasbugDelivery
} from "../api/basbug.api";

import type {
    CreateBasbugDeliveryPayload
} from "../types";


export function useCreateBasbugDelivery(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            (
                payload:CreateBasbugDeliveryPayload[]
            ) =>
                createBasbugDeliveries(
                    payload
                ),


        onSuccess:()=>{

            queryClient.invalidateQueries({
                queryKey:[
                    "basbug-deliveries"
                ]
            });

        }

    });

}


export function useUpdateBasbugDelivery(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            ({
                id,
                payload
            }:{
                id:number;
                payload:any;
            }) =>
                updateBasbugDelivery(
                    id,
                    payload
                ),


        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "basbug-deliveries"
                ]

            });

        }

    });

}






