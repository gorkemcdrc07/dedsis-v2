import type {
    MuhasebeRow
} from "../types";



type Props = {
    rows:MuhasebeRow[];
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



export function MuhasebeCharts({
    rows
}:Props){


const totalBorc =
    rows.reduce(
        (sum,row)=>sum+row.borc,
        0
    );


const totalAlacak =
    rows.reduce(
        (sum,row)=>sum+row.alacak,
        0
    );


const movementCount =
    rows.length;



const total =
    totalBorc + totalAlacak;



const borcRate =
    total
    ?
    Math.round(
        totalBorc / total * 100
    )
    :
    0;



const alacakRate =
    total
    ?
    100 - borcRate
    :
    0;




const accountMap =
rows.reduce(
    (
        acc:Record<string,number>,
        row
    )=>{


        const key =
            row.hesapAdi
            ||
            row.hesapKodu
            ||
            row.aciklama
            ||
            "Diğer";


        acc[key] =
            (acc[key] || 0)
            +
            row.borc
            +
            row.alacak;


        return acc;


    },
    {}
);



const topAccounts =
Object.entries(accountMap)
.sort(
    (a,b)=>b[1]-a[1]
)
.slice(
    0,
    5
);



const maxValue =
topAccounts[0]?.[1] || 1;



return (

<div
className="
space-y-6
"
>


<div
className="
grid
gap-4
md:grid-cols-3
"
>


<div
className="
rounded-3xl
border
bg-white
p-5
shadow-sm
"
>

<p className="text-sm text-slate-500">
Toplam Borç
</p>

<p className="
mt-2
text-2xl
font-bold
text-slate-900
">
{money(totalBorc)}
</p>

</div>




<div
className="
rounded-3xl
border
bg-white
p-5
shadow-sm
"
>

<p className="text-sm text-slate-500">
Toplam Alacak
</p>

<p className="
mt-2
text-2xl
font-bold
text-slate-900
">
{money(totalAlacak)}
</p>

</div>




<div
className="
rounded-3xl
border
bg-white
p-5
shadow-sm
"
>

<p className="text-sm text-slate-500">
Muhasebe Hareketi
</p>

<p className="
mt-2
text-2xl
font-bold
text-slate-900
">
{movementCount}
</p>

<p className="text-xs text-slate-400">
kayıt
</p>

</div>



</div>





<div
className="
grid
gap-6
xl:grid-cols-2
"
>



<div
className="
rounded-3xl
border
bg-white
p-6
shadow-sm
"
>


<h3 className="
font-bold
text-slate-900
">
Borç / Alacak Dağılımı
</h3>



<div className="mt-6 space-y-5">


<div>

<div className="
mb-2
flex
justify-between
text-sm
">

<span>
Borç
</span>

<strong>
%{borcRate}
</strong>

</div>


<div className="
h-3
rounded-full
bg-slate-100
">

<div
className="
h-3
rounded-full
bg-emerald-500
"
style={{
width:`${borcRate}%`
}}
/>

</div>


</div>




<div>

<div className="
mb-2
flex
justify-between
text-sm
">

<span>
Alacak
</span>

<strong>
%{alacakRate}
</strong>

</div>


<div className="
h-3
rounded-full
bg-slate-100
">


<div
className="
h-3
rounded-full
bg-rose-500
"
style={{
width:`${alacakRate}%`
}}
/>

</div>


</div>



</div>


</div>





<div
className="
rounded-3xl
border
bg-white
p-6
shadow-sm
"
>


<h3 className="
font-bold
text-slate-900
">
En Çok Hareket Gören Hesaplar
</h3>



<div className="
mt-6
space-y-5
"
>


{
topAccounts.map(
([name,value])=>(


<div
key={name}
>


<div className="
mb-2
flex
justify-between
text-sm
"
>

<span>
{name}
</span>


<strong>
{money(value)}
</strong>

</div>


<div
className="
h-2
rounded-full
bg-slate-100
"
>


<div
className="
h-2
rounded-full
bg-blue-600
"
style={{
width:`${Math.round(value/maxValue*100)}%`
}}
/>


</div>


</div>


)

)
}



{
topAccounts.length===0 &&
<p className="text-sm text-slate-400">
Henüz veri yok
</p>
}



</div>


</div>



</div>


</div>

);

}


