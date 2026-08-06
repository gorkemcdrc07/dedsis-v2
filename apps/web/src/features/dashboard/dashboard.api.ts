import type {
    DashboardProjectDetailResponse,
    DashboardQuery,
    DashboardResponse,
} from "@dedsis/contracts";
import { api } from "../../lib/api";

type SyncDashboardInput = {
    startDate: string;
    endDate: string;
};

type SyncDashboardResponse = {
    jobId: string;
    status: string;
};

export type SyncJobResponse = {
    id: string;
    status: "pending" | "running" | "completed" | "failed";
    startedAt: string;
    completedAt?: string;
    error?: string;
};

export async function getDashboard(
    query: DashboardQuery,
): Promise<DashboardResponse> {
    return api<DashboardResponse>(
        "/api/v1/dashboard",
        {
            method: "POST",
            body: JSON.stringify({
                startDate: query.startDate,
                endDate: query.endDate,
            }),
        },
    );
}

export async function getDashboardProjectDetail(
    projectId: string,
    query: DashboardQuery,
): Promise<DashboardProjectDetailResponse> {
    const params = new URLSearchParams({
        startDate: query.startDate
            .toISOString()
            .slice(0, 10),
        endDate: query.endDate
            .toISOString()
            .slice(0, 10),
    });

    return api<DashboardProjectDetailResponse>(
        `/api/v1/dashboard/projects/${encodeURIComponent(
            projectId,
        )}?${params.toString()}`,
    );
}
export async function syncDashboard(
    query: SyncDashboardInput,
): Promise<{ jobId: string }> {
    const response =
        await api<SyncDashboardResponse>(
            "/api/v1/legacy-sync",
            {
                method: "POST",
                body: JSON.stringify({
                    startDate: query.startDate,
                    endDate: query.endDate,
                }),
            },
        );

    return {
        jobId: response.jobId,
    };
}

export async function getSyncJob(
    jobId: string,
): Promise<SyncJobResponse> {
    return api<SyncJobResponse>(
        `/api/v1/legacy-sync/${jobId}`,
    );
}

export type DashboardSourceSummary = {

    ik:{
        personelSayisi:number;
        toplamMaliyet:number;
        dagitilan:number;
        bekleyen:number;
    };

    muhasebe:{
        toplamGider:number;
        bekleyen:number;
    };

};


export async function getDashboardSourceSummary()
: Promise<DashboardSourceSummary> {

    return api<DashboardSourceSummary>(
        "/api/v1/dashboard/source-summary",
    );

}


export type DashboardProjectSourceDetail = {

    ik: {
        personel: string;
        oran: number;
        tutar: number;
    }[];

    muhasebe: any[];


    reel: {

        gelir: {

            satis: number;

            alis: number;

        };


        gider: {

            hizmet: number;

            masraf: number;

        };


        hizmetDetay: {

            isim: string;
            satis: number;
            alis: number;
            hizmet: number;
            masraf: number;
            kar: number;

        }[];


        toplamGelir: number;

        toplamGider: number;

        kar: number;

    };


    toplamlar: {

        ik: number;

        muhasebe: number;

        toplam: number;

    };

};

export async function getDashboardProjectSourceDetail(
    projectId: string,
    startDate: string,
    endDate: string,
): Promise<DashboardProjectSourceDetail> {

    const params =
        new URLSearchParams({
            startDate,
            endDate
        });


    return api<DashboardProjectSourceDetail>(
        `/api/v1/dashboard/projects/${projectId}/source-detail?${params.toString()}`
    );

}
