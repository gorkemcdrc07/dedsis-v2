import { DeliveryOperationsTable } from "../../../components/deliveries/DeliveryOperationsTable";
import type { BasbugDelivery } from "../types";
import { BasbugStatusBadge } from "./BasbugStatusBadge";
type Props={deliveries:BasbugDelivery[];onDetail:(delivery:BasbugDelivery)=>void;onStatusChange:(id:number,status:string)=>void};
export function BasbugTable({deliveries,onDetail}:Props){return <DeliveryOperationsTable deliveries={deliveries} onDetail={onDetail} accent="orange" renderStatus={(status)=><BasbugStatusBadge status={status}/>}/>}
