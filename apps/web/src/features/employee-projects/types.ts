export type EmployeeProject = {
    id: number;
    projectId: number;
    project: string;
    percentage: number;
};


export type EmployeeProjectEmployee = {
    id: number;
    name: string;
    username: string;
    is_active: boolean;
    totalPercentage: number;
    status: "ok" | "under" | string;
    projects: EmployeeProject[];
};


export type EmployeeProjectMaster = {
    id: number;
    code: string;
    name: string;
    display_name: string;
    is_active?: boolean;
};


export type EmployeeProjectsResponse = {
    employees: EmployeeProjectEmployee[];
    projects: EmployeeProjectMaster[];
};

export type EmployeeProjectHistoryItem = {
    id:number;

    old_percentage:number;

    new_percentage:number | null;

    created_at:string;

    projects:{
        display_name:string | null;
    } | null;
};





