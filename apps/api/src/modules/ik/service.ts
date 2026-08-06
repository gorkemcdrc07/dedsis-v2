import {
    supabaseAdmin
} from "../supabase/client.js";





function normalizeName(
    value:string
){

    return value
        .toLocaleLowerCase("tr-TR")
        .replace(/\s+/g,"")
        .replace(/ı/g,"i")
        .replace(/ş/g,"s")
        .replace(/ğ/g,"g")
        .replace(/ü/g,"u")
        .replace(/ö/g,"o")
        .replace(/ç/g,"c");

}



async function findEmployeeId(
    name:string
){

    const normalized =
        normalizeName(name);



    const {
        data,
        error
    } =
    await supabaseAdmin
    .from("v2_employees")
    .select(`
        id,
        full_name
    `);



    if(error){

        throw new Error(
            error.message
        );

    }



    const employee =
        (data ?? [])
        .find(
            x =>
            normalizeName(x.full_name)
            ===
            normalized
        );



    return employee?.id ?? null;

}

export async function getIKKayitlari(params?:{ ay?:number; yil?:number }){


    const data:any[] = [];
    for(let from = 0; ; from += 1000){
        let query = supabaseAdmin.from("ik_kayitlari").select("*").order("id", { ascending:false });
        if(params?.ay) query = query.eq("donem_ay", params.ay);
        if(params?.yil) query = query.eq("donem_yil", params.yil);
        const { data:page, error } = await query.range(from, from + 999);
        if(error) throw new Error(error.message);
        data.push(...(page ?? []));
        if((page?.length ?? 0) < 1000) break;
    }



    const ids =
        (data ?? [])
        .map(
            x=>x.id
        );



    if(ids.length === 0){

        return [];

    }



    const dagitimlar:any[] = [];
    for(let index = 0; index < ids.length; index += 500){
        const { data:chunk, error:dagitimError } = await supabaseAdmin
            .from("ik_proje_dagilimlari")
            .select("*")
            .in("ik_kayit_id", ids.slice(index, index + 500));
        if(dagitimError) throw new Error(dagitimError.message);
        dagitimlar.push(...(chunk ?? []));
    }



    const employeeIds =
        (data ?? [])
        .map(
            x=>x.kullanici_id
        )
        .filter(Boolean);



    const {
        data:history
    } =
    employeeIds.length
    ?
    await supabaseAdmin
    .from("v2_employee_project_history")
    .select(`
        employee_id,
        created_at
    `)
    .in(
        "employee_id",
        employeeIds
    )
    .order(
        "created_at",
        {
            ascending:false
        }
    )
    :
    {
        data:[]
    };



    return (data ?? []).map(
        row=>{


            const rowDagitimlari =
                dagitimlar
                .filter(
                    x=>
                    x.ik_kayit_id === row.id
                );


            const sonDagitim =
                rowDagitimlari
                .sort(
                    (a,b)=>
                    new Date(b.created_at).getTime()
                    -
                    new Date(a.created_at).getTime()
                )[0];


            const sonYetkilendirme =
                history?.find(
                    x =>
                    x.employee_id === row.kullanici_id
                );


            return {

                ...row,


                sonYetkilendirmeDegisikligi:
                    sonYetkilendirme?.created_at
                    ??
                    null,


                dagitimGuncel:
                    !sonYetkilendirme
                    ||
                    !sonDagitim
                    ||
                    new Date(sonDagitim.created_at)
                    >=
                    new Date(sonYetkilendirme.created_at),


                dagitimDurumu:
                    rowDagitimlari.length
                    ?
                    "dagitildi"
                    :
                    "bekliyor",


                dagitimlar:
                    rowDagitimlari

            };


        }
    );


}


export async function getIKImports(params?:{ ay?:number; yil?:number }){


    let query = supabaseAdmin.from("ik_importlar").select("*").order("id", { ascending:false }).limit(100);
    if(params?.ay) query = query.eq("donem_ay", params.ay);
    if(params?.yil) query = query.eq("donem_yil", params.yil);
    const {
        data,
        error
    } = await query;



    if(error){

        throw new Error(
            error.message
        );

    }


    return data ?? [];

}

