type Props = {
    stats:any;
};


function Card({
    title,
    value,
    icon,
    color
}:{
    title:string;
    value:string;
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
text-slate-500
"
>
{title}
</p>


<p
className="
mt-2
text-3xl
font-bold
text-slate-900
"
>
{value}
</p>


</div>

);

}



const money =
(value:number)=>
value.toLocaleString(
"tr-TR",
{
style:"currency",
currency:"TRY"
}
);



export function MuhasebeStats({
    stats
}:Props){


const totalCount =
    stats?.totalCount ?? 0;


const distributedCount =
    stats?.distributedCount ?? 0;


const waitingCount =
    stats?.waitingCount ?? 0;


const totalBorc =
    stats?.totalBorc ?? 0;


const totalAlacak =
    stats?.totalAlacak ?? 0;


const balance =
    stats?.balance ?? 0;


const projects =
    stats?.projects ?? [];



return (

<div
className="
space-y-6
"
>


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
totalCount.toLocaleString("tr-TR")
}

icon="📄"

color="bg-blue-50 text-blue-600"

/>


<Card

title="Dağıtılan"

value={
distributedCount.toLocaleString("tr-TR")
}

icon="✅"

color="bg-emerald-50 text-emerald-600"

/>


<Card

title="Bekleyen"

value={
waitingCount.toLocaleString("tr-TR")
}

icon="⏳"

color="bg-orange-50 text-orange-600"

/>


<Card

title="Toplam Tutar"

value={
money(totalBorc-totalAlacak)
}

icon="₺"

color="bg-violet-50 text-violet-600"

/>


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


<div
className="
mb-5
"
>

<h3
className="
text-xl
font-bold
text-slate-900
"
>
Proje Dağılımları
</h3>


<p
className="
text-sm
text-slate-500
"
>
Muhasebe kayıtlarının projelere göre paylaşımı
</p>


</div>



<div
className="
space-y-3
"
>


{
projects.map(
(project:any)=>(


<div
key={project.projectId}
className="
flex
items-center
justify-between
rounded-2xl
bg-slate-50
px-5
py-4
"
>

<div>

<p
className="
font-semibold
text-slate-800
"
>
{project.projectName}
</p>


<p
className="
text-sm
text-slate-500
"
>
{project.count} kayıt
</p>


</div>


<p
className="
font-bold
text-slate-900
"
>
{money(project.amount)}
</p>


</div>


))

}



{
projects.length===0 && (

<p
className="
text-sm
text-slate-400
"
>
Henüz dağıtım bulunmuyor.
</p>

)

}


</div>


</div>


</div>

);

}
