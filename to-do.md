# Kế hoạch chuyển đổi “Happy-Birthday-Website” sang Next.js + Supabase (TypeScript)

> Thư mục mã cũ được lưu tại `old/`. Thư mục root đã scaffold Next.js (App Router, TypeScript, Tailwind). Checklist này chia bước nhỏ để di chuyển dần, bảo toàn tính năng.

## 0. Cấu trúc đích (tham chiếu)
```
src/
  app/
    layout.tsx
    page.tsx               // Countdown mặc định
    (api)/                 // Route API nhẹ nếu cần
  components/              // UI tái sử dụng (Button, Modal…)
  features/
    countdown/
    cake3d/
    album/
    games/
    community/
    theme/
  three/                   // mô hình / helpers three.js
  styles/                  // Tailwind layer, custom CSS
lib/
  supabaseClient.ts
public/
  media/                   // ảnh + video kỷ niệm fallback
  audio/                   // mp3 happy-birthday
old/                       // code cũ (giữ để tham chiếu)
```

## 1. Chuẩn bị môi trường
- [ ] `npm i @supabase/supabase-js @react-three/fiber @react-three/drei swiper zustand`  
- [ ] Thêm file `lib/supabaseClient.ts` (singleton)  
- [ ] Tạo file `.env.local` với `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- [ ] Cài đặt `supabase CLI` (tuỳ chọn) để sinh types.

## 2. Thiết kế DB & Storage (Supabase)
- [ ] Thực thi schema SQL:
  - `birthdays(id, name, dob, message, created_by)`
  - `messages(id, sender_id, birthday_id, text, created_at)`
  - `media(id, type, path, tags, owner_id)`
  - `audio_messages(id, sender_id, birthday_id, audio_url, created_at)`
  - `video_messages(id, sender_id, birthday_id, video_url, created_at)`
  - `gifts(id, sender_id, birthday_id, emoji, created_at)`
- [ ] Buckets: `media`, `audio`, `video`  
- [ ] Thiết lập RLS (public read, owner write).

## 3. Di chuyển tài sản tĩnh
| Mục cũ | Vị trí mới |
|--------|------------|
| `old/happy-birthday.mp3` | `public/audio/happy-birthday.mp3` |
| Ảnh trong `old/memory/**/*` | `public/media/…` (hoặc upload Supabase) |
| Video trong `old/video/**/*` | `public/media/…` hoặc Supabase Storage |

## 4. Chuyển CSS & theme
1. **Base styles** (`old/css/base.css`, `components.css`) ➜ convert sang Tailwind layer (`src/styles/globals.css`).  
2. **Theme mùa – lễ** (`old/css/themes.css`) ➜ tạo hook `useSeasonTheme()` + class tương ứng.  
3. **Responsive / mobile.css** ➜ Tailwind breakpoint.
4. Giữ hiệu ứng đặc biệt (lá rơi, tuyết…) dùng React component + CSS module.

## 5. Module hóa JavaScript ➜ React/TS
| Tệp JS cũ | Module mới (TS/React) | Ghi chú |
|-----------|----------------------|---------|
| `old/js/core.js` | `features/countdown`, `features/cake3d` | countdown logic, Three.js cake |
| `old/js/features.js` | `features/album`, `features/games/*`, `features/social-share` | tách nhỏ theo trách nhiệm |
| `old/js/community.js` | `features/community` | chat realtime + message recorder |
| `old/js/themes.js` | `features/theme` | i18n + seasonal effects |
| (social share logic in `features.js`) | `features/social-share` | share Facebook/Zalo/URL copy |
| (e-card generator in `features.js`) | `features/e-card` | render canvas → image |
| (invite friends modal) | `features/invite` | generate share link, QR |
| (music player) | `features/audio-player` | play/pause happy-birthday + playlist |
| (bulletin board) | `features/bulletin` | CRUD text posts via Supabase |

Thứ tự di chuyển đề xuất:
1. **Countdown + 3D Cake**  
   - Component `CountdownPage` đọc ngày sinh DB.  
   - Component `Cake3D` dùng `@react-three/fiber`.
2. **Album ảnh**  
   - Grid view + Swiper slideshow, tải ảnh từ Supabase Storage.
3. **Community chat**  
   - Zustand store + Supabase Realtime channels.
4. **Games**  
   - Code split (`next/dynamic`) để giảm bundle.
5. **Theme/i18n**
6. **Social share & e-card**
7. **Invite friends & bulletin board**  
   - Context + `next-intl`.

## 6. API Routes (nếu cần)
- [ ] `/api/upload` proxy lên Supabase Storage (tránh expose key service role)
- [ ] `/api/generate-invite` tạo link chia sẻ ngắn

## 7. Kiểm thử & CI
- [ ] Viết test đầu tiên với `vitest` + `@testing-library/react` cho Countdown.  
- [ ] GitHub Actions: `lint`, `test`, `build`.

## 8. Dọn dẹp
- [ ] Sau khi port xong module, cập nhật README; chuyển code gốc vào `archive/` hoặc xoá.

---
### Tiến độ
- [ ] Môi trường & SupabaseClient
- [ ] Port Countdown & Cake3D
- [ ] Port Album
- [ ] Port Community Chat
- [ ] Port Games
- [ ] Theme & i18n
- [ ] Testing + CI/CD
- [ ] Cleanup legacy code
