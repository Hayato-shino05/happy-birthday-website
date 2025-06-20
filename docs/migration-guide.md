# Migration Guide – Porting Legacy Code to Next.js (WIP)

This document logs the status of porting each feature/file from the legacy `old/` directory to the new TypeScript + Next.js codebase.

> Xem checklist tổng quát trong `to-do.md`. Bảng dưới cho biết commit đã thực hiện và ghi chú chi tiết.

| Legacy Path | New Module | Status | Commit | Notes |
|-------------|-----------|--------|--------|-------|
| `old/js/core.js` | `src/features/countdown` | ⬜ |  | Extract countdown logic |
|               | `src/features/cake3d` | ⬜ |  | Three.js port with react-three-fiber |
| `old/js/features.js (album)` | `src/features/album` | ⬜ |  | Swiper gallery |
| `old/js/features.js (games)` | `src/features/games` | ⬜ |  | Lazy dynamic import |
| `old/js/community.js` | `src/features/community` | ⬜ |  | Realtime chat |
| `old/js/themes.js` | `src/features/theme` | ⬜ |  | Season & festival theme |
| CSS Base | `src/styles/globals.css` | ⬜ |  | Tailwind layer |
| Old assets (memory/*) | `public/media` or Supabase Storage | ⬜ |  | Batch upload script |

Legend: ⬜ = pending, 🟡 = in progress, ✅ = done.

## How to update this table
1. After completing a port, change Status to 🟡 or ✅.
2. Add commit SHA in **Commit** column.
3. Add extra notes if refactor differed.

---

## Timeline
- **Phase 1**: Countdown + Cake3D (week 1)
- **Phase 2**: Album & Chat (week 2)
- **Phase 3**: Games & Theme (week 3)
- **Phase 4**: Social, Invite, Bulletin (week 4)

Keep this document up to date for project transparency.
