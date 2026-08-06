import type { FastifyInstance } from "fastify";

import {
    requireUser
} from "../../common/auth.js";
import { requirePermission } from "../../common/authorization.js";


import {
    getMuhasebeKayitlari,
    createMuhasebeImport,
    getMuhasebeImports,
    createMuhasebeDistribution,
    getMuhasebeStats,
    getMuhasebeDashboard
    ,deleteMuhasebePeriod
} from "./service.js";



export async function muhasebeRoutes(
    app:FastifyInstance
){


    app.get(
        "/health",
        async(request, reply)=>{

            await requireUser(request);


            return {
                success:true,
                module:"muhasebe"
            };

        }
    );



    app.get(
        "/kayitlar",
        async(request, reply)=>{


            await requireUser(request);


            const {
                ay,
                yil
            } = request.query as {
                ay?:string;
                yil?:string;
            };


            const data =
                await getMuhasebeKayitlari({

                    ay: ay
                    ? Number(ay)
                    : undefined,

                    yil: yil
                    ? Number(yil)
                    : undefined

                });


            return {

                success:true,

                data

            };


        }
    );






    app.get(
        "/stats",
        async(request, reply)=>{

            await requireUser(request);


            const { ay, yil } = request.query as { ay?: string; yil?: string };
            const data = await getMuhasebeStats({
                ay: ay ? Number(ay) : undefined,
                yil: yil ? Number(yil) : undefined
            });


            return {

                success:true,

                data

            };

        }
    );

    app.get(
        "/dashboard",
        async(request, reply)=>{

            await requireUser(request);


            const { ay, yil } = request.query as { ay?: string; yil?: string };
            const data = await getMuhasebeDashboard({
                ay: ay ? Number(ay) : undefined,
                yil: yil ? Number(yil) : undefined
            });


            return {

                success:true,

                data

            };

        }
    );



    app.get(
        "/imports",
        async(request, reply)=>{

            await requireUser(request);


            const {
                ay,
                yil
            } = request.query as {
                ay?:string;
                yil?:string;
            };


            const data =
                await getMuhasebeImports({

                    ay: ay
                    ? Number(ay)
                    : undefined,

                    yil: yil
                    ? Number(yil)
                    : undefined

                });


            return {

                success:true,

                data

            };

        }
    );



    app.post(
        "/import",
        async(request, reply)=>{


            console.log(
                "IMPORT ROUTE GİRDİ"
            );


            await requireUser(request);


            console.log(
                "USER OK"
            );


            const body =
                request.body as {

                    dosyaAdi:string;

                    rows:any[];

                    donemAy:number;

                    donemYil:number;

                };



            console.log(
                "MUHASEBE IMPORT DEBUG",
                {
                    dosyaAdi: body.dosyaAdi,
                    rowCount: body.rows?.length,
                    donemAy: body.donemAy,
                    donemYil: body.donemYil
                }
            );


            const data =
                await createMuhasebeImport(
                    body
                );



            return {

                success:true,

                data

            };


        }
    );

    app.delete("/period", async(request) => {
        await requirePermission(request, "accounting.delete");
        const { ay, yil } = request.query as { ay?: string; yil?: string };
        const month = Number(ay);
        const year = Number(yil);
        if(!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000){
            throw Object.assign(new Error("Geçerli bir ay ve yıl seçin."), { statusCode: 400 });
        }
        const data = await deleteMuhasebePeriod({ ay: month, yil: year });
        return { success: true, data };
    });




    app.post(
        "/distribution",
        async(request, reply)=>{


            await requireUser(request);


            const body =
                request.body as any;


            const data =
                await createMuhasebeDistribution(
                    body
                );


            return {

                success:true,

                data

            };

        }
    );


}















