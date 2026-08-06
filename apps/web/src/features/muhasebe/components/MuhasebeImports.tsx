type Props = {
    imports:any[];
};



export function MuhasebeImports({
    imports
}:Props){


return (

<div
className="
rounded-3xl
border
bg-white
p-6
shadow-sm
"
>


<div
className="
flex
items-center
justify-between
mb-5
"
>


<div>

<h3
className="
font-bold
text-slate-900
"
>
Son Excel Yüklemeleri
</h3>


<p
className="
text-sm
text-slate-500
mt-1
"
>
Son 10 import işlemi
</p>

</div>


</div>




<div
className="
space-y-3
"
>


{
imports.length===0 && (

<p
className="
text-sm
text-slate-400
"
>
Henüz yükleme bulunmuyor.
</p>

)

}



{
imports.map(item=>(


<div
key={item.id}
className="
flex
items-center
justify-between
rounded-2xl
bg-slate-50
px-4
py-3
"
>


<div>

<p
className="
font-semibold
text-slate-800
"
>
{item.dosya_adi}
</p>


<p
className="
text-xs
text-slate-500
mt-1
"
>
{item.kayit_sayisi} kayıt
</p>


</div>


<div
className="
text-xs
text-slate-400
"
>
{
new Date(
item.created_at
)
.toLocaleDateString(
"tr-TR"
)
}
</div>


</div>


))

}


</div>


</div>

);

}
