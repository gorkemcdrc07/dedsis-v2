import {
    supabaseAdmin
} from "../supabase/client.js";



export async function getMuhasebeKayitlari(
    params?:{
        ay?:number;
        yil?:number;
    }
){


    const distributedIds = new Set<string>();
    for(let from = 0; ; from += 1000){
        const { data, error } = await supabaseAdmin
            .from("muhasebe_kayit_proje_dagilimlari")
            .select("muhasebe_kayit_id")
            .range(from, from + 999);
        if(error) throw new Error(error.message);
        for(const row of data ?? []) distributedIds.add(String(row.muhasebe_kayit_id));
        if((data?.length ?? 0) < 1000) break;
    }

    const records: any[] = [];
    for(let from = 0; ; from += 1000){
        let query = supabaseAdmin.from("muhasebe_kayitlari").select("*").order("id", { ascending:false });
        if(params?.ay) query = query.eq("donem_ay", params.ay);
        if(params?.yil) query = query.eq("donem_yil", params.yil);
        const { data, error } = await query.range(from, from + 999);
        if(error) throw new Error(error.message);
        records.push(...(data ?? []));
        if((data?.length ?? 0) < 1000) break;
    }

    return records.filter((row) => !distributedIds.has(String(row.id)));

}





export async function createMuhasebeImport(
    payload:{
        dosyaAdi:string;
        rows:any[];
        donemAy:number;
        donemYil:number;
    }
){


    const {
        data:importData,
        error:importError
    } =
    await supabaseAdmin
    .from(
        "muhasebe_importlar"
    )
    .insert({

        dosya_adi:
            payload.dosyaAdi,

        kayit_sayisi:
            payload.rows.length,

        donem_ay:
            payload.donemAy,

        donem_yil:
            payload.donemYil

    })
    .select()
    .single();



    if(importError){

        throw new Error(
            importError.message
        );

    }



    const kayitlar =
        payload.rows.map(row=>({


            import_id:
                importData.id,


            tarih:
                row.tarihObj instanceof Date
                ?
                row.tarihObj.toISOString()
                :
                row.tarih
                ?
                new Date(row.tarih).toISOString()
                :
                null,


            yevmiye_no:
                row.yevmiyeNo,


            fis_tipi:
                row.fisTipi,


            aciklama:
                row.aciklama,


            hesap_kodu:
                row.hesapKodu,


            hesap_adi:
                row.hesapAdi,


            borc:
                row.borc,


            alacak:
                row.alacak,


            donem_ay:
                payload.donemAy,


            donem_yil:
                payload.donemYil


        }));





    const {
        data,
        error
    } =
    await supabaseAdmin
    .from(
        "muhasebe_kayitlari"
    )
    .insert(
        kayitlar
    )
    .select();




    if(error){

        throw new Error(
            error.message
        );

    }



    return {

        import:
            importData,

        rows:
            data ?? []

    };

}




export async function getMuhasebeImports(
    params?:{
        ay?:number;
        yil?:number;
    }
){


    let query =
        supabaseAdmin
        .from(
            "muhasebe_importlar"
        )
        .select("*")
        .order(
            "id",
            {
                ascending:false
            }
        )
        .limit(100);



    if(params?.ay){

        query =
            query.eq(
                "donem_ay",
                params.ay
            );

    }



    if(params?.yil){

        query =
            query.eq(
                "donem_yil",
                params.yil
            );

    }



    const {
        data,
        error
    } =
    await query;



    if(error){

        throw new Error(
            error.message
        );

    }



    return data ?? [];

}





