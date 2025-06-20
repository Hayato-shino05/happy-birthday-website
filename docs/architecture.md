# Kiến trúc hệ thống Happy-Birthday-Website (Next.js + Supabase)

```
┌──────────────┐      HTTP / WS       ┌────────────┐
│   Browser    │  ─────────────────▶ │  Next.js   │
│  (React TS)  │  ◀───────────────── │  API Route │
└──────────────┘                     └────────────┘
      ▲  ▲                                   │
      │  │Re-render via SWR/Realtime         │Supabase JS SDK
      │  └───────────────────────────────────┼──────────────┐
      │                                      ▼              ▼
┌──────────────┐       Realtime WS     ┌──────────┐   ┌─────────────┐
│ React Three  │  ◀──────────────────▶ │ Supabase │   │  Storage    │
│  Fiber Canvas│                       │ Postgres │   │  Buckets    │
└──────────────┘                       └──────────┘   └─────────────┘
```

* **Next.js (App Router)**: SSR/ISR, API routes cho thao tác nhẹ (upload proxy). Component phân thành feature module.
* **Supabase**: Postgres + Realtime channel cho chat, Storage buckets cho media.
* **React-Three-Fiber**: render bánh kem 3D, hiệu ứng confetti.
* **Zustand**: global store state (user session, chat messages).
* **SWR / useQuery**: fetch dữ liệu với cache & revalidation.

## Luồng chính
1. Người dùng truy cập `/` → `CountdownPage` check ngày sinh từ `birthdays`.
2. Nếu hôm nay sinh nhật ⇒ render `Cake3D`, phát nhạc, bật confetti.
3. Chat component subscribe channel `chat:birthday-{id}` để nhận tin nhắn realtime.
4. Album tải list `media` từ Storage, lazy load ảnh.
5. Game modules được dynamic import khi người chơi mở.

## Mã nguồn
```
src/
  features/
    countdown/      logic đếm ngược
    cake3d/         Three.js model & controls
    album/          gallery Swiper + upload
    community/      chat realtime + recorder
    games/          memory / puzzle / quiz
    theme/          hook & context thay đổi chủ đề
components/          UI library (Modal, Button…)
lib/
  supabaseClient.ts – khởi tạo SDK
```

---

## Tính năng bảo mật
* RLS trên mọi bảng, bucket Storage chỉ cho owner ghi.
* Auth Supabase (email OTP) tích hợp useUser hook.

## Hiệu năng & SEO
* Next.js ISR cho trang chia sẻ sinh nhật công khai.
* Lazy load Three.js & game chunk, split bằng dynamic import.
* Tailwind JIT + purge cho CSS tối thiểu.

## CI/CD
* GitHub Actions chạy lint, test, build.
* Deploy Vercel (frontend) + Supabase (backend).
