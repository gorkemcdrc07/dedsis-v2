import {
    useEffect,
    useState
} from "react";


import {
    parseMuhasebeExcel
} from "../features/muhasebe/utils/muhasebeParser";


import {
    createMuhasebeImport,
    getMuhasebeKayitlari,
    getMuhasebeStats,
    getMuhasebeDashboard,
    getMuhasebeImports,
    saveMuhasebeDistribution
} from "../features/muhasebe/api/muhasebe.api";


import {
    getEmployeeProjects
} from "../features/employee-projects/employee-projects.api";


import type {
    MuhasebeRow
} from "../features/muhasebe/types";



import {
    MuhasebeUploadPanel
} from "../features/muhasebe/components/MuhasebeUploadPanel";


import {
    MuhasebeTable
} from "../features/muhasebe/components/MuhasebeTable";


import {
    MuhasebeProcessModal
} from "../features/muhasebe/components/MuhasebeProcessModal";


import {
    MuhasebeDistributionDrawer
} from "../features/muhasebe/components/MuhasebeDistributionDrawer";


import {
    MuhasebeDashboard
} from "../features/muhasebe/components/MuhasebeDashboard";




export default function MuhasebePage() {



    const [rows, setRows] =
        useState<MuhasebeRow[]>([]);



    const [stats, setStats] =
        useState<any>(null);


    const [selectedMonth, setSelectedMonth] =
        useState(new Date().getMonth() + 1);


    const [selectedYear, setSelectedYear] =
        useState(new Date().getFullYear());



    const [imports, setImports] =
        useState<any[]>([]);


    const [dashboard, setDashboard] =
        useState<any>(null);



    const [projects, setProjects] =
        useState<any[]>([]);



    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);


const [distributionOpen,setDistributionOpen] =
    useState(false);



    const [process, setProcess] =
        useState({

            open: false,

            title: "",

            message: "",

            percent: 0

        });



    async function load() {


        const [
            kayitlar,
            stat,
            dashboardData,
            history,
            projectData

        ] = await Promise.all([

            getMuhasebeKayitlari({

                ay:selectedMonth,

                yil:selectedYear

            }),

            getMuhasebeStats({

                ay:selectedMonth,

                yil:selectedYear

            }),

            getMuhasebeDashboard({

                ay:selectedMonth,

                yil:selectedYear

            }),

            getMuhasebeImports({

                ay:selectedMonth,

                yil:selectedYear

            }),

            getEmployeeProjects()

        ]);



        setRows(
            kayitlar as MuhasebeRow[]
        );



        setStats(
            stat.data ?? stat
        );



        setDashboard(
            dashboardData.data ?? dashboardData
        );



        setImports(
            history
        );



        setProjects(
            projectData.projects ?? []
        );


    }



    useEffect(() => {

        load();

    }, []);





    async function handleUpload(
        event: React.ChangeEvent<HTMLInputElement>,
        ay: number,
        yil: number
    ) {


        const file =
            event.target.files?.[0];


        if (!file)
            return;



        setProcess({

            open: true,

            title: "Excel okunuyor",

            message: "Muhasebe kayıtları hazırlanıyor.",

            percent: 20

        });



        const result =
            await parseMuhasebeExcel(file);



        setProcess({

            open: true,

            title: "Kayıtlar aktarılıyor",

            message: "Veriler sisteme kaydediliyor.",

            percent: 60

        });



        await createMuhasebeImport({

            dosyaAdi: file.name,

            rows: result.rows,

            donemAy: ay,

            donemYil: yil

        });



        setProcess({

            open: true,

            title: "Tamamlandı",

            message: "Excel başarıyla aktarıldı.",

            percent: 100

        });



        await load();


    }





    function selectedRows() {

        return rows.filter(
            x =>
                selectedIds.includes(
                    String(x.id)
                )
        );

    }






    async function distribute(
        distribution: any[]
    ) {


        setProcess({

            open: true,

            title: "Dağıtım yapılıyor",

            message: "Projeler hesaplanıyor.",

            percent: 50

        });



        await saveMuhasebeDistribution({

            records: selectedRows(),

            distribution

        });



        setProcess({

            open: true,

            title: "Tamamlandı",

            message: "Dağıtım başarıyla tamamlandı.",

            percent: 100

        });



        setRows(
            prev =>
                prev.filter(
                    x =>
                        !selectedIds.includes(
                            String(x.id)
                        )
                )
        );


        setSelectedIds([]);

    }



    async function applyPeriod(){

        await load();

    }

    return (

        <div
            className="
space-y-6
p-6
"
        >



            <MuhasebeUploadPanel

                onUpload={handleUpload}

            />


            <MuhasebeDashboard

                stats={stats}

                pending={rows.length}

                distributed={
                    (stats?.totalCount ?? 0) - rows.length
                }

                dashboard={dashboard}

                imports={imports}

            />

{
selectedIds.length > 0 && (

<div
className="flex items-center justify-between rounded-2xl bg-blue-50 p-4"
>

<div>
{selectedIds.length} kayıt seçildi
</div>

<button
onClick={()=>setDistributionOpen(true)}
className="rounded-xl bg-blue-600 px-5 py-2 text-white"
>
Projelere Dağıt
</button>
</div>
)
}

            <MuhasebeTable

                rows={rows}

                selectedIds={selectedIds}

                onSelectionChange={setSelectedIds}

            />





            <MuhasebeProcessModal



                open={process.open}

                title={process.title}

                message={process.message}

                percent={process.percent}

                onClose={() =>
                    setProcess({
                        ...process,
                        open: false
                    })
                }

            />




            <MuhasebeDistributionDrawer

                open={distributionOpen}

                onClose={() =>
                    setDistributionOpen(false)
                }

                rows={selectedRows()}

                projects={projects}

                onSave={async(distribution:any)=>{

                    await distribute(distribution)

                    setDistributionOpen(false)

                }}

            />
        </div>

    );

}

























