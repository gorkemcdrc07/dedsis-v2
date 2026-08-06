type Props = {

    onUpload:()=>void;

};


export function IKHeader({
    onUpload
}:Props){

return (

<div className="
rounded-3xl
border
bg-white
p-5
shadow-sm
flex
items-center
justify-between
">


<div>

<h1 className="
text-xl
font-bold
text-slate-900
">
İnsan Kaynakları
</h1>


<p className="
text-sm
text-slate-500
">
Personel maliyet ve proje dağıtım yönetimi
</p>

</div>



<button

onClick={onUpload}

className="
rounded-xl
bg-blue-600
px-5
py-3
text-sm
font-semibold
text-white
hover:bg-blue-700
"

>
Excel Yükle
</button>


</div>

);

}
