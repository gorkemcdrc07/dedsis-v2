# DEDSİS V2

Mevcut DEDSİS işlevlerini daha güvenli, hızlı ve sürdürülebilir mimariye taşımak için oluşturulmuş başlangıç projesidir.

## Teknoloji
- Web: React 19 + Vite + TypeScript + React Router + TanStack Query
- API: Fastify + TypeScript + Zod
- Veri/Auth: mevcut Supabase PostgreSQL + Supabase Auth + RLS
- Monorepo: pnpm workspaces

## Çalıştırma
1. `.env.example` dosyasını `.env` olarak kopyalayın ve gerçek değerleri girin.
2. `pnpm install`
3. `pnpm dev`
4. Web: `http://localhost:5173`, API: `http://localhost:4000/api/v1/health`

## Önemli
Eski `.env` dosyasındaki anahtarları bu projeye kopyalamadan önce döndürün. Eski ZIP içerisinde sırlar bulunduğu için özellikle harici API tokenı ve varsa service-role anahtarı yenilenmelidir.

Bu paket güvenli temel, auth akışı, harici veri adapteri, route yapısı ve tüm mevcut ekranların modül iskeletini içerir. Ekranların iş kuralları mevcut kaynak koddan sırayla taşınacaktır.
