type Props = {

    pending:number;

    distributed:number;

    total:number;

};



export function MuhasebeDistributionSummary({

    pending,

    distributed,

    total

}:Props){



const percent =
total > 0
?
Math.round(
    (distributed / total) * 100
)
:
0;



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
"
>

<div>

<h3
className="
text-lg
font-bold
text-slate-900
"
>

Dağıtım Durumu

</h3>


<p
className="
text-sm
text-slate-500
"
>

Muhasebe kayıt dağılımı

</p>

</div>


<div
className="
text-2xl
font-bold
text-blue-600
"
>

%{percent}

</div>


</div>




<div
className="
mt-6
h-4
overflow-hidden
rounded-full
bg-slate-100
"
>


<div

className="
h-full
rounded-full
bg-blue-600
"

style={{
    width:`${percent}%`
}}

/>


</div>





<div
className="
mt-6
grid
grid-cols-3
gap-4
"
>


<div
className="
rounded-2xl
bg-slate-50
p-4
"
>

<p
className="
text-xs
text-slate-500
"
>

Toplam

</p>

<p
className="
mt-1
text-xl
font-bold
"
>

{total}

</p>

</div>



<div
className="
rounded-2xl
bg-emerald-50
p-4
"
>

<p
className="
text-xs
text-slate-500
"
>

Dağıtılan

</p>

<p
className="
mt-1
text-xl
font-bold
text-emerald-600
"
>

{distributed}

</p>

</div>




<div
className="
rounded-2xl
bg-amber-50
p-4
"
>

<p
className="
text-xs
text-slate-500
"
>

Bekleyen

</p>

<p
className="
mt-1
text-xl
font-bold
text-amber-600
"
>

{pending}

</p>

</div>



</div>


</div>

);

}
