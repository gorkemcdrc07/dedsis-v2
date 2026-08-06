import { api } from "../../lib/api";
import type {
    EmployeeProjectsResponse,
} from "./types";


export function getEmployeeProjects() {
    return api<EmployeeProjectsResponse>(
        "/api/v1/employee-projects",
        {
            method: "GET",
        },
    );
}



export function createEmployeeProject(
    payload:{
        employeeId:number;
        projectId:number;
        percentage:number;
    }
){
    return api(
        "/api/v1/employee-projects",
        {
            method:"POST",
            body:JSON.stringify(payload),
        },
    );
}



export function updateEmployeeProject(
    id:number,
    payload:{
        percentage:number;
    }
){
    return api(
        `/api/v1/employee-projects/${id}`,
        {
            method:"PATCH",
            body:JSON.stringify(payload),
        },
    );
}



export function deleteEmployeeProject(
    id:number
){
    return api(
        `/api/v1/employee-projects/${id}`,
        {
            method:"DELETE",
            body: JSON.stringify({}),
        },
    );
}


export function getEmployeeProjectHistory(
    employeeId:number
){

    return api(
        `/api/v1/employee-projects/history/${employeeId}`,
        {
            method:"GET",
        },
    );

}



export function updateEmployee(
    id:number,
    payload:{
        full_name:string;
        username:string;
        is_active:boolean;
    }
){

    return api(
        `/api/v1/employee-projects/employees/${id}`,
        {
            method:"PUT",
            body:JSON.stringify(payload),
        },
    );

}



export function deleteEmployee(
    id:number
){

    return api(
        `/api/v1/employee-projects/employees/${id}`,
        {
            method:"DELETE",
            body: JSON.stringify({}),
        },
    );

}




export function activateEmployee(
    id:number
){

    return api(
        `/api/v1/employee-projects/employees/${id}/activate`,
        {
            method:"PATCH",
            body: JSON.stringify({}),
        },
    );

}




export function permanentlyDeleteEmployee(
    id:number
){

    return api(
        `/api/v1/employee-projects/employees/${id}/permanent`,
        {
            method:"DELETE",
            body: JSON.stringify({}),
        },
    );

}

