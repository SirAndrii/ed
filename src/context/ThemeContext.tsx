import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { pickRandomBackground, type KawaiiBackground } from '../lib/kawaiiIcons';

export type Theme = 'anime' | 'kawaii';

const THEME_KEY = 'food-assessment-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  kawaiiBackground: KawaiiBackground | null;
  reshuffleBackground: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'anime',
  setTheme: () => {},
  kawaiiBackground: null,
  reshuffleBackground: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'kawaii' ? 'kawaii' : 'anime';
  });

  const [kawaiiBackground, setKawaiiBackground] = useState<KawaiiBackground | null>(
    () => (localStorage.getItem(THEME_KEY) === 'kawaii' ? pickRandomBackground() : null)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'kawaii' && !kawaiiBackground) {
      setKawaiiBackground(pickRandomBackground());
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    if (t === 'kawaii') setKawaiiBackground(pickRandomBackground());
    setThemeState(t);
  };

  const reshuffleBackground = () => {
    if (theme === 'kawaii') setKawaiiBackground(pickRandomBackground());
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, kawaiiBackground, reshuffleBackground }}>
      {/* Kawaii background layer — fixed behind all content */}
      {theme === 'kawaii' && kawaiiBackground && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${kawaiiBackground.url})`,
            backgroundSize: kawaiiBackground.tile ? '380px auto' : 'cover',
            backgroundRepeat: kawaiiBackground.tile ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: kawaiiBackground.opacity,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
