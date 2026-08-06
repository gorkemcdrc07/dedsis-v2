import {
    useState
} from "react";


type Props = {

    onUpload: (
        event: React.ChangeEvent<HTMLInputElement>,
        ay: number,
        yil: number
    ) => void;

};



export function MuhasebeUploadPanel({

    onUpload

}: Props) {



    const today =
        new Date();



    const [ay, setAy] =
        useState(
            today.getMonth() + 1
        );



    const [yil, setYil] =
        useState(
            today.getFullYear()
        );



    const [fileName, setFileName] =
        useState("");



    function handleChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {


        const file =
            event.target.files?.[0];


        if (file) {

            setFileName(
                file.name
            );


        }


    }




    return (

        <div
            className="
rounded-3xl
border
bg-white
p-8
shadow-sm
"
        >


            <div
                className="
flex
items-center
justify-between
gap-6
"
            >



                <div>


                    <h1
                        className="
text-3xl
font-bold
text-slate-900
"
                    >
                        Muhasebe Yükleme Merkezi
                    </h1>


                    <p
                        className="
mt-2
text-sm
text-slate-500
"
                    >
                        Excel muhasebe kayýtlarýný yükleyin ve projelere daðýtýn.
                    </p>


                </div>





                <div
                    className="
flex
gap-3
"
                >


                    <select

                        value={ay}

                        onChange={
                            e => setAy(
                                Number(e.target.value)
                            )
                        }

                        className="
rounded-xl
border
px-4
py-3
"
                    >


                        {
                            Array.from(
                                {
                                    length: 12
                                },
                                (_, i) => (


                                    <option
                                        key={i + 1}
                                        value={i + 1}
                                    >

                                        {i + 1}. Ay

                                    </option>


                                ))

                        }


                    </select>




                    <select

                        value={yil}

                        onChange={
                            e => setYil(
                                Number(e.target.value)
                            )
                        }

                        className="
rounded-xl
border
px-4
py-3
"

                    >


                        <option>
                            2026
                        </option>

                        <option>
                            2027
                        </option>


                    </select>



                </div>



            </div>






            <div
                className="
mt-8
flex
items-center
justify-between
rounded-2xl
border-2
border-dashed
border-blue-200
bg-blue-50
p-6
"
            >



                <div>


                    <p
                        className="
font-semibold
text-slate-800
"
                    >
                        Excel Dosyasý
                    </p>



                    <p
                        className="
mt-1
text-sm
text-slate-500
"
                    >
                        .xlsx veya .xls formatý
                    </p>


                    {
                        fileName &&

                        <p
                            className="
mt-3
rounded-lg
bg-white
px-3
py-2
text-sm
text-blue-600
"
                        >

                            {fileName}

                        </p>

                    }



                </div>




                <label
                    className="
cursor-pointer
rounded-xl
bg-blue-600
px-6
py-3
font-semibold
text-white
hover:bg-blue-700
"
                >


                    Excel Seç


                    <input

                        type="file"

                        accept=".xlsx,.xls"

                        className="hidden"

                        onChange={(e) => {

                            handleChange(e);

                            if (e.target.files?.[0]) {

                                onUpload(
                                    e,
                                    ay,
                                    yil
                                );

                            }

                        }}

                    />


                </label>



            </div>


        </div>

    );

}