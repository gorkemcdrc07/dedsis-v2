import { useQuery } from "@tanstack/react-query";

import {
    getEmployeeProjects,
} from "./employee-projects.api";



export function useEmployeeProjects() {

    const query =
        useQuery({

            queryKey:[
                "employee-projects"
            ],

            queryFn:
                getEmployeeProjects,

        });


    return {

        data:
            query.data ?? null,

        loading:
            query.isLoading,

        error:
            query.error instanceof Error
            ?
            query.error.message
            :
            null,

    };

}
