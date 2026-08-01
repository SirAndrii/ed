import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAppStorage } from '../hooks/useAppStorage';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { NyanGameModal } from '../components/NyanGameModal';
import { WelcomePage } from '../pages/WelcomePage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CategoryAssessmentPage } from '../pages/CategoryAssessmentPage';
import { CategoryResultsPage } from '../pages/CategoryResultsPage';
import { AllResultsPage } from '../pages/AllResultsPage';
import { SearchPage } from '../pages/SearchPage';
import { SettingsPage } from '../pages/SettingsPage';

function AppInner() {
  const storageHook = useAppStorage();
  const navigate = useNavigate();
  const { theme, background, reshuffleBackground } = useTheme();
  const [showGame, setShowGame] = useState(false);

  return (
    <>
      <nav className="app-nav" aria-label="Головна навігація">
        <NavLink to="/" className="app-nav__title">
          {theme === 'kawaii' ? '🌸 Мій список' : '🦊 Мій список'}
        </NavLink>
        <ul className="app-nav__links" role="list">
          <li><NavLink to="/" end className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>Головна</NavLink></li>
          <li><NavLink to="/categories" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>Категорії</NavLink></li>
          <li><NavLink to="/results" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>Результати</NavLink></li>
          <li><NavLink to="/search" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>Пошук</NavLink></li>
          <li><NavLink to="/settings" className={({ isActive }) => `app-nav__link${isActive ? ' active' : ''}`}>Налаштування</NavLink></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="app-nav__game-button"
            onClick={() => setShowGame(true)}
            aria-label="Запустити гру Nyan Cat: Lost In Space"
            title="Запустити мінігру"
          >
            <span className="app-nav__game-cat" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}game/nyan-cat.png`} alt="" />
            </span>
            <span className="app-nav__game-label">Гра</span>
          </button>
          {background && (
            <button
              onClick={reshuffleBackground}
              title="Змінити фон"
              aria-label="Змінити фон"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem',
                minHeight: '36px',
              }}
            >
              🎲
            </button>
          )}
          <ThemeToggle />
        </div>
      </nav>

      <main className="app-main" id="main-content">
        <Routes>
          <Route path="/" element={<WelcomePage storage={storageHook.storage} onNavigate={navigate} />} />
          <Route path="/categories" element={<CategoriesPage storage={storageHook.storage} onNavigate={navigate} />} />
          <Route path="/assess/:categoryId" element={<CategoryAssessmentPage storageHook={storageHook} onNavigate={navigate} />} />
          <Route path="/complete/:categoryId" element={<CategoryResultsPage storageHook={storageHook} mode="complete" onNavigate={navigate} />} />
          <Route path="/results/:categoryId" element={<CategoryResultsPage storageHook={storageHook} mode="results" onNavigate={navigate} />} />
          <Route path="/results" element={<AllResultsPage storage={storageHook.storage} onNavigate={navigate} />} />
          <Route path="/search" element={<SearchPage storageHook={storageHook} onNavigate={navigate} />} />
          <Route path="/settings" element={<SettingsPage storageHook={storageHook} />} />
          <Route path="*" element={<WelcomePage storage={storageHook.storage} onNavigate={navigate} />} />
        </Routes>
      </main>
      {showGame && <NyanGameModal onClose={() => setShowGame(false)} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
