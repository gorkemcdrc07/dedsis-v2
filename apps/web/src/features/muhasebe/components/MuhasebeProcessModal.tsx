type Props = {

    open:boolean;

    title:string;

    message:string;

    percent:number;

    onClose:()=>void;

};



export function MuhasebeProcessModal({

    open,

    title,

    message,

    percent,

    onClose

}:Props){


if(!open)
    return null;



return (

<div
className="
fixed
inset-0
z-[100]
flex
items-center
justify-center
"
>


<div
className="
absolute
inset-0
bg-black/40
"
/>



<div
className="
relative
w-full
max-w-md
rounded-3xl
bg-white
p-8
shadow-2xl
"
>


<div
className="
flex
items-center
justify-between
"
>

<h2
className="
text-xl
font-bold
text-slate-900
"
>
{title}
</h2>


<button
onClick={onClose}
className="
text-slate-400
hover:text-slate-700
"
>
✕
</button>


</div>



<p
className="
mt-4
text-sm
text-slate-500
"
>
{message}
</p>



<div
className="
mt-6
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
transition-all
duration-500
"
style={{
width:`${percent}%`
}}
/>

</div>



<div
className="
mt-3
flex
justify-between
text-sm
"
>

<span>
İşlem durumu
</span>


<strong>
%{percent}
</strong>


</div>




<div
className="
mt-6
space-y-3
"
>


<div
className="
flex
items-center
gap-3
rounded-xl
bg-slate-50
p-3
"
>

<span>
{percent>=20 ? "✅":"⏳"}
</span>

Kayıtlar hazırlanıyor

</div>



<div
className="
flex
items-center
gap-3
rounded-xl
bg-slate-50
p-3
"
>

<span>
{percent>=50 ? "✅":"⏳"}
</span>

Proje dağılımları hesaplanıyor

</div>



<div
className="
flex
items-center
gap-3
rounded-xl
bg-slate-50
p-3
"
>

<span>
{percent>=90 ? "✅":"⏳"}
</span>

Veriler kaydediliyor

</div>


</div>


</div>


</div>

);

}
