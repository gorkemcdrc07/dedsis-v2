import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
    createEmployeeProject,
    updateEmployeeProject,
    deleteEmployeeProject,
    activateEmployee,
    permanentlyDeleteEmployee,
    updateEmployee,
    deleteEmployee,
} from "./employee-projects.api";



const employeeProjectsKey = [
    "employee-projects"
];



export function useCreateEmployeeProject() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn: (payload:{
            employeeId:number;
            projectId:number;
            percentage:number;
        }) =>
            createEmployeeProject(payload),


        onSuccess:()=>{

            toast.success(
                "Proje başarıyla eklendi"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Proje eklenirken hata oluştu"
            );

        },

    });

}



export function useUpdateEmployeeProject() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn: (params:{
            id:number;
            percentage:number;
        }) =>
            updateEmployeeProject(
                params.id,
                {
                    percentage:
                        params.percentage,
                }
            ),


        onSuccess:()=>{

            toast.success(
                "Dağılım güncellendi"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Güncelleme sırasında hata oluştu"
            );

        },

    });

}



export function useDeleteEmployeeProject() {

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn: (id:number) =>
            deleteEmployeeProject(id),


        onSuccess:()=>{

            toast.success(
                "Proje silindi"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Silme sırasında hata oluştu"
            );

        },

    });

}


export function useUpdateEmployee(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:(params:{
            id:number;
            full_name:string;
            username:string;
            is_active:boolean;
        }) =>
            updateEmployee(
                params.id,
                {
                    full_name:
                        params.full_name,

                    username:
                        params.username,

                    is_active:
                        params.is_active,
                }
            ),


        onSuccess:()=>{

            toast.success(
                "Kullanıcı güncellendi"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Kullanıcı güncellenirken hata oluştu"
            );

        },

    });

}



export function useDeleteEmployee(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:(id:number)=>
            deleteEmployee(id),


        onSuccess:()=>{

            toast.success(
                "Kullanıcı pasife alındı"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Kullanıcı silinirken hata oluştu"
            );

        },

    });

}




export function useActivateEmployee(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:(id:number)=>
            activateEmployee(id),


        onSuccess:()=>{

            toast.success(
                "Kullanıcı aktif edildi"
            );


            queryClient.invalidateQueries({
                queryKey: employeeProjectsKey,
            });

        },


        onError:(error)=>{

            toast.error(
                error instanceof Error
                ? error.message
                : "Aktifleştirme başarısız"
            );

        },

    });

}




export function usePermanentDeleteEmployee(){

    const queryClient =
        useQueryClient();


    return useMutation({

        mutationFn:(id:number)=>
            permanentlyDeleteEmployee(id),


        onSuccess:()=>{

            toast.success(
                "Kullanıcı tamamen silindi"
            );


            queryClient.invalidateQueries({
                queryKey:[
                    "employee-projects"
                ],
            });

        },

    });

}

