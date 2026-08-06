import { DeliveryStats } from "../../../components/deliveries/DeliveryStats";
type Props={total:number;waiting:number;moving:number;completed:number};
export function BasbugStats(props:Props){return <DeliveryStats {...props} accent="orange"/>}
