type Props = {

    count:number;

    onAssign:()=>void;

    onEqualAssign:()=>void;

};


export function MuhasebeSelectionBar({

    count,

    onAssign,

    onEqualAssign

}:Props){


if(count===0)
    return null;



return (

<div
className="
flex
items-center
justify-between
rounded-2xl
border
bg-blue-50
px-5
py-4
"
>


<div>

<p className="
font-semibold
text-blue-900
">

{count} kayıt seçildi

</p>


<p className="
text-sm
text-blue-700
">

Seçilen muhasebe kayıtlarını projeye dağıtabilirsiniz.

</p>


</div>

<button

onClick={onEqualAssign}

className="
rounded-xl
bg-emerald-600
px-5
py-2.5
text-sm
font-semibold
text-white
hover:bg-emerald-700
"

>
Seçilenleri Eşit Dağıt
</button>



<button

onClick={onAssign}

className="
rounded-xl
bg-blue-600
px-5
py-2.5
text-sm
font-semibold
text-white
hover:bg-blue-700
"

>

Proje Ata

</button>


</div>

);

}
