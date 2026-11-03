import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { EXERCISES, GROUPS } from './data/exercises';
import { ExerciseRow } from './features/exercises/ExerciseRow';
import { RoutineProvider } from './features/routines/RoutineContext';
import { useRoutineDispatch, useRoutines } from './features/routines/RoutineContexts';
import { useSavedStore } from './features/saved/useSavedStore';
import { useSessionStore } from './features/session/useSessionStore';
import { ThemeProvider } from './features/theme/ThemeContext';
import { useTheme } from './features/theme/ThemeContexts';
import { useDebounce } from './hooks/useDebounce';
import type { Exercise, MuscleGroup } from './types';
import { formatDuration } from './utils/format';
import './App.css';

type SortOption = 'default' | 'name' | 'duration';

const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

interface ExerciseRowData {
  exercises: Exercise[];
  onStart: (exercise: Exercise, index: number) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
  savedIds: string[];
  queuedIds: ReadonlySet<string>;
  canAddToRoutine: boolean;
  onAddToRoutine: (exerciseId: string) => void;
}

function DebouncedSearch({ onKeywordChange }: { onKeywordChange: (value: string) => void }) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  useEffect(() => onKeywordChange(debouncedKeyword), [debouncedKeyword, onKeywordChange]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  return (
    <label className="search-field">
      <span>Tìm kiếm</span>
      <input
        type="search"
        value={keyword}
        onChange={handleSearchInputChange}
        placeholder="Tên bài tập hoặc huấn luyện viên"
      />
    </label>
  );
}

function VirtualExerciseRow({ index, style, data }: ListChildComponentProps<ExerciseRowData>) {
  const exercise = data.exercises[index];
  if (!exercise) return null;

  return (
    <div style={style}>
      <ExerciseRow
        index={index}
        exercise={exercise}
        isSaved={data.savedIds.includes(exercise.id)}
        isQueued={data.queuedIds.has(exercise.id)}
        onStart={data.onStart}
        onToggleSaved={data.onToggleSaved}
        onQueue={data.onQueue}
        onAddToRoutine={data.onAddToRoutine}
        canAddToRoutine={data.canAddToRoutine}
      />
    </div>
  );
}

function ExerciseList({
  exercises,
  height = 560,
  savedIds,
  queuedIds,
  onStart,
  onToggleSaved,
  onQueue,
  onAddToRoutine,
  canAddToRoutine,
}: {
  exercises: Exercise[];
  height?: number;
  savedIds: string[];
  queuedIds: ReadonlySet<string>;
  onStart: (exercise: Exercise, index: number) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
  onAddToRoutine: (exerciseId: string) => void;
  canAddToRoutine: boolean;
}) {
  const rowData = useMemo(
    () => ({ exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds, canAddToRoutine, onAddToRoutine }),
    [exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds, canAddToRoutine, onAddToRoutine],
  );
  if (exercises.length === 0) {
    return <div className="empty-state">Không tìm thấy bài tập nào</div>;
  }
  return (
    <FixedSizeList
      className="exercise-list"
      height={height}
      width="100%"
      itemCount={exercises.length}
      itemSize={56}
      itemData={rowData}
      itemKey={(index, data) => data.exercises[index]?.id ?? index}
    >
      {VirtualExerciseRow}
    </FixedSizeList>
  );
}

