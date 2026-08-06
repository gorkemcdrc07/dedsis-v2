export type BasbugDeliveryStatus =
    | "Yolda"
    | "Teslim Noktasında"
    | "Beklemede"
    | "Teslim Edildi"
    | "İade Alındı"
    | string;


export type BasbugDelivery = {

    id:number;

    yukleme_tarihi:string | null;

    yukleme_yeri:string | null;

    planlanan_yukleme_saati:string | null;

    plaka:string | null;

    surucu_adi_soyadi:string | null;

    iletisim:string | null;

    ugrma_yeri_1:string | null;

    ugrma_yeri_2:string | null;

    varis_noktasi:string | null;

    planlanan_teslim_tarihi:string | null;

    planlanan_teslim_saati:string | null;

    seyir_durumu:BasbugDeliveryStatus;

    gerceklesen_teslim_tarihi:string | null;

    gerceklesen_teslim_saati:string | null;

    history?: BasbugDeliveryHistory[];

};


export type BasbugSummary = {

    total:number;

    onRoad:number;

    delivered:number;

    waiting:number;

};
export type CreateBasbugDeliveryPayload = {

    yukleme_tarihi?:string;

    yukleme_yeri?:string;

    planlanan_yukleme_saati?:string;

    plaka?:string;

    surucu_adi_soyadi?:string;

    iletisim?:string;

    ugrma_yeri_1?:string;

    ugrma_yeri_2?:string;

    varis_noktasi?:string;

    planlanan_teslim_tarihi?:string;

    planlanan_teslim_saati?:string;

    seyir_durumu?:string;

};





export type BasbugDeliveryHistory = {

    id:number;

    eski_durum:string | null;

    yeni_durum:string;

    created_at:string;

    kullanici:string | null;

};




