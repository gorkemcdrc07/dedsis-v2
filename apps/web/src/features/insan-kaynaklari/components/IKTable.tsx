import {
    useMemo,
    useState
} from "react";


import type {
    IKRow
} from "../types";


import {
    saveIKDistribution,
    deleteIKDistribution,
    getIKDefaultDistribution,
    createIKAutoDistribution
} from "../api/insanKaynaklari.api";


type Props = {

    rows:IKRow[];

    selectedIds:string[];

    onSelect:(id:string)=>void;

    projectNames:Record<number,string>;

    onSaved:()=>Promise<void>;

    onProcess?:(state:{open:boolean;title:string;message:string;percent:number})=>void;

    canAssign?:boolean;

};


type EditDistributionRow = {

    projectId:number;

    rate:number;

};


export function IKTable({
    rows,
    selectedIds,
    onSelect,
    projectNames,
    onSaved,
    onProcess,
    canAssign=true
}:Props){


const [detailRow,setDetailRow] =
    useState<IKRow|null>(null);


const [isEditing,setIsEditing] =
    useState(false);


const [editRows,setEditRows] =
    useState<EditDistributionRow[]>([]);


const [saving,setSaving] =
    useState(false);


const [loadingDefault,setLoadingDefault] =
    useState(false);


const [error,setError] =
    useState<string|null>(null);



const projectOptions =
    useMemo(
        ()=>Object.entries(projectNames)
            .map(([id,name])=>({

                id:Number(id),

                name

            }))
            .sort(
                (a,b)=>
                    a.name.localeCompare(
                        b.name,
                        "tr"
                    )
            ),
        [projectNames]
    );



async function autoDistribute(){


    console.log("AUTO DAGITIM", selectedIds);

    if(selectedIds.length===0){

        setError(
            "Önce personel seçmelisiniz."
        );

        return;

    }


    try{

        setSaving(true);

        setError(null);

        onProcess?.({open:true,title:"Personeller dağıtılıyor",message:`${selectedIds.length} personelin proje yetkileri hesaplanıyor.`,percent:45});


        const result =
            await createIKAutoDistribution({

                recordIds:
                    selectedIds

            });


        if(result.warning){

            onProcess?.({open:false,title:"",message:"",percent:0});

            setError(
                result.message +
                "\n\n" +
                (result.invalidEmployees ?? [])
                .map(
                    (x:{
                        recordId:number;
                        total:number;
                    }) =>
                    `Kayıt ${x.recordId}: %${x.total}`
                )
                .join("\n")
            );

            return;

        }


        await onSaved();

        onProcess?.({open:true,title:"Dağıtım tamamlandı",message:`${selectedIds.length} personelin proje maliyetleri başarıyla dağıtıldı.`,percent:100});

    }
    catch(error){

        onProcess?.({open:false,title:"",message:"",percent:0});

        setError(
            error instanceof Error
            ? error.message
            : "Otomatik dağıtım yapılamadı."
        );

    }
    finally{

        setSaving(false);

    }

}



const totalRate =
    editRows.reduce(
        (total,item)=>
            total + Number(item.rate || 0),
        0
    );



const totalAmount =
    detailRow
        ? editRows.reduce(
            (total,item)=>
                total
                +
                (
                    Number(detailRow.isverenMaliyeti)
                    *
                    Number(item.rate || 0)
                    /
                    100
                ),
            0
        )
        : 0;



function openDetail(row:IKRow){

    setDetailRow(row);

    setIsEditing(false);

    setEditRows([]);

    setError(null);

}



function closeModal(){

    if(saving){
        return;
    }

    setDetailRow(null);

    setIsEditing(false);

    setEditRows([]);

    setError(null);

}



async function startEditing(){

    if(!detailRow){
        return;
    }


    setError(null);


    if(
        detailRow.dagitimlar.length > 0
    ){

        setEditRows(
            detailRow.dagitimlar.map(
                item=>({

                    projectId:
                        Number(item.project_id),

                    rate:
                        Number(item.oran)

                })
            )
        );

        setIsEditing(true);

        return;

    }


    try{

        setLoadingDefault(true);


        const response =
            await getIKDefaultDistribution(
                detailRow.id
            );


        setEditRows(
            response.dagitimlar.map(
                (
                    item:{
                        projectId:number;
                        rate:number;
                    }
                )=>({

                    projectId:
                        Number(item.projectId),

                    rate:
                        Number(item.rate)

                })
            )
        );


        setIsEditing(true);

    }
    catch(loadError){

        setError(
            loadError instanceof Error
                ? loadError.message
                : "Yetkilendirme dağılımı alınamadı."
        );

    }
    finally{

        setLoadingDefault(false);

    }

}



function cancelEditing(){

    setIsEditing(false);

    setEditRows([]);

    setError(null);

}



function addDistributionRow(){

    const usedProjectIds =
        new Set(
            editRows.map(
                item=>item.projectId
            )
        );


    const firstAvailableProject =
        projectOptions.find(
            project=>
                !usedProjectIds.has(
                    project.id
                )
        );


    if(!firstAvailableProject){

        setError(
            "Eklenebilecek başka proje bulunmuyor."
        );

        return;

    }


    setEditRows(current=>[

        ...current,

        {
            projectId:
                firstAvailableProject.id,

            rate:0
        }

    ]);

    setError(null);

}



function removeDistributionRow(
    index:number
){

    setEditRows(
        current=>
            current.filter(
                (_,rowIndex)=>
                    rowIndex !== index
            )
    );

    setError(null);

}



function changeProject(
    index:number,
    projectId:number
){

    setEditRows(
        current=>
            current.map(
                (item,rowIndex)=>
                    rowIndex === index
                        ? {
                            ...item,
                            projectId
                        }
                        : item
            )
    );

    setError(null);

}



function changeRate(
    index:number,
    rate:number
){

    const safeRate =
        Number.isFinite(rate)
            ? Math.min(
                100,
                Math.max(
                    0,
                    rate
                )
            )
            : 0;


    setEditRows(
        current=>
            current.map(
                (item,rowIndex)=>
                    rowIndex === index
                        ? {
                            ...item,
                            rate:safeRate
                        }
                        : item
            )
    );

    setError(null);

}



async function removeDistribution(){

    if(
        !detailRow
        ||
        detailRow.dagitimlar.length === 0
    ){
        return;
    }


    const approved =
        window.confirm(
            `${detailRow.personelAdi} için mevcut proje dağıtımını silmek istediğinize emin misiniz?`
        );


    if(!approved){
        return;
    }


    try{

        setSaving(true);

        setError(null);


        await deleteIKDistribution(
            detailRow.id
        );


        await onSaved();


        setDetailRow(null);

        setIsEditing(false);

        setEditRows([]);

    }
    catch(deleteError){

        setError(
            deleteError instanceof Error
                ? deleteError.message
                : "Dağıtım silinemedi."
        );

    }
    finally{

        setSaving(false);

    }

}


async function saveDistribution(){

    if(!detailRow){
        return;
    }


    if(editRows.length === 0){

        setError(
            "En az bir proje dağıtımı eklemelisiniz."
        );

        return;

    }


    const projectIds =
        editRows.map(
            item=>item.projectId
        );


    if(
        new Set(projectIds).size
        !==
        projectIds.length
    ){

        setError(
            "Aynı proje birden fazla kez seçilemez."
        );

        return;

    }


    if(
        editRows.some(
            item=>
                !item.projectId
                ||
                Number(item.rate) <= 0
        )
    ){

        setError(
            "Her proje için sıfırdan büyük bir oran girilmelidir."
        );

        return;

    }


    if(
        Math.abs(totalRate - 100)
        > 0.001
    ){

        setError(
            "Dağıtım oranlarının toplamı %100 olmalıdır."
        );

        return;

    }


    try{

        setSaving(true);

        setError(null);


        await saveIKDistribution({

            records:[
                {
                    id:
                        Number(detailRow.id),

                    isverenMaliyeti:
                        Number(
                            detailRow.isverenMaliyeti
                        )
                }
            ],

            distribution:
                editRows.map(
                    item=>({

                        projectId:
                            Number(item.projectId),

                        rate:
                            Number(item.rate)

                    })
                )

        });


        await onSaved();


        setDetailRow(null);

        setIsEditing(false);

        setEditRows([]);

    }
    catch(saveError){

        setError(
            saveError instanceof Error
                ? saveError.message
                : "Dağıtım kaydedilemedi."
        );

    }
    finally{

        setSaving(false);

    }

}



return (

<>

<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">


<div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">

<div className="
text-sm
text-slate-500
">
{selectedIds.length} personel seçildi
</div>


{canAssign ? <button
type="button"
onClick={autoDistribute}
disabled={
    saving ||
    selectedIds.length===0
}
className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
>
{saving ? "Dağıtım yapılıyor…" : "Seçilenleri otomatik dağıt"}
</button> : null}


</div>


<div className="max-h-[720px] overflow-auto">
<table className="w-full min-w-[1100px] text-sm">

<thead className="sticky top-0 z-10 bg-slate-50/95 text-slate-500 backdrop-blur">

<tr>

<th className="p-4 text-left">
</th>

<th className="p-4 text-left">
Personel
</th>

<th className="p-4 text-left">
Departman
</th>

<th className="p-4 text-left">
Dönem
</th>

<th className="p-4 text-left">
İşveren Maliyeti
</th>

<th className="p-4 text-left">
Yetkilendirme
</th>

<th className="p-4 text-left">
Durum
</th>

<th className="p-4 text-right">
İşlem
</th>

</tr>

</thead>


<tbody>

{
rows.map(row=>(

<tr
key={row.id}
className="border-t border-slate-100 [content-visibility:auto] transition hover:bg-violet-50/40"
>

<td className="p-4">

<input
type="checkbox"
disabled={
    !canAssign || row.dagitimDurumu === "dagitildi"
}
checked={
    selectedIds.includes(
        row.id
    )
}
onChange={()=>
    onSelect(row.id)
}
/>

</td>


<td className="p-4 font-semibold">

{row.personelAdi}

<div className="
mt-1
text-xs
font-normal
text-slate-400
">

Sicil: {row.sicilNo ?? "-"}

</div>

</td>


<td className="p-4">

{row.departman ?? "-"}

</td>


<td className="p-4">

{
String(row.donemAy)
.padStart(
    2,
    "0"
)
}
/
{row.donemYil}

</td>


<td className="p-4 font-medium">

{
Number(
    row.isverenMaliyeti
)
.toLocaleString(
    "tr-TR"
)
}
 ₺

</td>


<td className="p-4">

{
row.kullaniciId
?
<div>

<div className="
text-emerald-600
font-semibold
">
🟢 Bağlı
</div>


{
row.dagitimlar.length > 0 &&
<div className="
mt-2
space-y-1
text-xs
text-slate-500
">

{
row.dagitimlar.map(item=>(

<div
key={item.id}
className="
mb-2
"
>

<div className="
font-medium
text-slate-700
">

{
projectNames[item.project_id]
||
`Proje ${item.project_id}`
}

</div>


<div className="
text-xs
text-slate-500
">

{item.oran}%

-
{
Number(item.tutar)
.toLocaleString(
    "tr-TR"
)
}

 ₺

</div>


</div>

))
}

</div>
}

</div>

:
<span className="
text-slate-400
">
⚪ Yok
</span>
}

</td>


<td className="p-4">

<span className={`
inline-flex
rounded-full
px-3
py-1
text-xs
font-semibold
${
row.dagitimDurumu !== "dagitildi"
    ? "bg-amber-100 text-amber-700"
    :
    row.dagitimGuncel
    ? "bg-emerald-100 text-emerald-700"
    : "bg-orange-100 text-orange-700"
}
`}>

{
row.dagitimDurumu !== "dagitildi"
    ? "Bekliyor"
    :
    row.dagitimGuncel
    ? "🟢 Dağıtım güncel"
    : "🟡 Yetkilendirme değişti"
}

</span>

</td>


<td className="p-4 text-right">

<button
type="button"
onClick={()=>
    openDetail(row)
}
className="
rounded-xl
border
border-slate-200
bg-white
px-4
py-2
text-sm
font-semibold
text-slate-700
hover:bg-slate-50
"
>

Detay

</button>

</td>

</tr>

))
}

</tbody>

</table>
</div>

</div>



{
detailRow &&
<div className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-slate-950/40
p-4
">

<div className="
max-h-[90vh]
w-full
max-w-4xl
overflow-y-auto
rounded-3xl
bg-white
shadow-2xl
">

<div className="
flex
items-center
justify-between
border-b
p-6
">

<div>

<h2 className="
text-xl
font-bold
text-slate-900
">

{detailRow.personelAdi}

</h2>

<p className="
mt-1
text-sm
text-slate-500
">

Proje maliyet dağıtımı

</p>

</div>


<div className="
flex
items-center
gap-2
">

{
!isEditing &&
detailRow.dagitimlar.length > 0 &&
<button
type="button"
onClick={removeDistribution}
disabled={saving}
className="
rounded-xl
border
border-red-200
bg-white
px-4
py-2
text-sm
font-semibold
text-red-600
hover:bg-red-50
disabled:opacity-50
"
>

{
saving
    ? "Siliniyor..."
    : "Dağıtımı Sil"
}

</button>
}


{
!isEditing &&
<button
type="button"
onClick={startEditing}
disabled={
    saving
    ||
    loadingDefault
}
className="
rounded-xl
bg-blue-600
px-4
py-2
text-sm
font-semibold
text-white
hover:bg-blue-700
disabled:opacity-50
"
>

{
loadingDefault
    ? "Dağılım Alınıyor..."
    : detailRow.dagitimlar.length > 0
        ? "Dağıtımı Düzenle"
        : "Yetkilendirmeden Oluştur"
}

</button>
}


<button
type="button"
onClick={closeModal}
disabled={saving}
className="
rounded-xl
border
px-4
py-2
text-sm
font-semibold
text-slate-600
hover:bg-slate-50
disabled:opacity-50
"
>

Kapat

</button>

</div>

</div>



<div className="p-6">

{
error &&
<div className="
mb-5
rounded-2xl
border
border-red-200
bg-red-50
p-4
text-sm
font-medium
text-red-700
">

{error}

</div>
}


{
isEditing
? (

<>

<div className="space-y-3">

{
editRows.map(
    (item,index)=>(

<div
key={`${item.projectId}-${index}`}
className="
grid
grid-cols-[1fr_140px_150px_48px]
items-center
gap-3
rounded-2xl
border
p-4
"
>

<select
value={item.projectId}
onChange={event=>
    changeProject(
        index,
        Number(
            event.target.value
        )
    )
}
className="
h-11
rounded-xl
border
border-slate-200
bg-white
px-3
outline-none
focus:border-blue-500
"
>

{
projectOptions.map(
    project=>(

<option
key={project.id}
value={project.id}
>

{project.name}

</option>

    )
)
}

</select>


<div className="relative">

<input
type="number"
min="0"
max="100"
step="0.01"
value={item.rate}
onChange={event=>
    changeRate(
        index,
        Number(
            event.target.value
        )
    )
}
className="
h-11
w-full
rounded-xl
border
border-slate-200
px-3
pr-8
text-right
outline-none
focus:border-blue-500
"
/>

<span className="
absolute
right-3
top-1/2
-translate-y-1/2
text-slate-400
">

%

</span>

</div>


<div className="
text-right
font-semibold
text-slate-700
">

{
(
    Number(
        detailRow.isverenMaliyeti
    )
    *
    Number(item.rate || 0)
    /
    100
)
.toLocaleString(
    "tr-TR"
)
}
 ₺

</div>


<button
type="button"
onClick={()=>
    removeDistributionRow(
        index
    )
}
className="
h-11
rounded-xl
border
border-red-200
text-lg
font-bold
text-red-600
hover:bg-red-50
"
title="Satırı sil"
>

×

</button>

</div>

    )
)
}

</div>


<button
type="button"
onClick={addDistributionRow}
className="
mt-4
rounded-xl
border
border-dashed
border-blue-300
px-4
py-2
text-sm
font-semibold
text-blue-600
hover:bg-blue-50
"
>

+ Proje Ekle

</button>


<div className="
mt-6
flex
flex-wrap
items-center
justify-between
gap-4
rounded-2xl
bg-slate-50
p-4
">

<div className="
flex
gap-8
text-sm
">

<div>

<span className="text-slate-500">
Toplam oran:
</span>

<strong className={`
ml-2
${
Math.abs(totalRate - 100) < 0.001
    ? "text-emerald-600"
    : "text-red-600"
}
`}>

%{totalRate}

</strong>

</div>


<div>

<span className="text-slate-500">
Toplam tutar:
</span>

<strong className="ml-2">

{
totalAmount.toLocaleString(
    "tr-TR"
)
}
 ₺

</strong>

</div>

</div>


<div className="
flex
gap-3
">

<button
type="button"
onClick={cancelEditing}
disabled={saving}
className="
rounded-xl
border
px-4
py-2
text-sm
font-semibold
text-slate-600
disabled:opacity-50
"
>

Vazgeç

</button>


<button
type="button"
onClick={saveDistribution}
disabled={
    saving
    ||
    Math.abs(totalRate - 100) > 0.001
}
className="
rounded-xl
bg-emerald-600
px-5
py-2
text-sm
font-semibold
text-white
hover:bg-emerald-700
disabled:cursor-not-allowed
disabled:opacity-50
"
>

{
saving
    ? "Kaydediliyor..."
    : "Kaydet"
}

</button>

</div>

</div>

</>

)
: (

<>

<div className="
overflow-hidden
rounded-2xl
border
">

<table className="
w-full
text-sm
">

<thead className="
bg-slate-50
text-slate-500
">

<tr>

<th className="p-4 text-left">
Proje
</th>

<th className="p-4 text-right">
Oran
</th>

<th className="p-4 text-right">
Tutar
</th>

</tr>

</thead>


<tbody>

{
detailRow.dagitimlar.length > 0
? detailRow.dagitimlar.map(
    dagitim=>(

<tr
key={dagitim.id}
className="border-t"
>

<td className="p-4 font-medium">

{
projectNames[
    Number(
        dagitim.project_id
    )
]
??
`Proje #${dagitim.project_id}`
}

</td>

<td className="p-4 text-right">

%{dagitim.oran}

</td>

<td className="
p-4
text-right
font-semibold
">

{
Number(
    dagitim.tutar
)
.toLocaleString(
    "tr-TR"
)
}
 ₺

</td>

</tr>

    )
)
: (

<tr>

<td
colSpan={3}
className="
p-8
text-center
text-slate-500
"
>

Bu personel için henüz dağıtım yapılmamış.

</td>

</tr>

)
}

</tbody>

</table>

</div>


<div className="
mt-5
flex
justify-end
gap-8
rounded-2xl
bg-slate-50
p-4
text-sm
">

<div>

<span className="text-slate-500">
Toplam oran:
</span>

<strong className="ml-2">

%
{
detailRow.dagitimlar.reduce(
    (total,item)=>
        total + Number(item.oran),
    0
)
}

</strong>

</div>


<div>

<span className="text-slate-500">
Toplam tutar:
</span>

<strong className="ml-2">

{
detailRow.dagitimlar.reduce(
    (total,item)=>
        total + Number(item.tutar),
    0
)
.toLocaleString(
    "tr-TR"
)
}
 ₺

</strong>

</div>

</div>

</>

)
}

</div>

</div>

</div>
}

</>

);

}






















