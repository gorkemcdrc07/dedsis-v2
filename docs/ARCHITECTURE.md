# DEDSİS V2 Mimarisi

## İlkeler
- Tarayıcı Supabase tablolarına doğrudan yazmaz.
- Kimlik doğrulama Supabase Auth ile yapılır; sahte localStorage token kullanılmaz.
- Yetki kontrolleri backend ve RLS katmanında birlikte uygulanır.
- Harici API tokenları yalnızca backend ortam değişkenlerinde tutulur.
- Her modül route + service + repository sınırına ayrılır.
- Büyük ekranlar küçük feature bileşenlerine bölünür.

## Modüller
Ana Panel, Yönetim Paneli, Muhasebe Kârlılık, İnsan Kaynakları, Proje Operasyon, Kullanıcı Yetkileri, Evidea, Başbuğ.

## Geçiş
1. Güvenlik temeli ve auth.
2. Eski harici API adapteri.
3. Salt-okunur Ana Panel.
4. Yönetim/yetki ekranları.
5. Muhasebe ve İK yazma işlemleri.
6. Operasyon ve dosya depolama.
7. Müşteri ekranları.
8. Eski uygulamanın kapatılması.
