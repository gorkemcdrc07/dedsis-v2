import type { FastifyInstance } from "fastify";
import { requireUser } from "../../common/auth.js";
import {
    getEmployeeProjects,
    createEmployeeProject,
    updateEmployeeProject,
    deleteEmployeeProject,
    getEmployeeProjectHistory,
    updateEmployee,
    deleteEmployee,
    activateEmployee,
    permanentlyDeleteEmployee
} from "./service.js";


export async function employeeProjectsRoutes(
    app: FastifyInstance
){

    app.get(
        "/",
        async(request)=>{

            await requireUser(request);

            const data =
                await getEmployeeProjects();

            return {
                success:true,
                data
            };

        }
    );




    app.get(
        "/history/:employeeId",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    employeeId:string;
                };


            const data =
                await getEmployeeProjectHistory(
                    Number(params.employeeId)
                );


            return {
                success:true,
                data
            };

        }
    );

    app.post(
        "/",
        async(request)=>{

            await requireUser(request);

            const body =
                request.body as {
                    employeeId:number;
                    projectId:number;
                    percentage:number;
                };


            try {

                const data =
                    await createEmployeeProject(
                        body.employeeId,
                        body.projectId,
                        body.percentage
                    );


                return {
                    success:true,
                    data
                };

            }
            catch(error){

                return {
                    success:false,
                    error:{
                        code:"BAD_REQUEST",
                        message:
                            error instanceof Error
                            ? error.message
                            : "İşlem başarısız"
                    }
                };

            }

        }
    );



    app.patch(
        "/:id",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            const body =
                request.body as {
                    percentage:number;
                };


            try {

                const data =
                    await updateEmployeeProject(
                        Number(params.id),
                        body.percentage
                    );


                return {
                    success:true,
                    data
                };

            }
            catch(error){

                return {
                    success:false,
                    error:{
                        code:"BAD_REQUEST",
                        message:
                            error instanceof Error
                            ? error.message
                            : "İşlem başarısız"
                    }
                };

            }

        }
    );





    app.delete(
        "/employees/:id",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            try {

                const data =
                    await deleteEmployee(
                        Number(params.id)
                    );


                return {
                    success:true,
                    data
                };

            }
            catch(error){

                return {
                    success:false,
                    error:{
                        code:"BAD_REQUEST",
                        message:
                            error instanceof Error
                            ? error.message
                            : "İşlem başarısız"
                    }
                };

            }

        }
    );
    app.delete(
        "/:id",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            try {

                const data =
                    await deleteEmployeeProject(
                        Number(params.id)
                    );


                return {
                    success:true,
                    data
                };

            }
            catch(error){

                return {
                    success:false,
                    error:{
                        code:"BAD_REQUEST",
                        message:
                            error instanceof Error
                            ? error.message
                            : "İşlem başarısız"
                    }
                };

            }

        }
    );


    app.patch(
        "/employees/:id/activate",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            try {

                const data =
                    await activateEmployee(
                        Number(params.id)
                    );


                return {
                    success:true,
                    data
                };

            }
            catch(error){

                return {
                    success:false,
                    error:{
                        code:"BAD_REQUEST",
                        message:
                            error instanceof Error
                            ? error.message
                            : "İşlem başarısız"
                    }
                };

            }

        }
    );


    app.delete(
        "/employees/:id/permanent",
        async(request)=>{

            await requireUser(request);


            const params =
                request.params as {
                    id:string;
                };


            const data =
                await permanentlyDeleteEmployee(
                    Number(params.id)
                );


            return {
                success:true,
                data
            };

        }
    );

}