export async function createMuhasebeDistribution(
    payload:{
        records:{
            id:number|string;
            borc:number;
            alacak:number;
        }[];

        distribution:{
            projectId:number;
            rate:number;
        }[];
    }
){

    console.log(
        "MUHASEBE DISTRIBUTION DEBUG",
        JSON.stringify(payload,null,2)
    );


    const totalRate =
        payload.distribution.reduce(
            (sum,x)=>
                sum + x.rate,
            0
        );


if(
    Math.abs(totalRate - 100) > 0.01
){

    throw new Error(
        "Dağıtım oranı %100 olmalıdır."
    );

}



    const inserts =
    payload.records.flatMap(
        record=>{


            const amount =
                Number(record.borc)
                ||
                Number(record.alacak)
                ||
                0;



            return payload.distribution.map(
                item=>({


                    muhasebe_kayit_id:
                        Number(record.id),


                    project_id:
                        item.projectId,


                    oran:
                        item.rate,


                    tutar:
                        amount *
                        item.rate /
                        100


                })
            );


        }
    );



    await supabaseAdmin
    .from(
        "muhasebe_kayit_proje_dagilimlari"
    )
    .delete()
    .in(
        "muhasebe_kayit_id",
        payload.records.map(
            x=>Number(x.id)
        )
    );



    console.log(
        "INSERT DAGITIM SAYISI",
        inserts.length
    );


    const {
        data,
        error
    } =
    await supabaseAdmin
    .from(
        "muhasebe_kayit_proje_dagilimlari"
    )
    .insert(
        inserts
    )
    .select();



    if(error){

        throw new Error(
            error.message
        );

    }

console.log(
    "MUHASEBE KAYIT SAYISI",
    data?.length
);





    return data ?? [];

}
export async function getMuhasebeStats(
    params?: { ay?: number; yil?: number }
){


    const rows: Array<{ borc: number | null; alacak: number | null }> = [];
    for(let from = 0; ; from += 1000){
        let query = supabaseAdmin.from("muhasebe_kayitlari").select("borc,alacak");
        if(params?.ay) query = query.eq("donem_ay", params.ay);
        if(params?.yil) query = query.eq("donem_yil", params.yil);
        const { data, error } = await query.range(from, from + 999);
        if(error) throw new Error(error.message);
        rows.push(...(data ?? []));
        if((data?.length ?? 0) < 1000) break;
    }



    const totalBorc =
        rows.reduce(
            (sum,row)=>
                sum + Number(row.borc || 0),
            0
        );



    const totalAlacak =
        rows.reduce(
            (sum,row)=>
                sum + Number(row.alacak || 0),
            0
        );



    return {

        totalCount:
            rows.length,

        totalBorc,

        totalAlacak,

        balance:
            totalBorc - totalAlacak

    };

}

export async function deleteMuhasebePeriod(params: { ay: number; yil: number }) {
    const ids: Array<string | number> = [];
    for(let from = 0; ; from += 1000){
        const { data: records, error: recordsError } = await supabaseAdmin
            .from("muhasebe_kayitlari")
            .select("id")
            .eq("donem_ay", params.ay)
            .eq("donem_yil", params.yil)
            .order("id")
            .range(from, from + 999);
        if(recordsError) throw new Error(recordsError.message);
        ids.push(...(records ?? []).map((row) => row.id));
        if((records?.length ?? 0) < 1000) break;
    }

    for(let index = 0; index < ids.length; index += 500){
        const chunk = ids.slice(index, index + 500);
        const { error } = await supabaseAdmin
            .from("muhasebe_kayit_proje_dagilimlari")
            .delete()
            .in("muhasebe_kayit_id", chunk);
        if(error) throw new Error(error.message);
    }

    const { error: recordDeleteError } = await supabaseAdmin
        .from("muhasebe_kayitlari")
        .delete()
        .eq("donem_ay", params.ay)
        .eq("donem_yil", params.yil);
    if(recordDeleteError) throw new Error(recordDeleteError.message);

    const { error: importDeleteError } = await supabaseAdmin
        .from("muhasebe_importlar")
        .delete()
        .eq("donem_ay", params.ay)
        .eq("donem_yil", params.yil);
    if(importDeleteError) throw new Error(importDeleteError.message);

    return { deletedRecords: ids.length };
}















