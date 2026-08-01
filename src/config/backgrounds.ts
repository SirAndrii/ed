/**
 * Background images for each theme
 * ─────────────────────────────────────────────────────────────────────────────
 * Add, remove, or replace entries freely.
 *
 * Each entry:
 *   url     – URL or local path.
 *             • For images in the `public/` folder use a root-relative path,
 *               e.g. "/backgrounds/anime1.jpg"  (Vite serves public/ at /)
 *             • For external URLs paste the full https:// link
 *   tile    – true  → small repeating pattern (backgroundSize: fixed px)
 *             false → full wallpaper (backgroundSize: cover)
 *   opacity – 0.0–1.0, how strongly the image bleeds through.
 *             Keep it subtle: 0.08–0.20 for wallpapers, 0.12–0.25 for patterns.
 */

export interface AppBackground {
  url: string;
  tile: boolean;
  opacity: number;
}

// ── Anime backgrounds ─────────────────────────────────────────────────────────
// Images live in public/backgrounds/ — Vite copies them to dist/ on build.
// Use the /ed/ prefix because the site is served at sirandrii.github.io/ed/
export const ANIME_BACKGROUNDS: AppBackground[] = [
  { url: '/ed/backgrounds/739891.png',                                                         tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/Bungou-Stray-Dogs-Dead-Apple-Wallpaper-HD-107708.jpg',               tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/Bungou.Stray.Dogs.Wan!.600.3237906.jpg',                            tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/Love.Live!.Sunshine!!.1024.2093444.webp',                           tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/Sakura.Saber.1024.3774364.webp',                                    tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/d546d691bed0918d0a5f5233eaaf7176.jpg',                              tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/parni-bungou-stray-dogs-brodiachie-psy-literaturnye-genii--5.webp', tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/parni-bungou-stray-dogs-brodiachie-psy-literaturnye-genii-na.webp', tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/s-l1200.jpg',                                                        tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/thumb-1920-1296214.jpg',                                             tile: false, opacity: 0.14 },
  { url: '/ed/backgrounds/thumb-1920-725902.jpg',                                              tile: false, opacity: 0.14 },
];

// ── Kawaii backgrounds ────────────────────────────────────────────────────────
export const KAWAII_BACKGROUNDS: AppBackground[] = [
  // ── Tileable patterns ──────────────────────────────────────────────────────
  {
    url: 'https://img.magnific.com/free-vector/seamless-pattern-cute-cartoon-cat-faces-pink-flowers_1308-191417.jpg?semt=ais_hybrid&w=740&q=80',
    tile: true,
    opacity: 0.18,
  },

  // ── Wallpapers ─────────────────────────────────────────────────────────────
  {
    url: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a890d551-e942-4538-98d2-d9733a3b82da/dg4258q-164aa319-300c-4a6a-89e5-a224e1db9855.png/v1/fill/w_600,h_338,q_80,strp/kawaii_milk_wallpaper_by_pixiebunnny_dg4258q-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MzM4IiwicGF0aCI6Ii9mL2E4OTBkNTUxLWU5NDItNDUzOC05OGQyLWQ5NzMzYTNiODJkYS9kZzQyNThxLTE2NGFhMzE5LTMwMGMtNGE2YS04OWU1LWEyMjRlMWRiOTg1NS5wbmciLCJ3aWR0aCI6Ijw9NjAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.E3xooILlbdbx9NA-MUL9zo8OdsADJo1Ywtc0L706zdY',
    tile: false,
    opacity: 0.22,
  },
  {
    url: 'https://lagrandclassique.com/cdn/shop/products/00661_kawaii_panda_main.jpg?v=1667387145&width=2048',
    tile: false,
    opacity: 0.15,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
// Keep the old name so KawaiiBackground stays importable (ThemeContext uses it)
export type KawaiiBackground = AppBackground;

export function pickRandomBackground(list: AppBackground[]): AppBackground | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}
