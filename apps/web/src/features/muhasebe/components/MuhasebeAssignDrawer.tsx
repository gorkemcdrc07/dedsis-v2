import {
    useState
} from "react";


import type {
    MuhasebeRow
} from "../types";


type Props = {

    open:boolean;

    onClose:()=>void;

    selectedCount:number;

    selectedRows:MuhasebeRow[];

    projects:{
        id:number;
        display_name:string;
    }[];

    onSave:(distribution:any[])=>void;

};







type Distribution = {

    projectId:number;

    projectName:string;

    rate:number;

};



export function MuhasebeAssignDrawer({

    open,

    onClose,

    selectedCount,

    selectedRows,

    projects,

    onSave

}:Props){



const [projectId,setProjectId] =
    useState("");

const [rate,setRate] =
    useState("");



const [distribution,setDistribution] =
    useState<Distribution[]>([]);



function resetForm(){

    setProjectId("");

    setRate("");

    setDistribution([]);

}




function addDistribution(){


    const project =
        projects.find(
            x=>x.id===Number(projectId)
        );


    const newRate =
        Number(rate);



    if(!project || newRate <= 0)
        return;



    const exists =
        distribution.some(
            x=>x.projectId===project.id
        );


    if(exists)
        return;



    const currentTotal =
        distribution.reduce(
            (sum,x)=>
                sum + x.rate,
            0
        );



    if(currentTotal + newRate > 100)
        return;



    setDistribution(prev=>[

        ...prev,

        {

            projectId:project.id,

            projectName:project.display_name,

            rate:newRate

        }

    ]);



    setProjectId("");

    setRate("");

}



function removeDistribution(
    index:number
){

    setDistribution(prev=>
        prev.filter(
            (_,i)=>i!==index
        )
    );

}



const totalRate =
distribution.reduce(
    (sum,x)=>
        sum+x.rate,
    0
);



const totalAmount =
selectedRows.reduce(
    (sum,row)=>
        sum + row.borc,
    0
);



const distributedAmount =
distribution.reduce(
    (sum,item)=>
        sum +
        (
            totalAmount *
            item.rate /
            100
        ),
    0
);



const remainingAmount =
    totalAmount -
    distributedAmount;



const valid =
totalRate===100;



if(!open)
    return null;



return (

<div
className="
fixed
inset-0
z-50
"
>


<div
className="
absolute
inset-0
bg-black/30
"
onClick={()=>{
    resetForm();
    onClose();
}}
/>



<div
className="
absolute
right-0
top-0
h-full
w-full
max-w-lg
bg-white
p-6
shadow-xl
overflow-auto
"
>


<div
className="
flex
items-center
justify-between
mb-6
"
>

<div>

<h2
className="
text-xl
font-bold
"
>

Proje Dağıtımı

</h2>


<p
className="
text-sm
text-slate-500
"
>

{selectedCount} kayıt seçildi

</p>


</div>


<button
onClick={()=>{
    resetForm();
    onClose();
}}
>

✕

</button>


</div>




<div
className="
space-y-5
"
>


<div
className="
grid
grid-cols-2
gap-3
"
>


<select

value={projectId}

onChange={
e=>setProjectId(e.target.value)
}

className="
rounded-xl
border
px-3
py-3
"
>


<option value="">
Proje
</option>


{
projects.map(x=>(

<option
key={x.id}
value={x.id}
>

{x.display_name}

</option>

))

}


</select>



<input

type="number"

value={rate}

onChange={
e=>setRate(e.target.value)
}

placeholder="%"

className="
rounded-xl
border
px-3
py-3
"

/>


</div>




<button

onClick={addDistribution}

className="
w-full
rounded-xl
border
py-3
font-semibold
hover:bg-slate-50
"

>

+ Dağılım Ekle

</button>



<div
className="
grid
grid-cols-3
gap-3
"
>

<div className="
rounded-2xl
bg-slate-50
p-4
">

<p className="
text-xs
text-slate-500
">
Toplam Tutar
</p>

<p className="
font-bold
">
{
totalAmount.toLocaleString(
"tr-TR",
{
style:"currency",
currency:"TRY"
}
)
}
</p>

</div>



<div className="
rounded-2xl
bg-slate-50
p-4
">

<p className="
text-xs
text-slate-500
">
Dağıtılan
</p>

<p className="
font-bold
">
{
distributedAmount.toLocaleString(
"tr-TR",
{
style:"currency",
currency:"TRY"
}
)
}
</p>

</div>



<div className="
rounded-2xl
bg-slate-50
p-4
">

<p className="
text-xs
text-slate-500
">
Kalan
</p>

<p className="
font-bold
">
{
remainingAmount.toLocaleString(
"tr-TR",
{
style:"currency",
currency:"TRY"
}
)
}
</p>

</div>

</div>




<div
className="
rounded-2xl
border
overflow-hidden
"
>


{
distribution.map((item,index)=>(


<div
key={index}
className="
flex
items-center
justify-between
border-b
px-4
py-3
"
>


<div>

<p className="font-semibold">

{item.projectName}

</p>


<p className="text-sm text-slate-500">

{item.rate}%

</p>


<p className="
text-sm
font-semibold
text-slate-700
">

{
(
    totalAmount *
    item.rate /
    100
)
.toLocaleString(
    "tr-TR",
    {
        style:"currency",
        currency:"TRY"
    }
)
}

</p>


</div>



<button

onClick={()=>
removeDistribution(index)
}

className="
text-red-500
text-sm
"

>

Sil

</button>


</div>


))

}


</div>




<div
className="
rounded-2xl
bg-slate-50
p-4
"
>


<p>

Toplam Oran:

<strong>

 %{totalRate}

</strong>

</p>



<p>

Dağıtılacak Tutar:

<strong>

{totalAmount.toLocaleString("tr-TR")} ₺

</strong>

</p>


</div>





<button

disabled={false}

onClick={() => {
    onSave(distribution);
}}

className={`
w-full
rounded-xl
py-3
font-semibold
text-white
${valid
?
"bg-blue-600 hover:bg-blue-700"
:
"bg-slate-300"
}
`}

>

Kaydet

</button>



</div>


</div>


</div>

);

}





















