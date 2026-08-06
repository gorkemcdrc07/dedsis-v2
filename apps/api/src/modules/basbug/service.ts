import { supabaseAdmin } from "../supabase/client.js";


const MUSTERI_ADI = "Başbuğ";


export async function getBasbugDeliveries(
    date?:string
){

    let query =
        supabaseAdmin
        .from("musteri_teslimat_kayitlari")
        .select("*")
        .eq(
            "musteri_adi",
            MUSTERI_ADI
        )
        .order(
            "id",
            {
                ascending:true
            }
        );


    if(date){

        const start =
            `${date}T00:00:00`;

        const end =
            `${date}T23:59:59.999`;


        query =
            query
            .gte(
                "created_at",
                start
            )
            .lte(
                "created_at",
                end
            );

    }


    const {
        data,
        error,
    } = await query;


    if(error){

        throw new Error(
            error.message
        );

    }


    return data ?? [];

}



export async function createBasbugDeliveries(
    payload:any[]
){

    const {
        data,
        error,
    } =
        await supabaseAdmin
        .from(
            "musteri_teslimat_kayitlari"
        )
        .insert(
            payload.map(item=>({
                ...item,
                musteri_adi:MUSTERI_ADI,
            }))
        )
        .select();


    if(error){

        throw new Error(
            error.message
        );

    }


    return data ?? [];

}


export async function updateBasbugDelivery(
    id:number,
    payload:any
){

    const {
        data:oldData,
        error:oldError
    } =
        await supabaseAdmin
        .from(
            "musteri_teslimat_kayitlari"
        )
        .select(
            "seyir_durumu"
        )
        .eq(
            "id",
            id
        )
        .single();


    if(oldError){

        throw new Error(
            oldError.message
        );

    }



    const {
        data,
        error
    } =
        await supabaseAdmin
        .from(
            "musteri_teslimat_kayitlari"
        )
        .update(payload)
        .eq(
            "id",
            id
        )
        .select()
        .single();



    if(error){

        throw new Error(
            error.message
        );

    }



    if(
        payload.seyir_durumu &&
        payload.seyir_durumu !== oldData.seyir_durumu
    ){

        const {
            error:historyError
        } =
            await supabaseAdmin
            .from(
                "basbug_delivery_history"
            )
            .insert({

                delivery_id:id,

                eski_durum:
                    oldData.seyir_durumu,

                yeni_durum:
                    payload.seyir_durumu,

                kullanici:
                    "system"

            });


        if(historyError){

            throw new Error(
                historyError.message
            );

        }

    }



    return data;

}


export async function getBasbugDeliveryHistory(
    id:number
){

    const {
        data,
        error
    } =
        await supabaseAdmin
        .from(
            "basbug_delivery_history"
        )
        .select("*")
        .eq(
            "delivery_id",
            id
        )
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





