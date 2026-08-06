export type IKDagitim = {

    id:number;

    project_id:number;

    oran:number;

    tutar:number;

};


export type IKRow = {

    id:string;

    personelAdi:string;

    sicilNo:string|null;

    departman:string|null;


    donemAy:number;

    donemYil:number;


    brutUcret:number;

    isverenMaliyeti:number;


    kullaniciId:string|null;

    projeId:string|null;


    sonYetkilendirmeDegisikligi?:
        string|null;


    dagitimGuncel?:
        boolean;


    dagitimDurumu:
        "bekliyor"
        |
        "dagitildi";


    dagitimlar:
        IKDagitim[];


    selected:boolean;

};



