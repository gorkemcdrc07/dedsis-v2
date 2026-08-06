import {
    useEffect,
    useState,
    useRef
} from "react";


import * as XLSX from "xlsx";


import {
    createIKImport
} from "../api/insanKaynaklari.api";



type Props = {

    onComplete:()=>void;

};



export function IKUpload({
    onComplete
}:Props){


const inputRef =
    useRef<HTMLInputElement>(null);


const [loading,setLoading] =
    useState(false);


const [message,setMessage] =
    useState("");


useEffect(()=>{

    inputRef.current?.click();

},[]);



async function handleFile(
    e:React.ChangeEvent<HTMLInputElement>
){


const file =
    e.target.files?.[0];


if(!file)
    return;



try{


setLoading(true);

setMessage("");



const buffer =
    await file.arrayBuffer();



const workbook =
    XLSX.read(
        buffer
    );



const sheet =
    workbook.Sheets[
        workbook.SheetNames[0]
    ];



const rows =
    XLSX.utils.sheet_to_json<any>(
        sheet
    );



const data =
    rows
    .map(row=>({

        personelAdi:
            row["Personel"]
            ??
            row["Personel Adı"]
            ??
            row["Adı Soyadı"]
            ??
            row["Ad Soyad"]
            ??
            row["Çalışan"]
            ??
            "",


        sicilNo:
            row["Sicil No"]
            ??
            row["Sicil"]
            ??
            row["Personel Kodu"]
            ??
            null,


        departman:
            row["Departman"]
            ??
            row["Bölüm"]
            ??
            null,


        brutUcret:
            Number(
                row["Brüt Ücret"]
                ??
                row["Brut Ücret"]
                ??
                row["Maaş"]
                ??
                0
            ),


        isverenMaliyeti:
            Number(
                row["İşveren Maliyeti"]
                ??
                row["İşveren maliyeti"]
                ??
                row["Isveren Maliyeti"]
                ??
                row["Toplam Maliyet"]
                ??
                0
            )

    }))
    .filter(
        x=>x.personelAdi
    );





const result =
    await createIKImport({

    dosyaAdi:file.name,

    donemAy:
        new Date().getMonth()+1,

    donemYil:
        new Date().getFullYear(),

    rows:data

});



setMessage(
    `${data.length} personel başarıyla aktarıldı`
);


setTimeout(()=>{

    onComplete();

},800);



}
catch(error){

    console.error(
        error
    );


    setMessage(
        "Excel aktarımı sırasında hata oluştu"
    );


}
finally{

    setLoading(false);

}



}




return (

<div className="
rounded-3xl
border
bg-white
p-5
shadow-sm
">


<input

ref={inputRef}

type="file"

accept=".xlsx,.xls"

onChange={handleFile}

className="hidden"

/>


<button
type="button"
onClick={()=>
    inputRef.current?.click()
}
disabled={loading}
className="
rounded-xl
border
border-blue-200
bg-blue-50
px-5
py-3
text-sm
font-semibold
text-blue-700
hover:bg-blue-100
disabled:opacity-50
"
>

Dosya Seç

</button>



{
loading &&
<p className="
mt-3
text-sm
text-slate-500
">
Yükleniyor...
</p>
}



{
message &&
<p className="
mt-3
text-sm
font-semibold
text-blue-600
">
{message}
</p>
}



</div>

);

}






