import * as XLSX from "xlsx";

import type {
    MuhasebeRow
} from "../types";


const HEADER_MAP:any = {

    "tarih":"tarih",
    "sıra":"sira",
    "y.no":"yevmiyeNo",
    "fiş tipi":"fisTipi",

    "sorumluluk merkezi kodu":
        "sorumlulukMerkeziKodu",

    "sorumluluk merkezi adı":
        "sorumlulukMerkeziAdi",

    "açıklama":
        "aciklama",

    "hesap kodu":
        "hesapKodu",

    "hesap adı":
        "hesapAdi",

    "borç":
        "borc",

    "alacak":
        "alacak",

    "borç bakiye":
        "borcBakiye",

    "alacak bakiye":
        "alacakBakiye",

};


function normalizeText(
    value:any
){

    return String(value ?? "")
        .replace(/\u00A0/g," ")
        .replace(/\s+/g," ")
        .trim();

}



function normalizeHeader(
    value:any
){

    return normalizeText(value)
        .toLocaleLowerCase("tr-TR");

}



function toNumberTR(
    value:any
){

    if(value===null || value==="")
        return 0;


    if(typeof value==="number")
        return value;


    let text =
        String(value)
        .replace(/\./g,"")
        .replace(",",".")
        .replace(/[^\d.-]/g,"");


    const number =
        Number(text);


    return Number.isNaN(number)
        ? 0
        : number;

}



function excelDateToJSDate(
    value:any
){

    if(!value)
        return null;


    if(value instanceof Date)
        return value;


    if(typeof value==="number"){

        const parsed =
            XLSX.SSF.parse_date_code(value);


        if(!parsed)
            return null;


        return new Date(
            parsed.y,
            parsed.m-1,
            parsed.d
        );

    }


    return new Date(value);

}



function mapRow(
    raw:any,
    index:number
):MuhasebeRow{


    const normalized:any={};


    Object.entries(raw)
    .forEach(
        ([key,value])=>{

            normalized[
                normalizeHeader(key)
            ] = value;

        }
    );


    const row:any={};


    Object.entries(
        HEADER_MAP as Record<string,string>
    )
    .forEach(
        ([excel,field])=>{

            row[field]=
                normalized[excel] ?? "";

        }
    );


    return {

        id:
            `${index}-${Date.now()}`,

        ...row,

        tarihObj:
            excelDateToJSDate(
                row.tarih
            ),


        borc:
            toNumberTR(row.borc),

        alacak:
            toNumberTR(row.alacak),

        borcBakiye:
            toNumberTR(row.borcBakiye),

        alacakBakiye:
            toNumberTR(row.alacakBakiye),


        selected:false,

        kullaniciId:null,

        projeId:null,

        atamaTipi:"user",

        aktarimTipi:"full",

    };

}



export async function parseMuhasebeExcel(
    file:File
){

    const buffer =
        await file.arrayBuffer();


    const workbook =
        XLSX.read(
            buffer,
            {
                type:"array"
            }
        );


    const sheetName =
        workbook.SheetNames[0];


    const sheet =
        workbook.Sheets[sheetName];


    const rows =
        XLSX.utils
        .sheet_to_json(
            sheet,
            {
                defval:""
            }
        )
        .map(
            (row,index)=>
                mapRow(
                    row,
                    index
                )
        );


    return {

        sheetName,

        rows

    };

}



export function formatMoney(
    value:number
){

    return new Intl.NumberFormat(
        "tr-TR",
        {
            style:"currency",
            currency:"TRY"
        }
    )
    .format(value || 0);

}


