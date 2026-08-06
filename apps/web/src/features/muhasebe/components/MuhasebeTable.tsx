import type {
    MuhasebeRow
} from "../types";


type Props={

    rows:MuhasebeRow[];

    selectedIds:string[];

    onSelectionChange:(ids:string[])=>void;

};



function money(
    value:number
){

    return value.toLocaleString(
        "tr-TR",
        {
            style:"currency",
            currency:"TRY"
        }
    );

}



function formatDate(
    row:MuhasebeRow
){

    if(row.tarihObj){

        return row.tarihObj.toLocaleDateString(
            "tr-TR"
        );

    }


    if(row.tarih){

        return new Date(
            row.tarih
        ).toLocaleDateString(
            "tr-TR"
        );

    }


    return "-";

}



export function MuhasebeTable({

    rows,

    selectedIds,

    onSelectionChange

}:Props){



function toggleRow(id:string){

    if(selectedIds.includes(id)){

        onSelectionChange(
            selectedIds.filter(
                x=>x!==id
            )
        );

    }
    else{

        onSelectionChange([
            ...selectedIds,
            id
        ]);

    }

}



function toggleAll(){

    if(selectedIds.length===rows.length){

        onSelectionChange([]);

    }
    else{

        onSelectionChange(
            rows.map(
                x=>String(x.id)
            )
        );

    }

}




return (

<div
className="
overflow-hidden
rounded-3xl
border
bg-white
shadow-sm
"
>


<div
className="
max-h-[700px]
overflow-auto
"
>


<table
className="
min-w-[1200px]
w-full
text-sm
"
>


<thead
className="
sticky
top-0
z-10
bg-slate-50
"
>


<tr
className="
border-b
text-slate-500
"
>


<th className="p-4">

<input

type="checkbox"

checked={
rows.length>0 &&
selectedIds.length===rows.length
}

onChange={toggleAll}

/>

</th>


<th className="p-4 text-left">
Tarih
</th>


<th className="p-4 text-left">
Yevmiye
</th>


<th className="p-4 text-left">
Fiş Tipi
</th>


<th className="p-4 text-left">
Hesap Kodu
</th>


<th className="p-4 text-left">
Hesap Adı
</th>


<th className="p-4 text-left">
Açıklama
</th>


<th className="p-4 text-right">
Borç
</th>


<th className="p-4 text-right">
Alacak
</th>


</tr>


</thead>



<tbody>


{
rows.map(row=>(


<tr
key={row.id}
className="
border-b
hover:bg-blue-50/50
transition
"
>


<td className="p-4">

<input

type="checkbox"

checked={
selectedIds.includes(row.id)
}

onChange={()=>
toggleRow(row.id)
}

/>

</td>



<td className="p-4">

<span
className="
rounded-lg
bg-slate-100
px-2
py-1
text-xs
"
>

{formatDate(row)}

</span>

</td>




<td className="p-4 font-medium">

{row.yevmiyeNo || "-"}

</td>




<td className="p-4">

<span
className="
rounded-full
bg-blue-50
px-3
py-1
text-xs
text-blue-600
"
>

{row.fisTipi || "-"}

</span>

</td>




<td className="p-4">

{row.hesapKodu || "-"}

</td>




<td className="p-4 font-semibold">

{row.hesapAdi || "-"}

</td>




<td className="
p-4
max-w-[420px]
"
>

<div className="truncate">

{row.aciklama || "-"}

</div>

</td>




<td className="
p-4
text-right
font-semibold
text-emerald-600
"
>

{money(row.borc)}

</td>



<td className="
p-4
text-right
font-semibold
text-rose-600
"
>

{money(row.alacak)}

</td>



</tr>


))

}



{
rows.length===0 && (

<tr>

<td
colSpan={9}
className="
p-20
text-center
text-slate-400
"
>

Kayıt bulunamadı

</td>

</tr>

)

}


</tbody>


</table>


</div>


</div>

);

}

