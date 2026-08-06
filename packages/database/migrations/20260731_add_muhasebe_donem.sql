alter table muhasebe_kayitlari
add column if not exists donem_ay integer;

alter table muhasebe_kayitlari
add column if not exists donem_yil integer;
