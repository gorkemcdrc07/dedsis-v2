import { useMemo, useState } from "react";
import {
    Plus,
    Search,
    Users,
    CheckCircle,
    AlertTriangle,
    MoreVertical,
    Pencil,
    Trash2
} from "lucide-react";

import { useEmployeeProjects } from "../features/employee-projects/useEmployeeProjects";
import {
    useCreateEmployeeProject,
    useUpdateEmployeeProject,
    useDeleteEmployeeProject,
    useUpdateEmployee,
    useDeleteEmployee,
    useActivateEmployee,
    usePermanentDeleteEmployee,
} from "../features/employee-projects/useEmployeeProjectMutations";

import { EditAllocationModal } from "../components/employee-projects/EditAllocationModal";
import { DeleteConfirmModal } from "../components/employee-projects/DeleteConfirmModal";
import { AddProjectModal } from "../components/employee-projects/AddProjectModal";
import { ProjectActionsMenu } from "../components/employee-projects/ProjectActionsMenu";
import { EmployeeProjectHistory } from "../components/employee-projects/EmployeeProjectHistory";
import { EditEmployeeModal } from "../components/employee-projects/EditEmployeeModal";
import { DeleteEmployeeConfirmModal } from "../components/employee-projects/DeleteEmployeeConfirmModal";


