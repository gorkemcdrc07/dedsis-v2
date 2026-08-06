import { useState } from "react";
import { X, Plus } from "lucide-react";


type Employee = {
    id:number;
    name:string;
    totalPercentage:number;
};


type Project = {
    id:number;
    display_name:string | null;
};



type Props = {

    open:boolean;

    employee?:Employee;

    projects:Project[];

    loading?:boolean;

    onClose:()=>void;

    onSave:(payload:{
        employeeId:number;
        projectId:number;
        percentage:number;
    })=>void;

};



export function AddProjectModal({
    open,
    employee,
    projects,
    loading,
    onClose,
    onSave,
}:Props){


    const [projectId,setProjectId] =
        useState<number | "">("");

    const [percentage,setPercentage] =
        useState("");



    if(!open){
        return null;
    }







    const employeeId =
        employee?.id ?? "";

    const remaining =
        employee
        ?
        100 - employee.totalPercentage
        :
        0;



    const value =
        Number(percentage);



    const invalid =
        value > remaining ||
        value <= 0;



    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">


                <div className="flex justify-between">


                    <div>

                        <h2 className="text-xl font-bold">
                            {employee?.name} için yeni proje ekle
                        </h2>

                        <p className="text-sm text-slate-500">
                            Kullanıcıya yeni proje dağılımı ekleyin.
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-slate-100"
                    >
                        <X size={20}/>
                    </button>


                </div>




                <div className="mt-6 space-y-4">
<select
                        value={projectId}
                        onChange={
                            e=>setProjectId(
                                Number(e.target.value)
                            )
                        }
                        className="h-12 w-full rounded-xl border px-3"
                    >

                        <option value="">
                            Proje seç
                        </option>


                        {
                            projects.map(project=>(

                                <option
                                    key={project.id}
                                    value={project.id}
                                >
                                    {project.display_name}
                                </option>

                            ))
                        }

                    </select>




                    <div className="rounded-2xl bg-blue-50 p-4">

                        <div className="text-sm text-blue-600">
                            Kullanılabilir
                        </div>


                        <div className="text-3xl font-bold text-blue-700">
                            %{remaining}
                        </div>

                    </div>




                    <input
                        type="number"
                        value={percentage}
                        onChange={
                            e=>setPercentage(e.target.value)
                        }
                        placeholder="Yüzde"
                        className="h-12 w-full rounded-xl border px-4 text-lg font-bold"
                    />



                    {
                        invalid &&

                        <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                            Maksimum %{remaining} verebilirsiniz.
                        </div>

                    }


                </div>




                <div className="mt-6 flex justify-end gap-3">


                    <button
                        onClick={onClose}
                        className="rounded-xl px-5 py-3 font-semibold text-slate-600"
                    >
                        Vazgeç
                    </button>



                    <button
                        disabled={
                            invalid ||
                            !employeeId ||
                            !projectId ||
                            loading
                        }
                        onClick={() =>
                            onSave({

                                employeeId:
                                    Number(employeeId),

                                projectId:
                                    Number(projectId),

                                percentage:value,

                            })
                        }
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                    >

                        <Plus size={16}/>
                        Ekle

                    </button>


                </div>


            </div>


        </div>

    );

}




