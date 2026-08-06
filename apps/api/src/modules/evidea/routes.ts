import type { FastifyInstance } from "fastify";

import {
    requireUser
} from "../../common/auth.js";

import {
    getEvideaDeliveries,
    createEvideaDeliveries,
    updateEvideaDelivery,
    getEvideaDeliveryHistory,
} from "./service.js";


export async function evideaRoutes(
    app:FastifyInstance
){


    app.get(
        "/deliveries",
        async(request)=>{

            await requireUser(request);


            const query =
                request.query as {
                    date?:string;
                };


            const data =
                await getEvideaDeliveries(
                    query.date
                );


            return {
                success:true,
                data
            };

        }
    );



    app.post(
        "/deliveries",
        async(request)=>{

            await requireUser(request);


            const body =
                request.body as any[];


            const data =
                await createEvideaDeliveries(
                    body
                );


            return {
                success:true,
                data
            };

        }
    );


    app.patch(
        "/deliveries/:id",
        async(request)=>{

            await requireUser(request);

            const {
                id
            } = request.params as {
                id:string;
            };


            const data =
                await updateEvideaDelivery(
                    Number(id),
                    request.body
                );


            return {
                success:true,
                data
            };

        }
    );


    app.get(
        "/deliveries/:id/history",
        async(request)=>{

            await requireUser(request);

            const {
                id
            } = request.params as {
                id:string;
            };


            const data =
                await getEvideaDeliveryHistory(
                    Number(id)
                );


            return {
                success:true,
                data
            };

        }
    );


}









