import type { FastifyInstance } from "fastify";

import {
    requireUser
} from "../../common/auth.js";
import { requirePermission } from "../../common/authorization.js";


import {
    getIKKayitlari,
    getIKImports,
    createIKImport,
    createIKDistribution,
    createIKAutoDistribution,
    getIKDefaultDistribution,
    deleteIKDistribution,
    deleteIKPeriod
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


            const { ay, yil } = request.query as { ay?:string; yil?:string };
            const data = await getIKKayitlari({ ay:ay ? Number(ay) : undefined, yil:yil ? Number(yil) : undefined });


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


            const { ay, yil } = request.query as { ay?:string; yil?:string };
            const data = await getIKImports({ ay:ay ? Number(ay) : undefined, yil:yil ? Number(yil) : undefined });


            return {

                success:true,

                data

            };

        }
    );



    app.post(
        "/import",
        async(request)=>{


            await requirePermission(request, "hr.import");


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


            await requirePermission(request, "hr.assign");


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


            await requirePermission(request, "hr.assign");


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


            await requirePermission(request, "hr.delete");


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

    app.delete("/period", async(request) => {
        await requirePermission(request, "hr.delete");
        const { ay, yil } = request.query as { ay?:string; yil?:string };
        const month = Number(ay); const year = Number(yil);
        if(!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000){
            throw Object.assign(new Error("Geçerli bir dönem seçin."), { statusCode:400 });
        }
        return { success:true, data:await deleteIKPeriod({ ay:month, yil:year }) };
    });


}