function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'Tất cả'>('Tất cả');
  const [sort, setSort] = useState<SortOption>('default');
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  const savedIds = useSavedStore((state) => state.ids);
  const toggleSaved = useSavedStore((state) => state.toggle);
  const queue = useSessionStore((state) => state.queue);
  const startSession = useSessionStore((state) => state.startSession);
  const addToSession = useSessionStore((state) => state.addToSession);
  const queuedIds = useMemo(() => new Set(queue.map((exercise) => exercise.id)), [queue]);
  const handleKeywordChange = useCallback((value: string) => setKeyword(value), []);

  const visibleExercises = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');
    const filtered = EXERCISES.filter((exercise) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        exercise.name.toLocaleLowerCase('vi').includes(normalizedKeyword) ||
        exercise.trainer.toLocaleLowerCase('vi').includes(normalizedKeyword);
      return matchesKeyword && (group === 'Tất cả' || exercise.group === group);
    });

    if (sort === 'name') {
      return filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    if (sort === 'duration') {
      return filtered.sort((a, b) => a.duration - b.duration);
    }
    return filtered;
  }, [keyword, group, sort]);

  const onStart = useCallback((_exercise: Exercise, index: number) => startSession(visibleExercises, index), [startSession, visibleExercises]);
  const onToggleSaved = useCallback((id: string) => toggleSaved(id), [toggleSaved]);
  const onQueue = useCallback((id: string) => {
    const exercise = EXERCISES.find((item) => item.id === id);
    if (exercise) addToSession(exercise);
  }, [addToSession]);
  const activeRoutineId = routines.some((routine) => routine.id === selectedRoutine) ? selectedRoutine : '';
  const onAddToRoutine = useCallback((exerciseId: string) => {
    if (!activeRoutineId) return;
    dispatch({ type: 'addExercise', routineId: activeRoutineId, exerciseId });
  }, [activeRoutineId, dispatch]);

  return (
    <section className="page library-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">KHO BÀI TẬP</p>
          <h1>Tìm bài tập phù hợp</h1>
          <p className="subheading">10.000 động tác, một nhịp tập của riêng bạn.</p>
        </div>
        <span className="library-badge"><strong>10K</strong><small>bài tập</small></span>
      </div>
      <div className="filter-panel">
        <DebouncedSearch onKeywordChange={handleKeywordChange} />
        <label>
          <span>Nhóm cơ</span>
          <select value={group} onChange={(event) => setGroup(event.target.value as MuscleGroup | 'Tất cả')}>
            <option value="Tất cả">Tất cả</option>
            {GROUPS.map((muscleGroup) => <option key={muscleGroup} value={muscleGroup}>{muscleGroup}</option>)}
          </select>
        </label>
        <label>
          <span>Sắp xếp</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>
            <option value="default">Mặc định</option>
            <option value="name">Tên A–Z</option>
            <option value="duration">Thời lượng tăng dần</option>
          </select>
        </label>
        <label className="routine-selector">
          <span>Giáo án đang chọn</span>
          <select value={activeRoutineId} onChange={(event) => setSelectedRoutine(event.target.value)}>
            <option value="">Chọn giáo án</option>
            {routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
          </select>
        </label>
      </div>
      <div className="results-line" aria-live="polite">
        Tìm thấy <strong>{visibleExercises.length}</strong> bài tập
      </div>
      <div className="list-heading" aria-hidden="true">
        <span>BÀI TẬP</span><span>HUẤN LUYỆN VIÊN</span><span>NHÓM CƠ</span><span>THỜI LƯỢNG</span><span>THAO TÁC</span>
      </div>
      <ExerciseList
        exercises={visibleExercises}
        savedIds={savedIds}
        queuedIds={queuedIds}
        onStart={onStart}
        onToggleSaved={onToggleSaved}
        onQueue={onQueue}
        onAddToRoutine={onAddToRoutine}
        canAddToRoutine={Boolean(activeRoutineId)}
      />
    </section>
  );
}

function CountdownBar({ exercise }: { exercise: Exercise | undefined }) {
  const elapsed = useSessionStore((state) => state.elapsed);
  const remaining = exercise ? Math.max(0, exercise.duration - elapsed) : 0;
  const progress = exercise ? Math.min(100, (elapsed / exercise.duration) * 100) : 0;

  return (
    <>
      <div className="workout-progress" style={{ width: `${progress}%` }} />
      <div className="timer-clock" aria-live="polite">
        <small>Còn lại:</small>
        <strong>{formatDuration(remaining)}</strong>
      </div>
    </>
  );
}

function SessionBar() {
  const queue = useSessionStore((state) => state.queue);
  const currentIndex = useSessionStore((state) => state.currentIndex);
  const isRunning = useSessionStore((state) => state.isRunning);
  const toggleRun = useSessionStore((state) => state.toggleRun);
  const next = useSessionStore((state) => state.next);
  const prev = useSessionStore((state) => state.prev);
  const tick = useSessionStore((state) => state.tick);
  const currentExercise = queue[currentIndex];
  useEffect(() => {
    if (!isRunning) return undefined;
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [isRunning, tick]);

  return (
    <aside className="workout-bar" aria-label="Đồng hồ buổi tập">
      <div className="workout-info">
        <span className={`timer-pulse ${isRunning ? 'is-running' : ''}`} />
        <span className="workout-label">{currentExercise ? `Đang tập: ${currentExercise.name} – HLV ${currentExercise.trainer}` : 'Chưa bắt đầu buổi tập'}</span>
        <small>Buổi tập: {queue.length} bài</small>
      </div>
      <CountdownBar exercise={currentExercise} />
      <div className="timer-actions">
        <button className="button button-secondary timer-control" type="button" disabled={currentIndex < 0} onClick={prev}>← Trước</button>
        <button className="button button-primary timer-control" type="button" disabled={queue.length === 0} onClick={toggleRun}>{isRunning ? 'Ⅱ Tạm dừng' : '▶ Bắt đầu'}</button>
        <button className="button button-secondary timer-control" type="button" disabled={currentIndex < 0} onClick={next}>Sau →</button>
      </div>
    </aside>
  );
}

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
        <span className="profile-chip"><span className="profile-avatar">P</span><span>Nguyễn Thị Hồng Phúc</span></span>
      </header>
      <main>
        <Suspense fallback={<p className="route-loading">Đang tải trang...</p>}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
            <Route path="*" element={<section className="page"><div className="empty-card"><h2>Không tìm thấy trang</h2><NavLink className="button button-primary" to="/">Về kho bài tập</NavLink></div></section>} />
          </Routes>
        </Suspense>
      </main>
      <SessionBar />
      <footer className="site-footer"><span>2026 PULSE TRAINING</span><span>NHỊP ĐỘ CỦA BẠN, MỤC TIÊU CỦA BẠN</span></footer>
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
