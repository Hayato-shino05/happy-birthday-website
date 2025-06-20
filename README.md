# Happy-Birthday-Website (Next.js + Supabase Rewrite)

[![CI](https://github.com/<username>/happy-birthday-website/actions/workflows/ci.yml/badge.svg)](https://github.com/<username>/happy-birthday-website/actions/workflows/ci.yml)

Interactive birthday celebration site với các tính năng: đồng hồ đếm ngược, bánh kem 3D (Three.js), album ảnh/video, trò chơi mini, chat cộng đồng, chia sẻ mạng xã hội, chủ đề theo mùa/lễ hội… Tất cả được viết lại trên **Next.js (TypeScript, App Router, Tailwind)** và **Supabase** nhằm mã nguồn mở, dễ bảo trì và mở rộng.

> Thư mục `old/` chứa phiên bản HTML/JS thuần. Tài liệu chi tiết các bước migrate nằm trong `to-do.md` và `docs/`.

## ✨ Tính năng mục tiêu
1. Countdown & Bánh kem 3D (thổi nến bằng micro)
2. Album kỷ niệm & slideshow
3. Trò chơi (memory, puzzle, quiz…)
4. Chat realtime, audio/video lời chúc
5. Hệ thống quà tặng & e-card
6. Theme mùa & lễ (Xuân, Hạ, Thu, Đông, Noel, Halloween…)
7. Social share & mời bạn bè

## ⚙️ Yêu cầu hệ thống
- Node >= 18
- PNPM/NPM/Bun tuỳ chọn (ví dụ dưới dùng npm)

## 🛠️ Thiết lập cục bộ nhanh
```bash
# cài package
npm install

# cấu hình biến môi trường
cp .env.example .env.local
# chỉnh NEXT_PUBLIC_SUPABASE_URL=...

# chạy dev
npm run dev
```

Mở http://localhost:3000 để xem.

## 📂 Cấu trúc chính
```
src/app     – App Router pages & layout
src/features – Mô-đun tính năng
src/components – UI tái sử dụng
lib/        – helper & supabaseClient
public/     – asset tĩnh (ảnh/mp3)
docs/       – tài liệu kiến trúc & migration
```

## 🧑‍💻 Phát triển


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
