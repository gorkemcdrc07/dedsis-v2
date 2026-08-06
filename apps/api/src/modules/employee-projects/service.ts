import { supabaseAdmin } from "../supabase/client.js";


export async function getEmployeeProjects() {

    const [
        employeesResult,
        projectsResult,
        relationsResult,
    ] = await Promise.all([

        supabaseAdmin
            .from("v2_employees")
            .select(`
                id,
                full_name,
                username,
                is_active
            `)
            .order("full_name"),


        supabaseAdmin
            .from("v2_projects")
            .select(`
                id,
                code,
                name,
                display_name
            `)
            .order("display_name"),


        supabaseAdmin
            .from("v2_employee_projects")
            .select(`
                id,
                employee_id,
                project_id,
                percentage,

                v2_projects(
                    id,
                    display_name
                )
            `)

    ]);


    if (employeesResult.error)
        throw new Error(employeesResult.error.message);


    if (projectsResult.error)
        throw new Error(projectsResult.error.message);


    if (relationsResult.error)
        throw new Error(relationsResult.error.message);

type EmployeeProjectRow = {
    id: number;
    employee_id: string;
    project_id: number;
    percentage: number | string;
    v2_projects:
        | {
            id: number;
            display_name: string | null;
        }
        | null;
};

    const relations =
    (relationsResult.data ?? []) as unknown as EmployeeProjectRow[];


    const employees =
        (employeesResult.data ?? [])
        .map(employee => {


            const projects =
                relations
                .filter(
                    x =>
                    x.employee_id === employee.id
                )
                .map(x => ({
                    id:x.id,
                    projectId:x.project_id,
                    project:
                        x.v2_projects?.display_name
                        ?? "-",
                    percentage:
                        Number(x.percentage)
                }));


            const total =
                projects.reduce(
                    (sum,p)=>
                    sum + p.percentage,
                    0
                );


            return {

                id:employee.id,

                name:
                    employee.full_name,


                username:
                    employee.username,


                is_active:
                    employee.is_active,


                totalPercentage:
                    Number(total.toFixed(2)),


                status:
                    total === 100
                    ? "ok"
                    : total > 100
                    ? "over"
                    : "under",


                projects

            };

        });



    return {

        employees,

        projects:
            projectsResult.data ?? []

    };

}

export async function createEmployeeProject(
    employeeId:number,
    projectId:number,
    percentage:number,
    changedBy?:number
){

    const { data: existing } =
        await supabaseAdmin
        .from("v2_employee_projects")
        .select("percentage")
        .eq("employee_id", employeeId);


    const total =
        (existing ?? [])
        .reduce(
            (sum,row)=>
                sum + Number(row.percentage),
            0
        );


    if(total + percentage > 100){
        throw new Error(
            "Proje dağılım toplamı %100'ü geçemez"
        );
    }


    const {data,error} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .insert({
            employee_id: employeeId,
            project_id: projectId,
            percentage
        })
        .select()
        .single();


    if(error)
        throw new Error(error.message);


    await supabaseAdmin
    .from("v2_employee_project_history")
    .insert({
        employee_id: employeeId,
        project_id: projectId,
        old_percentage: null,
        new_percentage: percentage,
        changed_by: changedBy ?? null
    });


    return data;
}



export async function updateEmployeeProject(
    id:number,
    percentage:number,
    changedBy?:number
){

    const {data:current,error:findError} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .select(`
            id,
            employee_id,
            project_id,
            percentage
        `)
        .eq("id",id)
        .single();


    console.log("CURRENT PROJECT", current, findError);

    if(findError)
        throw new Error(findError.message);



    const {data:others} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .select("percentage")
        .eq(
            "employee_id",
            current.employee_id
        )
        .neq(
            "id",
            id
        );


    const total =
        (others ?? [])
        .reduce(
            (sum,row)=>
                sum + Number(row.percentage),
            0
        );


    if(total + percentage > 100){
        throw new Error(
            "Proje dağılım toplamı %100'ü geçemez"
        );
    }



    const {data,error} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .update({
            percentage
        })
        .eq("id",id)
        .select();



    if(error)
        throw new Error(error.message);



    const historyResult =
        await supabaseAdmin
        .from("v2_employee_project_history")
        .insert({
            employee_id: current.employee_id,
            project_id: current.project_id,
            old_percentage: Number(current.percentage),
            new_percentage: percentage,
            changed_by: changedBy ?? null
        });


    if(historyResult.error){
        throw new Error(
            "History kayıt hatası: " +
            historyResult.error.message
        );
    }


    return data;
}



export async function deleteEmployeeProject(
    id:number,
    changedBy?:number
){

    const {data:current,error:findError} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .select(`
            employee_id,
            project_id,
            percentage
        `)
        .eq("id",id)
        .single();


    console.log("CURRENT PROJECT", current, findError);

    if(findError)
        throw new Error(findError.message);



    const {error} =
        await supabaseAdmin
        .from("v2_employee_projects")
        .delete()
        .eq("id",id);


    if(error)
        throw new Error(error.message);



    await supabaseAdmin
    .from("v2_employee_project_history")
    .insert({
        employee_id: current.employee_id,
        project_id: current.project_id,
        old_percentage: Number(current.percentage),
        new_percentage: null,
        changed_by: changedBy ?? null
    });


    return {
        success:true
    };

}





export async function getEmployeeProjectHistory(
    employeeId:number
){

    const {data,error} =
        await supabaseAdmin
        .from("v2_employee_project_history")
        .select(`
            id,
            employee_id,
            project_id,
            old_percentage,
            new_percentage,
            changed_by,
            created_at,
            projects:project_id(
                display_name
            )
        `)
        .eq("employee_id", employeeId)
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){
        throw new Error(
            error.message
        );
    }


    return data ?? [];

}



export async function updateEmployee(
    id:number,
    payload:{
        full_name:string;
        username:string;
        is_active:boolean;
    }
){

    const {data,error} =
        await supabaseAdmin
        .from("v2_employees")
        .update(payload)
        .eq("id",id)
        .select()
        .single();


    if(error){
        throw new Error(
            error.message
        );
    }


    return data;

}



export async function deleteEmployee(
    id:number
){

    const {data,error} =
        await supabaseAdmin
        .from("v2_employees")
        .update({
            is_active:false
        })
        .eq("id",id)
        .select();


    if(error){
        throw new Error(
            error.message
        );
    }


    if(!data || data.length === 0){
        throw new Error(
            "Kullanıcı bulunamadı veya güncellenemedi"
        );
    }


    return data[0];

}





export async function activateEmployee(
    id:number
){

    const {data,error} =
        await supabaseAdmin
        .from("v2_employees")
        .update({
            is_active:true
        })
        .eq("id",id)
        .select()
        .single();


    if(error){
        throw new Error(
            error.message
        );
    }


    return data;

}







export async function permanentlyDeleteEmployee(
    id:number
){

    const {error} =
        await supabaseAdmin
        .from("v2_employees")
        .delete()
        .eq("id",id);


    if(error){
        throw new Error(
            error.message
        );
    }


    return {
        deleted:true
    };

}

