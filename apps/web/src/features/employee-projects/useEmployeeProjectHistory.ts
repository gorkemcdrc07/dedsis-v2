import { useEffect, useState } from "react";

import {
    getEmployeeProjectHistory,
} from "./employee-projects.api";

import type {
    EmployeeProjectHistoryItem,
} from "./types";



export function useEmployeeProjectHistory(
    employeeId:number
){

    const [data,setData] =
        useState<EmployeeProjectHistoryItem[]>([]);


    const [loading,setLoading] =
        useState(true);



    useEffect(()=>{

        if(!employeeId){
            return;
        }


        getEmployeeProjectHistory(
            employeeId
        )
        .then((result:any)=>{

            setData(
                result.data ?? result
            );

        })
        .finally(()=>{

            setLoading(false);

        });


    },[
        employeeId
    ]);



    return {
        data,
        loading,
    };

}

