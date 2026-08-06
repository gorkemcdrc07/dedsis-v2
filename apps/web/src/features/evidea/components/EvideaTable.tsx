import { DeliveryOperationsTable } from "../../../components/deliveries/DeliveryOperationsTable";
import type { EvideaDelivery } from "../types";
import { EvideaStatusBadge } from "./EvideaStatusBadge";
type Props={deliveries:EvideaDelivery[];onDetail:(delivery:EvideaDelivery)=>void;onStatusChange:(id:number,status:string)=>void};
export function EvideaTable({deliveries,onDetail}:Props){return <DeliveryOperationsTable deliveries={deliveries} onDetail={onDetail} accent="blue" renderStatus={(status)=><EvideaStatusBadge status={status}/>}/>}
