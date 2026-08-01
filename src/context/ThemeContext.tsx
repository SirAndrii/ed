import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  pickRandomBackground,
  ANIME_BACKGROUNDS,
  KAWAII_BACKGROUNDS,
  type AppBackground,
} from '../config/backgrounds';
import { KawaiiFloatingIcons } from '../components/KawaiiFloatingIcons';

export type Theme = 'anime' | 'kawaii';

// Keep old name exported so anything that imports KawaiiBackground still compiles
export type KawaiiBackground = AppBackground;

const THEME_KEY = 'food-assessment-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  background: AppBackground | null;
  reshuffleBackground: () => void;
  triggerAdvance: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'anime',
  setTheme: () => {},
  background: null,
  reshuffleBackground: () => {},
  triggerAdvance: () => {},
});

function pickForTheme(theme: Theme): AppBackground | null {
  return theme === 'kawaii'
    ? pickRandomBackground(KAWAII_BACKGROUNDS)
    : pickRandomBackground(ANIME_BACKGROUNDS);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'kawaii' ? 'kawaii' : 'anime';
  });

  const [background, setBackground] = useState<AppBackground | null>(
    () => pickForTheme(localStorage.getItem(THEME_KEY) === 'kawaii' ? 'kawaii' : 'anime')
  );

  const [advanceTick, setAdvanceTick] = useState(0);
  const triggerAdvance = useCallback(() => setAdvanceTick(t => t + 1), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    setBackground(pickForTheme(theme));
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  const reshuffleBackground = () => setBackground(pickForTheme(theme));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, background, reshuffleBackground, triggerAdvance }}>
      {/* Kawaii floating icons layer */}
      {theme === 'kawaii' && <KawaiiFloatingIcons advanceTick={advanceTick} />}

      {/* Background image layer — fixed behind all content */}
      {background && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${background.url})`,
            backgroundSize: background.tile ? '380px auto' : 'cover',
            backgroundRepeat: background.tile ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: background.opacity,
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
