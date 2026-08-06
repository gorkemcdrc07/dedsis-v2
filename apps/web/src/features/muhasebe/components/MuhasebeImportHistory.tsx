type Props = {

    imports:any[];

};



export function MuhasebeImportHistory({

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


<h3
className="
text-lg
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
"
>

Son 10 muhasebe aktarımı

</p>



<div
className="
mt-5
space-y-3
"
>


{
imports.map(
(item)=>(


<div
key={item.id}
className="
flex
items-center
justify-between
rounded-2xl
bg-slate-50
p-4
"
>


<div>

<p
className="
font-medium
text-slate-800
"
>

{item.dosya_adi}

</p>


<p
className="
text-xs
text-slate-500
"
>

Dönem:
{item.donem_ay}/
{item.donem_yil}

</p>

</div>



<div
className="
text-right
"
>


<p
className="
font-bold
text-slate-900
"
>

{item.kayit_sayisi}

</p>


<p
className="
text-xs
text-slate-400
"
>

kayıt

</p>


</div>


</div>


)
)

}


</div>


</div>

);

}
