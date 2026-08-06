import {
    api
} from "../../../lib/api";
type IKAutoDistributionResponse = {

    warning?: boolean;

    message?: string;

    invalidEmployees?: {
        recordId:number;
        kullaniciId:number;
        total:number;
    }[];

};




export async function getIKKayitlari(params?:{ay?:number;yil?:number}){

    const query = new URLSearchParams();
    if(params?.ay) query.set("ay", String(params.ay));
    if(params?.yil) query.set("yil", String(params.yil));

    return api<any[]>(
        `/api/v1/ik/kayitlar?${query.toString()}`
    );

}




export async function getIKImports(params?:{ay?:number;yil?:number}){

    const query = new URLSearchParams();
    if(params?.ay) query.set("ay", String(params.ay));
    if(params?.yil) query.set("yil", String(params.yil));

    return api<any[]>(
        `/api/v1/ik/imports?${query.toString()}`
    );

}

export async function deleteIKPeriod(ay:number, yil:number){
    return api<{deletedRecords:number}>(`/api/v1/ik/period?ay=${ay}&yil=${yil}`, { method:"DELETE" });
}




export async function createIKImport(
    payload:any
){

    return api(
        "/api/v1/ik/import",
        {
            method:"POST",
            body:JSON.stringify(payload)
        }
    );

}




export async function saveIKDistribution(
    payload:any
){

    return api(
        "/api/v1/ik/distribution",
        {
            method:"POST",
            body:JSON.stringify(payload)
        }
    );

}




export async function createIKAutoDistribution(
    payload:{
        recordIds:string[];
    }
):Promise<IKAutoDistributionResponse>{

    return api(
        "/api/v1/ik/auto-distribution",
        {
            method:"POST",
            body:JSON.stringify({
                recordIds:
                    payload.recordIds.map(
                        Number
                    )
            })
        }
    );

}

export async function deleteIKDistribution(
    recordId:string
){

    return api(
        `/api/v1/ik/kayitlar/${recordId}/dagitim`,
        {
            method:"DELETE",
            body:JSON.stringify({})
        }
    );

}



export type IKDefaultDistributionItem = {
    id:number;
    projectId:number;
    rate:number;
    amount:number;
};


export type IKDefaultDistributionResponse = {
    recordId:number;
    personelAdi:string;
    kaynak:"yetkilendirme";
    toplamOran:number;
    dagitimlar:IKDefaultDistributionItem[];
};


export async function getIKDefaultDistribution(
    recordId:string | number
){

    return api<IKDefaultDistributionResponse>(
        `/api/v1/ik/kayitlar/${recordId}/varsayilan-dagitim`
    );

}


