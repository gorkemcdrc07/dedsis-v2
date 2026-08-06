import { api } from "../../../lib/api";



export async function createMuhasebeImport(
    payload:any
){

    return api(
        "/api/v1/muhasebe/import",
        {
            method:"POST",
            body:JSON.stringify(payload)
        }
    );

}




export async function getMuhasebeImports(
    params?:{
        ay?:number;
        yil?:number;
    }
){

    const query =
        new URLSearchParams();


    if(params?.ay){

        query.set(
            "ay",
            String(params.ay)
        );

    }


    if(params?.yil){

        query.set(
            "yil",
            String(params.yil)
        );

    }


    return api<any[]>(
        `/api/v1/muhasebe/imports?${query.toString()}`
    );

}




export async function getMuhasebeKayitlari(
    params?:{
        ay?:number;
        yil?:number;
    }
){

    const query =
        new URLSearchParams();


    if(params?.ay){

        query.set(
            "ay",
            String(params.ay)
        );

    }


    if(params?.yil){

        query.set(
            "yil",
            String(params.yil)
        );

    }


    return api<any[]>(
        `/api/v1/muhasebe/kayitlar?${query.toString()}`
    );

}




export async function saveMuhasebeDistribution(
    payload:any
){

    return api(
        "/api/v1/muhasebe/distribution",
        {
            method:"POST",
            body:JSON.stringify(payload)
        }
    );

}




export async function getMuhasebeStats(
    params?:{
        ay?:number;
        yil?:number;
    }
){

    const query =
        new URLSearchParams();


    if(params?.ay){

        query.set(
            "ay",
            String(params.ay)
        );

    }


    if(params?.yil){

        query.set(
            "yil",
            String(params.yil)
        );

    }


    return api<any>(
        `/api/v1/muhasebe/stats?${query.toString()}`
    );

}



export async function getMuhasebeDashboard(
    params?:{
        ay?:number;
        yil?:number;
    }
){

    const query =
        new URLSearchParams();


    if(params?.ay){

        query.set(
            "ay",
            String(params.ay)
        );

    }


    if(params?.yil){

        query.set(
            "yil",
            String(params.yil)
        );

    }


    return api<any>(
        `/api/v1/muhasebe/dashboard?${query.toString()}`
    );

}

export async function deleteMuhasebePeriod(ay:number, yil:number){
    return api<{deletedRecords:number}>(
        `/api/v1/muhasebe/period?ay=${ay}&yil=${yil}`,
        { method:"DELETE" }
    );
}





