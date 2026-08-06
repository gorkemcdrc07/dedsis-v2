import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    createEvideaDeliveries,
    updateEvideaDelivery
} from "../api/evidea.api";

import type {
    CreateEvideaDeliveryPayload
} from "../types";


export function useCreateEvideaDelivery(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:
            (
                payload:CreateEvideaDeliveryPayload[]
            ) =>
                createEvideaDeliveries(
                    payload
                ),


        onSuccess:()=>{

            queryClient.invalidateQueries({
                queryKey:[
                    "evidea-deliveries"
                ]
            });

        }

    });

}


export function useUpdateEvideaDelivery(){

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
                updateEvideaDelivery(
                    id,
                    payload
                ),


        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "evidea-deliveries"
                ]

            });

        }

    });

}




