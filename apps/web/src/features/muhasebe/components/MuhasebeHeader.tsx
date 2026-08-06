type Props = {
    onUpload:(
        event:React.ChangeEvent<HTMLInputElement>
    )=>void;
};



export function MuhasebeHeader({
    onUpload
}:Props){


return (

<div
className="
rounded-3xl
border
bg-gradient-to-br
from-white
to-slate-50
p-8
shadow-sm
"
>


<div
className="
flex
items-center
justify-between
gap-8
"
>


<div
className="
flex
items-center
gap-5
"
>


<div
className="
flex
h-16
w-16
items-center
justify-center
rounded-3xl
bg-blue-600
text-white
text-3xl
shadow-lg
shadow-blue-200
"
>

₺

</div>



<div>

<h1
className="
text-3xl
font-bold
tracking-tight
text-slate-900
"
>
Muhasebe Analiz Merkezi
</h1>



<p
className="
mt-2
max-w-xl
text-sm
text-slate-500
"
>
Excel finans kayıtlarını yükleyin, borç-alacak analizlerini görüntüleyin ve kayıtları projelere dağıtın.
</p>



<div
className="
mt-3
flex
items-center
gap-2
text-xs
text-slate-400
"
>

<span
className="
rounded-full
bg-blue-50
px-3
py-1
text-blue-600
font-medium
"
>
.xlsx
</span>


<span
className="
rounded-full
bg-blue-50
px-3
py-1
text-blue-600
font-medium
"
>
.xls
</span>


<span>
Maksimum performanslı Excel aktarımı
</span>


</div>


</div>


</div>





<label
className="
group
flex
min-w-[220px]
cursor-pointer
flex-col
items-center
justify-center
rounded-2xl
border-2
border-dashed
border-blue-200
bg-white
px-8
py-6
transition
hover:border-blue-500
hover:bg-blue-50
"
>


<div
className="
mb-2
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-blue-600
text-white
text-xl
transition
group-hover:scale-110
"
>
↑
</div>



<span
className="
text-sm
font-semibold
text-slate-800
"
>
Excel Yükle
</span>



<span
className="
mt-1
text-xs
text-slate-400
"
>
Dosyayı seçmek için tıklayın
</span>



<input

type="file"

accept=".xlsx,.xls"

className="hidden"

onChange={onUpload}

/>


</label>



</div>


</div>

);

}
