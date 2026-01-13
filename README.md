# Ocean Dream Travel CMS (Realtime) — Vercel + Supabase

## 1) Tạo Supabase project
- Vào Supabase → New project
- Lấy 2 biến môi trường:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Tạo bảng + RLS
Chạy SQL trong Supabase SQL Editor: `supabase/schema.sql`

## 3) Tạo admin user
- Supabase Auth → Users → Add user (email + password)
- Sau đó insert role admin vào bảng profiles:
  ```sql
  insert into public.profiles (id, role)
  values ('<USER_UUID>', 'admin')
  on conflict (id) do update set role = 'admin';
  ```

## 4) Chạy local
```bash
npm install
cp .env.example .env.local
# điền url + anon key
npm run dev
```
Mở:
- Public: http://localhost:3000
- Admin:  http://localhost:3000/admin

## 5) Deploy lên Vercel
- Push repo lên GitHub
- Vercel → Import repo
- Add Environment Variables giống `.env.local`
- Deploy

## Realtime
Trang chủ & tours đang subscribe `postgres_changes` từ Supabase.
Admin bấm Lưu → khách thấy cập nhật ngay (không cần build/deploy).
