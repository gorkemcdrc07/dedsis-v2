import {
    MuhasebeKpiGrid
} from "./MuhasebeKpiGrid";


import {
    MuhasebeDistributionSummary
} from "./MuhasebeDistributionSummary";


import {
    MuhasebeImportHistory
} from "./MuhasebeImportHistory";



type Props = {

    stats:any;

    pending:number;

    distributed:number;

};





export function MuhasebeDashboard({

    stats,

    pending,

    distributed

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








