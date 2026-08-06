import {
    useState
} from "react";


import type {
    MuhasebeRow
} from "../types";



type Props = {

    open: boolean;

    onClose: () => void;

    rows: MuhasebeRow[];

    projects: any[];

    onSave: (data: any[]) => void;

};



export function MuhasebeDistributionDrawer({

    open,

    onClose,

    rows,

    projects,

    onSave

}: Props) {



    const [mode, setMode] =
        useState<
            "manual" | "equal"
        >("manual");



    const [distribution, setDistribution] =
        useState<any[]>([]);



    const total =
        rows.reduce(
            (sum, row) =>
                sum + Number(row.borc || 0),
            0
        );





    function equalDistribution() {


        if (!projects.length)
            return;



        const rate =
            Number(
                (
                    100 / projects.length
                ).toFixed(2)
            );



        const data =
            projects.map(
                (project, index) => ({

                    projectId: project.id,

                    rate:
                        index === projects.length - 1
                            ?
                            100 -
                            rate *
                            (projects.length - 1)
                            :
                            rate

                })
            );



        setDistribution(data);


    }





    function addProject(
        projectId: number
    ) {


        const exists =
            distribution.some(
                x => x.projectId === projectId
            );


        if (exists)
            return;



        setDistribution([
            ...distribution,
            {
                projectId,
                rate: 0
            }
        ]);

    }




    function updateRate(
        projectId: number,
        rate: number
    ) {


        setDistribution(
            distribution.map(
                x =>
                    x.projectId === projectId
                        ?
                        {
                            ...x,
                            rate
                        }
                        :
                        x
            )
        );

    }





    const totalRate =
        Number(
            distribution
                .reduce(
                    (sum, x) =>
                        sum + Number(x.rate),
                    0
                )
                .toFixed(2)
        );


    if (!open)
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
                onClick={onClose}
            />




            <div
                className="
absolute
right-0
top-0
h-full
w-full
max-w-xl
bg-white
p-8
shadow-xl
overflow-auto
"
            >



                <h2
                    className="
text-2xl
font-bold
"
                >
                    Proje Dağıtımı
                </h2>



                <p
                    className="
mt-2
text-sm
text-slate-500
"
                >
                    {rows.length} kayıt seçildi
                </p>




                <div
                    className="
mt-6
rounded-2xl
bg-slate-50
p-5
"
                >

                    <p
                        className="
text-sm
text-slate-500
"
                    >
                        Toplam Tutar
                    </p>


                    <h3
                        className="
text-2xl
font-bold
"
                    >

                        {
                            total.toLocaleString(
                                "tr-TR"
                            )
                        }

                        ₺

                    </h3>

                </div>





                <div
                    className="
mt-6
flex
gap-3
"
                >


                    <button

                        onClick={() =>
                            setMode("manual")
                        }

                        className={`
flex-1
rounded-xl
py-3
${mode === "manual"
                                ?
                                "bg-blue-600 text-white"
                                :
                                "border"
                            }
`}

                    >
                        Manuel
                    </button>



                    <button

                        onClick={() => {

                            setMode("equal");

                            equalDistribution();

                        }}

                        className={`
flex-1
rounded-xl
py-3
${mode === "equal"
                                ?
                                "bg-blue-600 text-white"
                                :
                                "border"
                            }
`}

                    >

                        Eşit Dağıt

                    </button>



                </div>





                {
                    mode === "manual" &&

                    <div
                        className="
mt-6
space-y-3
"
                    >


                        <select

                            className="
w-full
rounded-xl
border
p-3
"

                            onChange={
                                e =>
                                    addProject(
                                        Number(e.target.value)
                                    )
                            }

                        >

                            <option>
                                Proje seç
                            </option>


                            {
                                projects.map(
                                    p => (

                                        <option
                                            key={p.id}
                                            value={p.id}
                                        >
                                            {p.display_name}
                                        </option>

                                    )

                                )

                            }

                        </select>



                    </div>

                }





                <div
                    className="
mt-6
space-y-3
"
                >


                    {
                        distribution.map(
                            (item) => (


                                <div
                                    key={item.projectId}
                                    className="
flex
items-center
justify-between
rounded-xl
border
p-3
"
                                >


                                    <span>

                                        {
                                            projects.find(
                                                p => p.id === item.projectId
                                            )?.display_name
                                        }

                                    </span>



                                    <input

                                        type="number"

                                        value={item.rate}

                                        onChange={
                                            e =>
                                                updateRate(
                                                    item.projectId,
                                                    Number(e.target.value)
                                                )
                                        }

                                        className="
w-24
rounded-lg
border
p-2
"

                                    />



                                </div>


                            )

                        )

                    }


                </div>





                <div
                    className="
mt-6
rounded-xl
bg-slate-100
p-4
"
                >

                    Toplam Oran:

                    <strong>
                        %{totalRate}
                    </strong>


                </div>





                <button

                    disabled={
                        Math.abs(totalRate - 100) > 0.01
                    }
                    onClick={() =>
                        onSave(distribution)
                    }

                    className="
mt-6
w-full
rounded-xl
bg-emerald-600
py-3
font-bold
text-white
disabled:bg-slate-300
"

                >

                    Dağıtımı Başlat

                </button>




            </div>


        </div>

    );

}