export async function getMuhasebeDashboard(
    params?:{
        ay?:number;
        yil?:number;
    }
){


    let query =
        supabaseAdmin
        .from(
            "muhasebe_kayitlari"
        )
        .select(
            "id,borc,alacak"
        );


    if(params?.ay){

        query =
            query.eq(
                "donem_ay",
                params.ay
            );

    }


    if(params?.yil){

        query =
            query.eq(
                "donem_yil",
                params.yil
            );

    }


    const {
        data:rows,
        error:rowsError
    } =
    await query;


    if(rowsError){

        throw new Error(
            rowsError.message
        );

    }



    const {
        data: dagitimlar,
        error: dagitimError
    } =
        await supabaseAdmin
            .from(
                "muhasebe_kayit_proje_dagilimlari"
            )
            .select(
                `
muhasebe_kayit_id,
project_id,
tutar,
oran
`
            );
    if (dagitimError) {

        throw new Error(
            dagitimError.message
        );

    }

    const projectIds =
        (dagitimlar ?? [])
            .map(
                x => x.project_id
            );


    const {
        data: projects
    } =
        await supabaseAdmin
            .from(
                "v2_projects"
            )
            .select(
                "id,display_name"
            )
            .in(
                "id",
                projectIds
            );



    const projectNameMap =
        new Map(
            (projects ?? [])
                .map(
                    x => [
                        x.id,
                        x.display_name
                    ]
                )
        );


    const dagitimKayitIds =
        (dagitimlar ?? [])
            .map(
                x => x.muhasebe_kayit_id
            );



    const {
        data: kayitDonemleri
    } =
        await supabaseAdmin
            .from(
                "muhasebe_kayitlari"
            )
            .select(
                "id,donem_ay,donem_yil"
            )
            .in(
                "id",
                dagitimKayitIds
            );



    const kayitMap =
        new Map(
            (kayitDonemleri ?? [])
                .map(
                    x => [
                        x.id,
                        x
                    ]
                )
        );



    let filteredDagitimlar =
        dagitimlar ?? [];



    if (params?.ay) {

        filteredDagitimlar =
            filteredDagitimlar.filter(
                x =>
                    kayitMap.get(
                        x.muhasebe_kayit_id
                    )?.donem_ay === params.ay
            );

    }



    if (params?.yil) {

        filteredDagitimlar =
            filteredDagitimlar.filter(
                x =>
                    kayitMap.get(
                        x.muhasebe_kayit_id
                    )?.donem_yil === params.yil
            );

    }



    const totalCount =
        rows?.length ?? 0;



    const distributedIds =
        new Set(
            filteredDagitimlar
            .map(
                x=>x.muhasebe_kayit_id
            )
        );



    const distributedCount =
        distributedIds.size;



    const waitingCount =
        totalCount -
        distributedCount;



    const totalBorc =
        (rows ?? [])
        .reduce(
            (sum,row)=>
                sum + Number(row.borc || 0),
            0
        );



    const totalAlacak =
        (rows ?? [])
        .reduce(
            (sum,row)=>
                sum + Number(row.alacak || 0),
            0
        );



    const projectMap =
        new Map();



    for(
        const item of filteredDagitimlar
    ){

        const key =
            item.project_id;


        if(!projectMap.has(key)){

            projectMap.set(
                key,
                {
                    projectId:key,
                    projectName:
                        projectNameMap.get(item.project_id) ?? "-",
                    count: 0,
                    amount:0
                }
            );

        }


        const project =
            projectMap.get(key);


        project.count++;

        project.amount +=
            Number(item.tutar || 0);

    }



    return {

        totalCount,

        waitingCount,

        distributedCount,

        totalBorc,

        totalAlacak,

        balance:
            totalBorc-totalAlacak,

        projects:
            Array.from(
                projectMap.values()
            )

    };

}