export function EmployeeProjectsPage() {

    const {
        data,
        loading,
        error,
    } = useEmployeeProjects();


    const createMutation =
        useCreateEmployeeProject();


    const updateMutation =
        useUpdateEmployeeProject();


    const deleteMutation =
        useDeleteEmployeeProject();


    const updateEmployeeMutation =
        useUpdateEmployee();


    const deleteEmployeeMutation =
        useDeleteEmployee();


    const activateEmployeeMutation =
        useActivateEmployee();


    const permanentDeleteEmployeeMutation =
        usePermanentDeleteEmployee();



    const [editEmployee,setEditEmployee] =
        useState<{
            id:number;
            name:string;
            username:string;
            is_active:boolean;
        } | null>(null);



    const [deleteEmployee,setDeleteEmployee] =
        useState<{
            id:number;
            name:string;
        } | null>(null);



    const [openEmployeeMenu,setOpenEmployeeMenu] =
        useState<number | null>(null);



    const [search,setSearch] =
        useState("");

    const [editProject,setEditProject] =
        useState<{
            id:number;
            name:string;
            current:number;
            max:number;
        } | null>(null);


    const [addProjectOpen,setAddProjectOpen] =
        useState(false);


    const [selectedEmployeeId,setSelectedEmployeeId] =
        useState<number | undefined>(undefined);


    const [deleteProject,setDeleteProject] =
        useState<{
            id:number;
            name:string;
        } | null>(null);



    const handleDelete = async(
        id:number
    ) => {

        await deleteMutation.mutateAsync(id);

        setDeleteProject(null);

    };



    const employees =
        useMemo(()=>{

            return (
                data?.employees ?? []
            )
            .filter(employee =>
                employee.name
                .toLowerCase()
                .includes(
                    search.toLowerCase()
                )
            );

        },[
            data,
            search
        ]);



    const completed =
        data?.employees.filter(
            x=>x.totalPercentage===100
        ).length ?? 0;



    const incomplete =
        data?.employees.filter(
            x=>x.totalPercentage!==100
        ).length ?? 0;



    if(loading){

        return (

            <div className="space-y-6 p-10">

                <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" />


                <div className="grid gap-4 md:grid-cols-3">

                    <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

                </div>


                <div className="grid gap-5 lg:grid-cols-2">

                    <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />

                    <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />

                </div>

            </div>

        );

    }



    if(error){

        return (
            <div className="p-10 text-red-600">
                {error}
            </div>
        );

    }



    return (

        <>

        <div className="space-y-6">


            <div className="flex items-center justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <h1 className="text-3xl font-bold text-slate-900">
                            Proje Dağılım Yönetimi
                        </h1>


                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            ● Aktif Sistem
                        </span>

                    </div>


                    <p className="mt-1 text-sm text-slate-500">
                        Kullanıcıların proje bazlı kapasite ve yetki dağılımlarını merkezi olarak yönetin.
                    </p>

                </div>


                <button
                    onClick={() => {
                        setSelectedEmployeeId(undefined);
                        setAddProjectOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                    <Plus size={18}/>
                    Proje Ekle
                </button>


            </div>




            <div className="grid gap-4 md:grid-cols-3">


                <div className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

                    <div className="flex items-center justify-between">

                        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Users size={22}/>
                        </div>

                    </div>


                    <div className="mt-4 text-sm text-slate-500">
                        Toplam Kullanıcı
                    </div>


                    <div className="mt-1 text-4xl font-bold text-slate-900">
                        {data?.employees.length ?? 0}
                    </div>


                    <div className="mt-2 text-xs text-slate-400">
                        Sistemde kayıtlı kullanıcılar
                    </div>


                </div>



                <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">


                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 w-fit">
                        <CheckCircle size={22}/>
                    </div>


                    <div className="mt-4 text-sm text-slate-500">
                        Dağılımı Tam
                    </div>


                    <div className="mt-1 text-4xl font-bold text-emerald-600">
                        {completed}
                    </div>


                    <div className="mt-2 text-xs text-slate-400">
                        %100 tamamlanan kullanıcılar
                    </div>


                </div>



                <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">


                    <div className="rounded-xl bg-orange-50 p-3 text-orange-600 w-fit">
                        <AlertTriangle size={22}/>
                    </div>


                    <div className="mt-4 text-sm text-slate-500">
                        Eksik Dağılım
                    </div>


                    <div className="mt-1 text-4xl font-bold text-orange-600">
                        {incomplete}
                    </div>


                    <div className="mt-2 text-xs text-slate-400">
                        Düzenleme bekleyen kullanıcılar
                    </div>


                </div>


            </div>




            <div className="relative">

                <Search
                    size={18}
                    className="absolute left-4 top-3.5 text-slate-400"
                />

                <input
                    value={search}
                    onChange={
                        e=>setSearch(e.target.value)
                    }
                    placeholder="Kullanıcı ara..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 text-sm shadow-sm transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

            </div>





            <div className="grid gap-5 lg:grid-cols-2">


            {
                employees.length === 0

                ?

                <div className="col-span-full rounded-2xl border border-dashed bg-slate-50 p-10 text-center">

                    <div className="text-3xl">
                        🔍
                    </div>


                    <div className="mt-3 font-semibold text-slate-700">
                        Kullanıcı bulunamadı
                    </div>


                    <div className="mt-1 text-sm text-slate-500">
                        Arama kriterinize uygun kayıt bulunamadı.
                    </div>

                </div>

                :

                employees.map(employee=>(


                    <div
                        key={employee.id}
                        className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                    >


                        <div className="flex items-center justify-between">


                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                    {employee.name.charAt(0)}
                                </div>


                                <div>

                                    <div className="font-bold text-slate-900">
                                        {employee.name}
                                    </div>


                                    <div className="text-sm text-slate-500">
                                        @{employee.username}
                                    </div>

                                </div>


                            </div>


                            <div className="flex items-start gap-2">
                                <div className="relative">

                                    <button
                                        onClick={() =>
                                            setOpenEmployeeMenu(
                                                openEmployeeMenu === employee.id
                                                ? null
                                                : employee.id
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <MoreVertical size={18}/>
                                    </button>


                                    {
                                        openEmployeeMenu === employee.id && (

                                            <div className="absolute right-0 z-30 mt-2 w-40 rounded-xl border bg-white p-2 shadow-lg">


                                                <button
                                                    onClick={()=>{
                                                        setEditEmployee({
                                                            id:employee.id,
                                                            name:employee.name,
                                                            username:employee.username,
                                                            is_active:true
                                                        });

                                                        setOpenEmployeeMenu(null);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                                                >
                                                    <Pencil size={15}/>
                                                    Düzenle
                                                </button>


                                                {
                                                    employee.is_active
                                                    ?
                                                    (
                                                        <button
                                                            onClick={()=>{
                                                                setDeleteEmployee({
                                                                    id:employee.id,
                                                                    name:employee.name
                                                                });

                                                                setOpenEmployeeMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={15}/>
                                                            Pasife Al
                                                        </button>
                                                    )
                                                    :
                                                    (
                                                        <button
                                                            onClick={()=>{

                                                                activateEmployeeMutation.mutate(
                                                                    employee.id
                                                                );

                                                                setOpenEmployeeMenu(null);

                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                                                        >
                                                            <CheckCircle size={15}/>
                                                            Aktif Et
                                                        </button>
                                                    )
                                                }



                                                <button
                                                    onClick={()=>{

                                                        permanentDeleteEmployeeMutation.mutate(
                                                            employee.id
                                                        );

                                                        setOpenEmployeeMenu(null);

                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={15}/>
                                                    Kalıcı Sil
                                                </button>
                                            </div>

                                        )
                                    }


                                </div>



                                <div
                                    className={
                                        employee.totalPercentage===100
                                        ?
                                        "rounded-2xl bg-emerald-50 px-4 py-2 text-xl font-bold text-emerald-700"
                                        :
                                        "rounded-2xl bg-orange-50 px-4 py-2 text-xl font-bold text-orange-700"
                                    }
                                >
                                    %{employee.totalPercentage}
                                </div>


                                <div
                                    className={
                                        employee.totalPercentage === 100
                                        ?
                                        "mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                                        :
                                        "mt-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
                                    }
                                >
                                    {
                                        employee.totalPercentage === 100
                                        ? "✓ Dağılım tamam"
                                        : "⚠ Eksik dağılım"
                                    }
                                </div>


                                <div
                                    className={
                                        employee.totalPercentage === 100
                                        ?
                                        "mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                                        :
                                        "mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
                                    }
                                >
                                    {
                                        employee.totalPercentage === 100
                                        ?
                                        "🟢 Dağılım Tamamlandı"
                                        :
                                        "🟡 Eksik Dağılım"
                                    }
                                </div>

                            </div>


                        </div>



                        <div className="mt-5">

                            <div className="mb-2 flex items-center justify-between">

                                <span className="text-sm text-slate-500">
                                    Toplam Dağılım
                                </span>


                                <span className="text-sm font-bold text-slate-700">
                                    %{employee.totalPercentage}
                                </span>

                            </div>


                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                                <div
                                    className={
    `h-full rounded-full transition-all ${
        employee.totalPercentage === 100
        ? "bg-emerald-500"
        :
        employee.totalPercentage >= 50
        ? "bg-blue-500"
        :
        "bg-orange-500"
    }`
}
                                    style={{
                                        width:
                                        `${Math.min(employee.totalPercentage,100)}%`
                                    }}
                                />

                            </div>


                            <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                                <span className="text-sm font-medium text-emerald-700">
                                    Kullanılabilir Hak
                                </span>


                                <span className="text-lg font-bold text-emerald-700">
                                    %{100 - employee.totalPercentage}
                                </span>


                            </div>


                        </div>




                        <div className="mt-5 space-y-2">


                        {
                            employee.projects.length===0

                            ?

                            <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-center">

                                <div className="text-2xl">
                                    📂
                                </div>


                                <div className="mt-2 font-semibold text-slate-700">
                                    Proje ataması bulunmuyor
                                </div>


                                <div className="mt-1 text-sm text-slate-500">
                                    Bu kullanıcı için henüz proje dağılımı yapılmamış.
                                </div>

                            </div>


                            :

                            employee.projects.map(project=>(


                                <div
                                    key={project.id}
                                    className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                                >

                                    <div className="mb-3 flex items-center justify-between">

                                        <div>

                                            <div className="font-semibold text-slate-800">
                                                {project.project}
                                            </div>


                                            <div className="mt-1 text-xs text-slate-400">
                                                Proje dağılımı
                                            </div>

                                        </div>


                                        <span
                                            className={
                                                employee.totalPercentage === 100
                                                ?
                                                "rounded-lg bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700"
                                                :
                                                "rounded-lg bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700"
                                            }
                                        >
                                            %{project.percentage}
                                        </span>


                                    </div>



                                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className={
    `h-full rounded-full transition-all ${
        employee.totalPercentage === 100
        ? "bg-emerald-500"
        :
        employee.totalPercentage >= 50
        ? "bg-blue-500"
        :
        "bg-orange-500"
    }`
}
                                            style={{
                                                width:
                                                `${Math.min(project.percentage,100)}%`
                                            }}
                                        />

                                    </div>



                                    <div className="mt-3 flex justify-end gap-2">


                                        <ProjectActionsMenu

                                            onEdit={() =>
                                                setEditProject({
                                                    id: project.id,
                                                    name: project.project,
                                                    current: project.percentage,
                                                    max:
                                                        100 -
                                                        (
                                                            employee.totalPercentage -
                                                            project.percentage
                                                        ),
                                                })
                                            }


                                            onDelete={() =>
                                                setDeleteProject({
                                                    id: project.id,
                                                    name: project.project,
                                                })
                                            }

                                        />


                                    </div>


                                </div>


                            ))

                        }


                        </div>


                        <EmployeeProjectHistory
                            employeeId={employee.id}
                        />


                        <button
                            onClick={() => {
                                setSelectedEmployeeId(employee.id);
                                setAddProjectOpen(true);
                            }}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        >

                            <Plus size={16}/>
                            Proje Ekle

                        </button>


                    </div>


                ))
            }


            </div>


        </div>


        <EditAllocationModal

            open={!!editProject}

            projectName={
                editProject?.name ?? ""
            }

            current={
                editProject?.current ?? 0
            }

            max={
                editProject?.max ?? 0
            }

            loading={
                updateMutation.isPending
            }

            onClose={() =>
                setEditProject(null)
            }

            onSave={async(value)=>{

                if(!editProject){
                    return;
                }


                await updateMutation.mutateAsync({

                    id:
                        editProject.id,

                    percentage:
                        value,

                });


                setEditProject(null);

            }}

        />



        <AddProjectModal

            open={addProjectOpen}

            employee={
                data?.employees.find(
                    x=>x.id===selectedEmployeeId
                )
            }

            projects={
                data?.projects ?? []
            }

            loading={
                createMutation.isPending
            }

            onClose={() => {
                setAddProjectOpen(false);
                setSelectedEmployeeId(undefined);
            }}

            onSave={async(payload)=>{

                await createMutation.mutateAsync(
                    payload
                );


                setAddProjectOpen(false);

            }}

        />

        <DeleteConfirmModal

            open={!!deleteProject}

            projectName={
                deleteProject?.name ?? ""
            }

            loading={
                deleteMutation.isPending
            }

            onClose={() =>
                setDeleteProject(null)
            }

            onConfirm={() => {

                if(!deleteProject){
                    return;
                }


                handleDelete(
                    deleteProject.id
                );

            }}

        />

        <EditEmployeeModal

            open={
                !!editEmployee
            }

            employee={
                editEmployee
            }

            loading={
                updateEmployeeMutation.isPending
            }

            onClose={() =>
                setEditEmployee(null)
            }

            onSave={(payload)=>{

                updateEmployeeMutation.mutate(
                    payload,
                    {
                        onSuccess:()=>{

                            setEditEmployee(null);

                        }
                    }
                );

            }}

        />



        <DeleteEmployeeConfirmModal

            open={
                !!deleteEmployee
            }

            employeeName={
                deleteEmployee?.name ?? ""
            }

            loading={
                deleteEmployeeMutation.isPending
            }

            onClose={() =>
                setDeleteEmployee(null)
            }

            onConfirm={()=>{

                if(!deleteEmployee){
                    return;
                }


                deleteEmployeeMutation.mutate(
                    deleteEmployee.id,
                    {
                        onSuccess:()=>{

                            setDeleteEmployee(null);

                        }
                    }
                );

            }}

        />


        </>

    );

}
































































