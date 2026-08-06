import {
    Plus,
    CalendarDays
} from "lucide-react";


type Props = {

    date:string;

    onDateChange:(value:string)=>void;

    onCreate?:()=>void;

};



export function EvideaHeader({

    date,

    onDateChange,

    onCreate,

}:Props){


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
                flex-col
                gap-5
                lg:flex-row
                lg:items-center
                lg:justify-between
                "
            >


                <div>


                    <div className="
                    flex
                    items-center
                    gap-2
                    "
                    >

                        <h1 className="
                        text-3xl
                        font-bold
                        text-slate-900
                        ">
                            Evidea Operasyon Merkezi
                        </h1>


                    </div>



                    <p className="
                    mt-2
                    text-sm
                    text-slate-500
                    ">
                        Teslimat süreçlerini takip edin,
                        yönetin ve güncelleyin.
                    </p>


                </div>





                <div
                    className="
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    "
                >



                    <div
                        className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        bg-slate-50
                        px-4
                        "
                    >

                        <CalendarDays
                            size={18}
                            className="text-slate-500"
                        />


                        <input

                            type="date"

                            value={date}

                            onChange={
                                e=>onDateChange(
                                    e.target.value
                                )
                            }

                            className="
                            h-11
                            bg-transparent
                            outline-none
                            text-sm
                            "
                        />


                    </div>





                    <button

                        onClick={()=>onCreate?.()}

                        className="
                        flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-blue-600
                        px-6
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        hover:shadow-md
                        "

                    >

                        <Plus size={18}/>

                        Yeni Teslimat

                    </button>



                </div>


            </div>


        </div>

    );

}

