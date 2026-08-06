import {
    Search,
    FilterX
} from "lucide-react";


type Props = {

    status:string;

    search:string;

    onStatusChange:(value:string)=>void;

    onSearchChange:(value:string)=>void;

    onClear:()=>void;

};



export function BasbugFilters({

    status,

    search,

    onStatusChange,

    onSearchChange,

    onClear,

}:Props){


    return (

        <div
            className="
            rounded-2xl
            border
            bg-white
            p-4
            shadow-sm
            "
        >


            <div
                className="
                flex
                flex-col
                gap-3
                lg:flex-row
                "
            >



                <div
                    className="
                    flex
                    h-11
                    flex-1
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    "
                >

                    <Search
                        size={18}
                        className="text-slate-400"
                    />


                    <input

                        value={search}

                        onChange={
                            e=>onSearchChange(
                                e.target.value
                            )
                        }

                        placeholder="Plaka veya sürücü ara..."

                        className="
                        w-full
                        outline-none
                        text-sm
                        "

                    />

                </div>





                <select

                    value={status}

                    onChange={
                        e=>onStatusChange(
                            e.target.value
                        )
                    }

                    className="
                    h-11
                    rounded-xl
                    border
                    px-4
                    text-sm
                    "

                >

                    <option value="">
                        Tüm Durumlar
                    </option>


                    <option value="Yolda">
                        Yolda
                    </option>


                    <option value="Teslim Noktasında">
                        Teslim Noktasında
                    </option>


                    <option value="Beklemede">
                        Beklemede
                    </option>


                    <option value="Teslim Edildi">
                        Teslim Edildi
                    </option>


                </select>





                <button

                    onClick={onClear}

                    className="
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    "

                >

                    <FilterX size={17}/>

                    Temizle

                </button>


            </div>


        </div>

    );

}


