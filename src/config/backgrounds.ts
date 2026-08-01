/**
 * Kawaii background images
 * ─────────────────────────────────────────────────────────────────────────────
 * Add, remove, or replace entries as you like.
 *
 * Each entry:
 *   url     – direct link to the image
 *   tile    – true  → image is a small tileable pattern (backgroundSize: fixed px)
 *             false → image is a large wallpaper (backgroundSize: cover)
 *   opacity – 0.0–1.0, how strongly the image shows through (keep it low, e.g. 0.10–0.25)
 */

export interface KawaiiBackground {
  url: string;
  tile: boolean;
  opacity: number;
}

export const KAWAII_BACKGROUNDS: KawaiiBackground[] = [
  // ── Tileable patterns ────────────────────────────────────────────────────
  {
    url: 'https://img.magnific.com/free-vector/seamless-pattern-cute-cartoon-cat-faces-pink-flowers_1308-191417.jpg?semt=ais_hybrid&w=740&q=80',
    tile: true,
    opacity: 0.18,
  },

  // ── Wallpapers (cover) ───────────────────────────────────────────────────
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

export function pickRandomBackground(): KawaiiBackground {
  return KAWAII_BACKGROUNDS[Math.floor(Math.random() * KAWAII_BACKGROUNDS.length)];
}
