import type {
    IKRow
} from "../types";


type Props = {

    rows:IKRow[];

};


export function IKStats({
    rows
}:Props){


const total =
    rows.reduce(
        (sum,x)=>sum+x.isverenMaliyeti,
        0
    );


return (

<div className="
grid
gap-4
md:grid-cols-3
">


<div className="
rounded-3xl
border
bg-white
p-5
">

<p className="text-sm text-slate-500">
Toplam Personel
</p>

<p className="text-2xl font-bold">
{rows.length}
</p>

</div>



<div className="
rounded-3xl
border
bg-white
p-5
">

<p className="text-sm text-slate-500">
İşveren Maliyeti
</p>

<p className="text-2xl font-bold">
{total.toLocaleString("tr-TR")} ₺
</p>

</div>



<div className="
rounded-3xl
border
bg-white
p-5
">

<p className="text-sm text-slate-500">
Bekleyen Dağıtım
</p>

<p className="text-2xl font-bold">
{
rows.filter(
x=>x.dagitimDurumu==="bekliyor"
).length
}
</p>

</div>


</div>

);

}
