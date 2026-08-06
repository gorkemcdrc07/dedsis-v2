type Props = {

    search:string;

    fisTipi:string;

    onSearchChange:(value:string)=>void;

    onFisTipiChange:(value:string)=>void;

    onClear:()=>void;


    onExport:()=>void;


    startDate:string;

    endDate:string;

    onStartDateChange:(value:string)=>void;

    onEndDateChange:(value:string)=>void;

};



export function MuhasebeFilters({

    search,

    fisTipi,

    onSearchChange,

    onFisTipiChange,

    onClear,

    startDate,

    endDate,

    onStartDateChange,

    onEndDateChange,

    onExport

}:Props){


const active =
search.length > 0 ||
fisTipi.length > 0;



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
mb-5
flex
items-center
justify-between
"
>


<div>

<h3
className="
font-bold
text-slate-900
"
>
Kayıt Filtreleri
</h3>


<p
className="
mt-1
text-sm
text-slate-500
"
>
Muhasebe hareketlerini hızlıca filtreleyin.
</p>


</div>



{
active && (

<span
className="
rounded-full
bg-blue-50
px-3
py-1
text-xs
font-semibold
text-blue-600
"
>
Aktif filtre
</span>

)

}


</div>




<div
className="
grid
gap-4
lg:grid-cols-[1fr_220px_180px_180px_auto]
"
>



<div>

<label
className="
mb-2
block
text-xs
font-semibold
uppercase
tracking-wide
text-slate-400
"
>
Genel Arama
</label>



<div
className="
relative
"
>


<input

value={search}

onChange={
e=>onSearchChange(e.target.value)
}

placeholder="Hesap, açıklama, kod veya yevmiye ara..."

className="
w-full
rounded-2xl
border
px-4
py-3
text-sm
outline-none
transition
focus:border-blue-500
focus:ring-4
focus:ring-blue-100
"

/>


</div>


</div>





<div>

<label
className="
mb-2
block
text-xs
font-semibold
uppercase
tracking-wide
text-slate-400
"
>
Fiş Tipi
</label>


<input

value={fisTipi}

onChange={
e=>onFisTipiChange(e.target.value)
}

placeholder="Örn: Mahsup"

className="
w-full
rounded-2xl
border
px-4
py-3
text-sm
outline-none
transition
focus:border-blue-500
focus:ring-4
focus:ring-blue-100
"

/>


</div>




<div>

<label
className="
mb-2
block
text-xs
font-semibold
uppercase
tracking-wide
text-slate-400
"
>
Başlangıç
</label>


<input

type="date"

value={startDate}

onChange={
e=>onStartDateChange(e.target.value)
}

className="
w-full
rounded-2xl
border
px-4
py-3
text-sm
outline-none
focus:border-blue-500
"

/>

</div>




<div>

<label
className="
mb-2
block
text-xs
font-semibold
uppercase
tracking-wide
text-slate-400
"
>
Bitiş
</label>


<input

type="date"

value={endDate}

onChange={
e=>onEndDateChange(e.target.value)
}

className="
w-full
rounded-2xl
border
px-4
py-3
text-sm
outline-none
focus:border-blue-500
"

/>

</div>





<button

onClick={onClear}

className="
h-fit
self-end
rounded-2xl
border
px-6
py-3
text-sm
font-semibold
text-slate-600
transition
hover:bg-slate-50
"

>

Filtreleri Temizle

</button>



<button

onClick={onExport}

className="
h-fit
self-end
rounded-2xl
bg-blue-600
px-6
py-3
text-sm
font-semibold
text-white
transition
hover:bg-blue-700
"

>

Excel'e Aktar

</button>



</div>


</div>

);

}





