import {
    useEffect,
    useState
} from "react";


import type {
    IKRow
} from "../features/insan-kaynaklari/types";


import {
    getIKKayitlari,
    createIKAutoDistribution
} from "../features/insan-kaynaklari/api/insanKaynaklari.api";


import {
    IKHeader
} from "../features/insan-kaynaklari/components/IKHeader";


import {
    IKStats
} from "../features/insan-kaynaklari/components/IKStats";


import {
    IKUpload
} from "../features/insan-kaynaklari/components/IKUpload";


import {
    IKTable
} from "../features/insan-kaynaklari/components/IKTable";


import {
    getEmployeeProjects
} from "../features/employee-projects/employee-projects.api";



export default function InsanKaynaklariPage(){


const [rows,setRows] =
    useState<IKRow[]>([]);



const [uploadOpen,setUploadOpen] =
    useState(false);



const [selectedIds,setSelectedIds] =
    useState<string[]>([]);


const [projectNames,setProjectNames] =
    useState<Record<number,string>>({});




async function load(){

    const [
        data,
        employeeProjectsData
    ] =
        await Promise.all([
            getIKKayitlari(),
            getEmployeeProjects()
        ]);


    const names =
        Object.fromEntries(
            employeeProjectsData.projects.map(
                project=>[
                    project.id,
                    project.display_name
                    ||
                    project.name
                    ||
                    project.code
                ]
            )
        );


    setProjectNames(names);


    setRows(
        data.map((x:any)=>({

            id: String(x.id),

            kullaniciId:
                x.kullanici_id ?? null,

            projeId:
                x.proje_id ?? null,

            personelAdi:
                x.personel_adi,

            sicilNo:
                x.sicil_no,

            departman:
                x.departman,

            donemAy:
                x.donem_ay,

            donemYil:
                x.donem_yil,

            brutUcret:
                x.brut_ucret,

            isverenMaliyeti:
                x.isveren_maliyeti,

            dagitimDurumu:
                x.dagitimDurumu ?? "bekliyor",

            dagitimlar:
                x.dagitimlar ?? [],

            selected:false

        }))
    );

}




useEffect(()=>{

    load();

},[]);





function toggleSelect(
    id:string
){

    setSelectedIds(
        prev=>
            prev.includes(id)
            ?
            prev.filter(
                x=>x!==id
            )
            :
            [
                ...prev,
                id
            ]
    );

}




async function autoDistribute(){

    if(selectedIds.length === 0){
        return;
    }


    await createIKAutoDistribution({
        recordIds:selectedIds
    });


    setSelectedIds([]);


    await load();

}


return (

<div className="
space-y-6
">


<IKHeader

onUpload={()=>
    setUploadOpen(true)
}

/>



{
uploadOpen &&
<div className="
rounded-3xl
border
bg-white
p-5
">

<IKUpload

onComplete={()=>{

    setUploadOpen(false);

    load();

}}

/>

</div>
}



<IKStats

rows={rows}

/>






<IKTable

rows={rows}

selectedIds={selectedIds}

onSelect={toggleSelect}

projectNames={projectNames}

onSaved={load}

/>



</div>

);

}