export async function deleteIKPeriod(params:{ ay:number; yil:number }){
    const ids:Array<number> = [];
    for(let from = 0; ; from += 1000){
        const { data, error } = await supabaseAdmin.from("ik_kayitlari").select("id").eq("donem_ay", params.ay).eq("donem_yil", params.yil).range(from, from + 999);
        if(error) throw new Error(error.message);
        ids.push(...(data ?? []).map((row) => Number(row.id)));
        if((data?.length ?? 0) < 1000) break;
    }
    for(let index = 0; index < ids.length; index += 500){
        const { error } = await supabaseAdmin.from("ik_proje_dagilimlari").delete().in("ik_kayit_id", ids.slice(index, index + 500));
        if(error) throw new Error(error.message);
    }
    const { error:recordsError } = await supabaseAdmin.from("ik_kayitlari").delete().eq("donem_ay", params.ay).eq("donem_yil", params.yil);
    if(recordsError) throw new Error(recordsError.message);
    const { error:importsError } = await supabaseAdmin.from("ik_importlar").delete().eq("donem_ay", params.ay).eq("donem_yil", params.yil);
    if(importsError) throw new Error(importsError.message);
    return { deletedRecords:ids.length };
}





export async function createIKImport(
    payload:{
        dosyaAdi:string;
        donemAy:number;
        donemYil:number;
        rows:any[];
    }
){

    let eslesenSayisi = 0;
    let eslesmeyenSayisi = 0;


    const {
        data:importData,
        error:importError
    }
    =
    await supabaseAdmin
    .from(
        "ik_importlar"
    )
    .insert({

        dosya_adi:
            payload.dosyaAdi,

        donem_ay:
            payload.donemAy,

        donem_yil:
            payload.donemYil,

        kayit_sayisi:
            payload.rows.length

    })
    .select()
    .single();



    if(importError){

        throw new Error(
            importError.message
        );

    }




    const kayitlar =
        await Promise.all(
            payload.rows.map(
                async row=>{

                const kullaniciId =
                    await findEmployeeId(
                        row.personelAdi
                    );


                if(kullaniciId){
                    eslesenSayisi++;
                }
                else{
                    eslesmeyenSayisi++;
                }



            return {

                import_id:
                    importData.id,


                kullanici_id:
                    kullaniciId,


                personel_adi:
                    row.personelAdi,


                sicil_no:
                    row.sicilNo
                    ??
                    null,


                departman:
                    row.departman
                    ??
                    null,


                donem_ay:
                    payload.donemAy,


                donem_yil:
                    payload.donemYil,


                brut_ucret:
                    Number(row.brutUcret)
                    ||
                    0,


                isveren_maliyeti:
                    Number(row.isverenMaliyeti)
                    ||
                    0

                };

            }
        )
    );




    const {
        data,
        error
    }
    =
    await supabaseAdmin
    .from(
        "ik_kayitlari"
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
            data ?? [],

        ozet:{
            toplam:
                payload.rows.length,

            eslesen:
                eslesenSayisi,

            eslesmeyen:
                eslesmeyenSayisi
        }

    };

}




