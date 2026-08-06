import type { FastifyInstance } from "fastify";

import {
    requireUser
} from "../../common/auth.js";


import {
    getIKKayitlari,
    getIKImports,
    createIKImport,
    createIKDistribution,
    createIKAutoDistribution,
    getIKDefaultDistribution,
    deleteIKDistribution
} from "./service.js";



export async function ikRoutes(
    app:FastifyInstance
){


    app.get(
        "/health",
        async(request)=>{

            await requireUser(request);


            return {
                success:true,
                module:"ik"
            };

        }
    );



    app.get(
        "/kayitlar",
        async(request)=>{

            await requireUser(request);


            const data =
                await getIKKayitlari();


            return {

                success:true,

                data

            };

        }
    );



    app.get(
        "/imports",
        async(request)=>{

            await requireUser(request);


            const data =
                await getIKImports();


            return {

                success:true,

                data

            };

        }
    );



    app.post(
        "/import",
        async(request)=>{


            await requireUser(request);


            const body =
                request.body as {

                    dosyaAdi:string;

                    donemAy:number;

                    donemYil:number;

                    rows:any[];

                };


            const data =
                await createIKImport(
                    body
                );


            return {

                success:true,

                data

            };

        }
    );



    app.post(
        "/distribution",
        async(request)=>{


            await requireUser(request);


            const body =
                request.body as any;


            const data =
                await createIKDistribution(
                    body
                );


            return {

                success:true,

                data

            };

        }
    );



    app.post(
        "/auto-distribution",
        async(request)=>{


            await requireUser(request);


            const body =
                request.body as {
                    recordIds:number[];
                };


            let data;

            try{

                data =
                    await createIKAutoDistribution(
                        body
                    );

            }
            catch(error){

                console.log(
                    "AUTO DISTRIBUTION ERROR",
                    error
                );

                throw error;

            }


            return {

                success:true,

                data

            };

        }
    );



    app.get(
        "/kayitlar/:id/varsayilan-dagitim",
        async(request)=>{


            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            const recordId =
                Number(
                    params.id
                );


            const data =
                await getIKDefaultDistribution(
                    recordId
                );


            return {

                success:true,

                data

            };

        }
    );


    app.delete(
        "/kayitlar/:id/dagitim",
        async(request)=>{


            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            const recordId =
                Number(params.id);


            const data =
                await deleteIKDistribution(
                    recordId
                );


            return {

                success:true,

                data

            };

        }
    );


}


