export type MuhasebeRow = {

    id:string;

    tarih:any;

    tarihObj:Date|null;

    sira:string;

    yevmiyeNo:string;

    fisTipi:string;


    sorumlulukMerkeziKodu:string;

    sorumlulukMerkeziAdi:string;


    aciklama:string;


    hesapKodu:string;

    hesapAdi:string;


    borc:number;

    alacak:number;


    borcBakiye:number;

    alacakBakiye:number;


    selected:boolean;


    kullaniciId:string|null;

    projeId:string|null;

    atamaTipi:string;

    aktarimTipi:string;

};
