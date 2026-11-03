import { lazy, Suspense } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import LibraryPage from './features/library/LibraryPage';
import { RoutineProvider } from './features/routines/RoutineContext';
import { useSavedStore } from './features/saved/useSavedStore';
import SessionBar from './features/session/SessionBar';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/ThemeContexts';
import './App.css';

const LazySavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

function AppLayout() {
  const savedCount = useSavedStore((state) => state.ids.length);
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="app-shell" data-theme={theme}>
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="Pulse, về kho bài tập">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy"><strong>pulse<span>.</span></strong><small>TRAIN WITH INTENTION</small></span>
        </NavLink>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <NavLink end to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-icon">⌗</span>Kho bài tập</NavLink>
          <NavLink to="/saved" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-icon">☆</span>Đã lưu{savedCount > 0 && <span className="nav-count">{savedCount}</span>}</NavLink>
          <NavLink to="/routines" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><span className="nav-icon">▤</span>Giáo án</NavLink>
        </nav>
        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'light' ? '◐ Giao diện tối' : '☀ Giao diện sáng'}
        </button>
        <span className="profile-chip"><span className="profile-avatar">P</span><span>Phòng tập cá nhân</span></span>
      </header>
      <main>
        <Suspense fallback={<p className="route-loading">Đang tải trang...</p>}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/saved" element={<LazySavedPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
            <Route path="*" element={<section className="page"><div className="empty-card"><h2>Không tìm thấy trang</h2><NavLink className="button button-primary" to="/">Về kho bài tập</NavLink></div></section>} />
          </Routes>
        </Suspense>
      </main>
      <SessionBar />
      <footer className="site-footer"><span>© 2025 PULSE TRAINING</span><span>NHỊP ĐỘ CỦA BẠN, MỤC TIÊU CỦA BẠN</span></footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RoutineProvider>
        <BrowserRouter><AppLayout /></BrowserRouter>
      </RoutineProvider>
    </ThemeProvider>
  );
}
