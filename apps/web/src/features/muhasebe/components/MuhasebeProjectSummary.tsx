type Props = {

    projects:any[];

};



export function MuhasebeProjectSummary({

    projects

}:Props){



const total =
projects.reduce(
    (sum,item)=>
        sum + Number(item.amount || 0),
    0
);



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

Proje Dağılımı

</h3>



<p
className="
text-sm
text-slate-500
"
>

Muhasebe tutarlarının proje bazlı dağılımı

</p>




<div
className="
mt-6
space-y-4
"
>


{
projects.map(
(project)=>(


<div
key={project.projectId}
>


<div
className="
mb-2
flex
justify-between
text-sm
"
>

<span
className="
font-medium
"
>

{project.projectName}

</span>


<span
className="
text-slate-500
"
>

{money(project.amount)}

</span>


</div>



<div
className="
h-3
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
width:
`${total > 0 ? (project.amount / total) * 100 : 0}%`
}}

/>


</div>



<p
className="
mt-1
text-xs
text-slate-400
"
>

{project.count} kayıt

</p>


</div>


)
)

}



</div>


</div>

);

}
