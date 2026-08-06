import type { FastifyInstance } from "fastify";

import {
    requireUser
} from "../../common/auth.js";

import {
    getBasbugDeliveries,
    createBasbugDeliveries,
    updateBasbugDelivery,
    getBasbugDeliveryHistory,
} from "./service.js";


export async function basbugRoutes(
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
                await getBasbugDeliveries(
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
                await createBasbugDeliveries(
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
                await updateBasbugDelivery(
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
                await getBasbugDeliveryHistory(
                    Number(id)
                );


            return {
                success:true,
                data
            };

        }
    );


}














