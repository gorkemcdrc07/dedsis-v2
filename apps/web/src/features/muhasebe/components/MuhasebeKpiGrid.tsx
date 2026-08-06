type Props = {

    stats:any;

};



function Card({

    title,

    value,

    subtitle,

    icon,

    color

}:{
    title:string;
    value:string;
    subtitle:string;
    icon:string;
    color:string;
}){


return (

<div
className="
rounded-3xl
border
bg-white
p-6
shadow-sm
transition
hover:-translate-y-1
hover:shadow-lg
"
>


<div
className="
flex
items-center
justify-between
"
>

<div
className={`
flex
h-12
w-12
items-center
justify-center
rounded-2xl
text-xl
${color}
`}
>

{icon}

</div>


</div>



<p
className="
mt-5
text-sm
font-medium
text-slate-500
"
>

{title}

</p>



<h2
className="
mt-2
text-3xl
font-bold
text-slate-900
"
>

{value}

</h2>



<p
className="
mt-2
text-xs
text-slate-400
"
>

{subtitle}

</p>


</div>

);

}




export function MuhasebeKpiGrid({
    stats
}:Props){



const money =
(value:number)=>
value.toLocaleString(
"tr-TR",
{
style:"currency",
currency:"TRY"
}
);



return (

<div
className="
grid
grid-cols-1
gap-5
md:grid-cols-2
xl:grid-cols-4
"
>


<Card

title="Toplam Kayıt"

value={
(stats?.totalCount ?? 0)
.toLocaleString("tr-TR")
}

subtitle="Muhasebe hareketi"

icon="📄"

color="bg-blue-50 text-blue-600"

/>



<Card

title="Toplam Borç"

value={
money(stats?.totalBorc ?? 0)
}

subtitle="Borç toplamı"

icon="📈"

color="bg-emerald-50 text-emerald-600"

/>



<Card

title="Toplam Alacak"

value={
money(stats?.totalAlacak ?? 0)
}

subtitle="Alacak toplamı"

icon="📉"

color="bg-rose-50 text-rose-600"

/>



<Card

title="Net Bakiye"

value={
money(
(stats?.totalBorc ?? 0) -
(stats?.totalAlacak ?? 0)
)
}

subtitle="Finans durumu"

icon="⚖️"

color="bg-violet-50 text-violet-600"

/>



</div>

);

}