export async function createIKDistribution(
    payload:{
        records:{
            id:number|string;
            isverenMaliyeti:number;
        }[];

        distribution:{
            projectId:number;
            rate:number;
        }[];
    }
){


    const totalRate =
        payload.distribution.reduce(
            (sum,x)=>
                sum + x.rate,
            0
        );


    if(totalRate !== 100){

        throw new Error(
            "Dağıtım oranı %100 olmalıdır."
        );

    }



    const inserts =
    payload.records.flatMap(
        record=>{


            return payload.distribution.map(
    item=>({


        ik_kayit_id:
            Number(record.id),


        project_id:
            item.projectId,


        oran:
            item.rate,


        tutar:
            Number(record.isverenMaliyeti)
            *
            item.rate
            /
            100


    })
);


        }
    );



    await supabaseAdmin
    .from(
        "ik_proje_dagilimlari"
    )
    .delete()
    .in(
        "ik_kayit_id",
        payload.records.map(
            x=>Number(x.id)
        )
    );



    const {
        data,
        error
    } =
    await supabaseAdmin
    .from(
        "ik_proje_dagilimlari"
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



    return data ?? [];

}





export async function createIKAutoDistribution(
    payload:{
        recordIds:number[];
    }
){


    const {
        data:records,
        error:recordsError
    } =
    await supabaseAdmin
    .from("ik_kayitlari")
    .select(`
        id,
        isveren_maliyeti,
        kullanici_id
    `)
    .in(
        "id",
        payload.recordIds
    );



    if(recordsError){

        throw new Error(
            recordsError.message
        );

    }



    const results:any[] = [];

    const invalidEmployees:any[] = [];



    for(const record of records ?? []){


        if(!record.kullanici_id){

            throw new Error(
                `ID ${record.id} için personel eşleşmesi bulunamadı.`
            );

        }



        const {
            data:projects,
            error:projectError
        } =
        await supabaseAdmin
        .from("v2_employee_projects")
        .select(`
            project_id,
            percentage
        `)
        .eq(
            "employee_id",
            record.kullanici_id
        );



        if(projectError){

            throw new Error(
                projectError.message
            );

        }



        const total =
            (projects ?? [])
            .reduce(
                (sum,item)=>
                    sum + Number(item.percentage),
                0
            );



        console.log(
            "AUTO DAGITIM DEBUG",
            {
                recordId: record.id,
                kullaniciId: record.kullanici_id,
                projects,
                total
            }
        );


        if(Math.abs(total - 100) > 0.01){

            invalidEmployees.push({
                recordId: record.id,
                kullaniciId: record.kullanici_id,
                total
            });

            continue;
        }



        await supabaseAdmin
        .from(
            "ik_proje_dagilimlari"
        )
        .delete()
        .eq(
            "ik_kayit_id",
            record.id
        );



        const inserts =
        (projects ?? [])
        .map(item=>({


            ik_kayit_id:
                record.id,


            project_id:
                item.project_id,


            oran:
                Number(item.percentage),


            tutar:
                Number(record.isveren_maliyeti)
                *
                Number(item.percentage)
                /
                100


        }));



        const {
            data,
            error
        } =
        await supabaseAdmin
        .from(
            "ik_proje_dagilimlari"
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



        results.push(
            ...data
        );


    }



    if(invalidEmployees.length){

        return {
            warning:true,
            message:
                "Bazı personellerin proje dağılımı %100 değildir.",
            invalidEmployees
        };

    }


    return results;

}

export async function deleteIKDistribution(
    recordId:number
){

    if(
        !Number.isInteger(recordId)
        ||
        recordId <= 0
    ){

        throw new Error(
            "Geçersiz İK kayıt numarası."
        );

    }


    const {
        data:record,
        error:recordError
    } =
    await supabaseAdmin
    .from(
        "ik_kayitlari"
    )
    .select(`
        id,
        personel_adi
    `)
    .eq(
        "id",
        recordId
    )
    .maybeSingle();


    if(recordError){

        throw new Error(
            recordError.message
        );

    }


    if(!record){

        throw new Error(
            "İK kaydı bulunamadı."
        );

    }


    const {
        data:deletedRows,
        error:deleteError
    } =
    await supabaseAdmin
    .from(
        "ik_proje_dagilimlari"
    )
    .delete()
    .eq(
        "ik_kayit_id",
        recordId
    )
    .select(`
        id,
        ik_kayit_id,
        project_id
    `);


    if(deleteError){

        throw new Error(
            deleteError.message
        );

    }


    if(
        !deletedRows
        ||
        deletedRows.length === 0
    ){

        throw new Error(
            "Bu kayıt için silinecek proje dağıtımı bulunamadı."
        );

    }


    return {

        recordId,

        personelAdi:
            record.personel_adi,

        deleted:true,

        deletedCount:
            deletedRows.length

    };

}



export async function getIKDefaultDistribution(
    recordId:number
){

    if(!Number.isInteger(recordId) || recordId <= 0){
        throw new Error("Geçersiz İK kayıt numarası.");
    }

    const {
        data:record,
        error:recordError
    } = await supabaseAdmin
        .from("ik_kayitlari")
        .select(`
            id,
            kullanici_id,
            personel_adi,
            isveren_maliyeti
        `)
        .eq("id",recordId)
        .maybeSingle();

    if(recordError){
        throw new Error(recordError.message);
    }

    if(!record){
        throw new Error("İK kaydı bulunamadı.");
    }

    if(!record.kullanici_id){
        throw new Error(
            "Bu İK kaydı sistemdeki bir personelle eşleşmiyor."
        );
    }

    const {
        data:projects,
        error:projectsError
    } = await supabaseAdmin
        .from("v2_employee_projects")
        .select(`
            id,
            project_id,
            percentage
        `)
        .eq("employee_id",record.kullanici_id);

    if(projectsError){
        throw new Error(projectsError.message);
    }

    if(!projects || projects.length === 0){
        throw new Error(
            "Personelin Yetkilendirme ekranında proje dağılımı bulunmuyor."
        );
    }

    const totalRate = projects.reduce(
        (total,item)=>
            total + Number(item.percentage),
        0
    );


    return {
        recordId:Number(record.id),
        personelAdi:record.personel_adi,
        kaynak:"yetkilendirme" as const,
        toplamOran:totalRate,
        dagitimlar:projects.map(item=>({
            id:Number(item.id),
            projectId:Number(item.project_id),
            rate:Number(item.percentage),
            amount:
                Number(record.isveren_maliyeti)
                *
                Number(item.percentage)
                /
                100
        }))
    };

}


















