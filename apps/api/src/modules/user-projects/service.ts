import { supabaseAdmin } from "../supabase/client.js";

export async function getUserProjects() {
    const [
        profilesResult,
        projectsResult,
        distributionsResult,
    ] = await Promise.all([
        supabaseAdmin
            .from("v2_profiles")
            .select(
                "id,email,full_name,is_active",
            )
            .order("full_name"),

        supabaseAdmin
            .from("v2_projects")
            .select(
                "id,name,is_active",
            )
            .order("name"),

        supabaseAdmin
            .from("v2_user_project_distributions")
            .select(
                `
                id,
                user_id,
                project_id,
                percentage,
                v2_projects (
                    id,
                    name
                )
                `,
            ),
    ]);

    if (profilesResult.error) {
        throw new Error(
            profilesResult.error.message,
        );
    }

    if (projectsResult.error) {
        throw new Error(
            projectsResult.error.message,
        );
    }

    if (distributionsResult.error) {
        throw new Error(
            distributionsResult.error.message,
        );
    }

type DistributionRow = {
    id: number;
    user_id: string;
    project_id: number;
    percentage: number | string;
    v2_projects:
        | {
              id: number;
              name: string;
          }
        | null;
};

const distributions =
    (distributionsResult.data ??
        []) as unknown as DistributionRow[];

    const users =
        (profilesResult.data ?? []).map((user) => ({
            id: user.id,
            name:
                user.full_name ??
                user.email ??
                "-",

            projects:
                distributions
                    .filter(
                        (x) =>
                            x.user_id === user.id,
                    )
                    .map((x) => ({
                        distributionId: x.id,
                        projectId:
                            x.project_id,
                        project:
                            x.v2_projects
                                ?.name ?? "-",
                        percentage:
                            Number(
                                x.percentage,
                            ),
                    })),
        }));

    return {
        users,
        projects:
            projectsResult.data ?? [],
    };
}