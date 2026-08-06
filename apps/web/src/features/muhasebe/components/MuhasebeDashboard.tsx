import {
    MuhasebeKpiGrid
} from "./MuhasebeKpiGrid";


import {
    MuhasebeDistributionSummary
} from "./MuhasebeDistributionSummary";


import {
    MuhasebeProjectSummary
} from "./MuhasebeProjectSummary";


import {
    MuhasebeImportHistory
} from "./MuhasebeImportHistory";



type Props = {

    stats:any;

    pending:number;

    distributed:number;

    dashboard:any;

    imports:any[];

};





export function MuhasebeDashboard({

    stats,

    pending,

    distributed,

    dashboard,

    imports

}:Props){



return (

<div
className="
space-y-6
"
>


<MuhasebeKpiGrid

    stats={stats}

/>


<MuhasebeProjectSummary

    projects={
        dashboard?.projects ?? []
    }

/>



<MuhasebeDistributionSummary

    pending={pending}

    distributed={distributed}

    total={
        pending + distributed
    }

/>



</div>

);

}








