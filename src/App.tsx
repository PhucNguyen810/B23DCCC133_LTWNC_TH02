import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { EXERCISES, GROUPS } from './data/exercises';
import { ExerciseRow } from './features/exercises/ExerciseRow';
import { useDebounce } from './hooks/useDebounce';
import { useWorkoutStore } from './store/workoutStore';
import type { Exercise, MuscleGroup, Routine } from './types';
import { formatDuration } from './utils/format';
import './App.css';

type SortOption = 'default' | 'name' | 'duration';

interface ExerciseRowData {
  exercises: Exercise[];
  onStart: (exercise: Exercise) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
  savedIds: string[];
  queuedIds: string[];
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
        isQueued={data.queuedIds.includes(exercise.id)}
        onStart={data.onStart}
        onToggleSaved={data.onToggleSaved}
        onQueue={data.onQueue}
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
}: {
  exercises: Exercise[];
  height?: number;
  savedIds: string[];
  queuedIds: string[];
  onStart: (exercise: Exercise) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
}) {
  const rowData = useMemo(
    () => ({ exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds }),
    [exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds],
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
  const savedIds = useWorkoutStore((state) => state.savedIds);
  const queuedIds = useWorkoutStore((state) => state.queueIds);
  const beginExercise = useWorkoutStore((state) => state.beginExercise);
  const toggleSaved = useWorkoutStore((state) => state.toggleSaved);
  const queueExercise = useWorkoutStore((state) => state.queueExercise);
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

  const onStart = useCallback((exercise: Exercise) => beginExercise(exercise.id), [beginExercise]);
  const onToggleSaved = useCallback((id: string) => toggleSaved(id), [toggleSaved]);
  const onQueue = useCallback((id: string) => queueExercise(id), [queueExercise]);

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
      />
    </section>
  );
}

function SavedPage() {
  const savedIds = useWorkoutStore((state) => state.savedIds);
  const queuedIds = useWorkoutStore((state) => state.queueIds);
  const beginExercise = useWorkoutStore((state) => state.beginExercise);
  const toggleSaved = useWorkoutStore((state) => state.toggleSaved);
  const queueExercise = useWorkoutStore((state) => state.queueExercise);
  const exercises = useMemo(
    () => savedIds.map((id) => EXERCISES.find((exercise) => exercise.id === id)).filter((exercise): exercise is Exercise => exercise !== undefined),
    [savedIds],
  );
  const onStart = useCallback((exercise: Exercise) => beginExercise(exercise.id), [beginExercise]);
  const onToggleSaved = useCallback((id: string) => toggleSaved(id), [toggleSaved]);
  const onQueue = useCallback((id: string) => queueExercise(id), [queueExercise]);

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">BỘ SƯU TẬP CỦA BẠN</p><h1>Bài tập đã lưu</h1><p className="subheading">Những động tác bạn muốn quay lại.</p></div>
        <span className="count-pill">{exercises.length} bài tập</span>
      </div>
      {exercises.length === 0 ? (
        <div className="empty-card"><span className="empty-icon">☆</span><h2>Chưa có bài tập nào</h2><p>Lưu bài tập yêu thích từ kho để tìm lại nhanh hơn.</p><NavLink className="button button-primary" to="/">Khám phá bài tập</NavLink></div>
      ) : (
        <div className="saved-list">
          <div className="list-heading"><span>BÀI TẬP</span><span>HUẤN LUYỆN VIÊN</span><span>NHÓM CƠ</span><span>THỜI LƯỢNG</span><span>THAO TÁC</span></div>
          <ExerciseList exercises={exercises} height={560} savedIds={savedIds} queuedIds={queuedIds} onStart={onStart} onToggleSaved={onToggleSaved} onQueue={onQueue} />
        </div>
      )}
    </section>
  );
}

function RoutineCard({ routine }: { routine: Routine }) {
  const exerciseCount = routine.exerciseIds.length;
  const totalSeconds = routine.exerciseIds.reduce((total, id) => total + (EXERCISES.find((exercise) => exercise.id === id)?.duration ?? 0), 0);
  return (
    <NavLink className="routine-card" to={`/routines/${routine.id}`}>
      <span className="routine-icon">↗</span>
      <span className="routine-card-content"><strong>{routine.name}</strong><small>{exerciseCount} bài tập <span>·</span> {formatDuration(totalSeconds)}</small></span>
      <span className="card-arrow">→</span>
    </NavLink>
  );
}

function RoutinesPage() {
  const routines = useWorkoutStore((state) => state.routines);
  const createRoutine = useWorkoutStore((state) => state.createRoutine);
  const [routineName, setRoutineName] = useState('');
  const handleCreateRoutine = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = routineName.trim();
    if (!name) return;
    createRoutine(name);
    setRoutineName('');
  };

  return (
    <section className="page routines-page">
      <div className="page-heading">
        <div><p className="eyebrow">LỊCH TẬP CỦA BẠN</p><h1>Giáo án</h1><p className="subheading">Kết hợp các bài tập thành một buổi tập của riêng bạn.</p></div>
        <span className="routine-count">{routines.length}<small>giáo án</small></span>
      </div>
      <form className="create-routine-form" onSubmit={handleCreateRoutine}>
        <label htmlFor="routine-name">Tạo giáo án mới</label>
        <div className="create-routine-controls">
          <input id="routine-name" value={routineName} onChange={(event) => setRoutineName(event.target.value)} placeholder="Ví dụ: Buổi tập thân trên" maxLength={60} />
          <button className="button button-primary" type="submit" disabled={!routineName.trim()}>+ Tạo giáo án</button>
        </div>
      </form>
      {routines.length === 0 ? (
        <div className="empty-card routine-empty"><span className="empty-icon">▤</span><h2>Bắt đầu với giáo án đầu tiên</h2><p>Đặt tên cho giáo án, sau đó thêm các bài tập yêu thích.</p></div>
      ) : <div className="routine-grid">{routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}</div>}
    </section>
  );
}

function RoutineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const routine = useWorkoutStore((state) => state.routines.find((item) => item.id === id));
  const savedIds = useWorkoutStore((state) => state.savedIds);
  const removeRoutine = useWorkoutStore((state) => state.removeRoutine);
  const addExerciseToRoutine = useWorkoutStore((state) => state.addExerciseToRoutine);
  const removeExerciseFromRoutine = useWorkoutStore((state) => state.removeExerciseFromRoutine);
  const startRoutine = useWorkoutStore((state) => state.startRoutine);
  const [exerciseId, setExerciseId] = useState('');

  if (!routine) {
    return <section className="page"><div className="empty-card"><h2>Không tìm thấy giáo án</h2><NavLink className="button button-primary" to="/routines">Quay lại giáo án</NavLink></div></section>;
  }

  const exercises = routine.exerciseIds.map((exerciseId) => EXERCISES.find((exercise) => exercise.id === exerciseId)).filter((exercise): exercise is Exercise => exercise !== undefined);
  const totalTime = exercises.reduce((total, exercise) => total + exercise.duration, 0);
  const addExercise = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (exerciseId) {
      addExerciseToRoutine(routine.id, exerciseId);
      setExerciseId('');
    }
  };
  const handleRemoveRoutine = () => {
    removeRoutine(routine.id);
    navigate('/routines');
  };

  return (
    <section className="page routine-detail-page">
      <NavLink className="back-link" to="/routines">← Tất cả giáo án</NavLink>
      <div className="detail-heading">
        <div><p className="eyebrow">GIÁO ÁN</p><h1>{routine.name}</h1><p className="subheading">{exercises.length} bài tập <span>·</span> {formatDuration(totalTime)} tổng thời gian</p></div>
        <button className="button button-primary" type="button" disabled={exercises.length === 0} onClick={() => startRoutine(routine.exerciseIds)}>▶ Bắt đầu giáo án</button>
      </div>
      <form className="add-exercise-form" onSubmit={addExercise}>
        <label htmlFor="routine-exercise">Thêm bài tập từ bộ sưu tập</label>
        <div className="create-routine-controls">
          <select id="routine-exercise" value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
            <option value="">Chọn bài tập đã lưu</option>
            {savedIds.map((savedId) => {
              const exercise = EXERCISES.find((item) => item.id === savedId);
              return exercise ? <option key={exercise.id} value={exercise.id}>{exercise.name} — {exercise.trainer}</option> : null;
            })}
          </select>
          <button className="button button-secondary" type="submit" disabled={!exerciseId}>+ Thêm bài tập</button>
        </div>
        <p className="form-hint">Chưa lưu bài tập? Hãy chọn ☆ trong Kho bài tập hoặc lưu ngay bên dưới.</p>
      </form>
      {exercises.length === 0 ? (
        <div className="empty-card"><span className="empty-icon">＋</span><h2>Giáo án đang trống</h2><p>Lưu bài tập từ kho rồi thêm chúng vào giáo án này.</p><NavLink className="button button-secondary" to="/">Mở kho bài tập</NavLink></div>
      ) : (
        <div className="routine-exercise-list">
          {exercises.map((exercise, index) => (
            <div className="routine-exercise" key={exercise.id}>
              <span className="routine-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="routine-exercise-info"><strong>{exercise.name}</strong><small>{exercise.group} <span>·</span> {exercise.trainer}</small></span>
              <span className="duration-value">{formatDuration(exercise.duration)}</span>
              <button className="icon-button remove-button" type="button" aria-label={`Xóa ${exercise.name} khỏi giáo án`} onClick={() => removeExerciseFromRoutine(routine.id, exercise.id)}>×</button>
            </div>
          ))}
        </div>
      )}
      <button className="delete-routine" type="button" onClick={handleRemoveRoutine}>Xóa giáo án</button>
    </section>
  );
}

function WorkoutTimerBar() {
  const activeExerciseId = useWorkoutStore((state) => state.activeExerciseId);
  const remainingSeconds = useWorkoutStore((state) => state.remainingSeconds);
  const isRunning = useWorkoutStore((state) => state.isRunning);
  const queueIds = useWorkoutStore((state) => state.queueIds);
  const pauseTimer = useWorkoutStore((state) => state.pauseTimer);
  const resumeTimer = useWorkoutStore((state) => state.resumeTimer);
  const stopTimer = useWorkoutStore((state) => state.stopTimer);
  const tickTimer = useWorkoutStore((state) => state.tickTimer);
  const activeExercise = EXERCISES.find((exercise) => exercise.id === activeExerciseId);
  const duration = activeExercise?.duration ?? 1;
  const progress = activeExercise ? Math.max(0, Math.min(100, ((duration - remainingSeconds) / duration) * 100)) : 0;

  useEffect(() => {
    if (!isRunning) return undefined;
    const timerId = window.setInterval(tickTimer, 1000);
    return () => window.clearInterval(timerId);
  }, [isRunning, tickTimer]);

  if (!activeExercise) return null;

  return (
    <aside className="workout-bar" aria-label="Đồng hồ buổi tập">
      <div className="workout-progress" style={{ width: `${progress}%` }} />
      <div className="workout-info"><span className={`timer-pulse ${isRunning ? 'is-running' : ''}`} /><span className="workout-label">BUỔI TẬP ĐANG DIỄN RA</span><strong>{activeExercise.name}</strong><small>{activeExercise.group} <span>·</span> {queueIds.length ? `${queueIds.length} bài tiếp theo` : 'Bài tập hiện tại'}</small></div>
      <div className="timer-clock" aria-live="polite">{formatDuration(remainingSeconds)}</div>
      <div className="timer-actions">
        <button className="button button-secondary timer-control" type="button" onClick={isRunning ? pauseTimer : resumeTimer}>{isRunning ? 'Ⅱ Tạm dừng' : '▶ Tiếp tục'}</button>
        <button className="icon-button stop-button" type="button" aria-label="Kết thúc buổi tập" onClick={stopTimer}>×</button>
      </div>
    </aside>
  );
}

function AppLayout() {
  const savedCount = useWorkoutStore((state) => state.savedIds.length);
  return (
    <div className="app-shell">
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
        <span className="profile-chip"><span className="profile-avatar">P</span><span>Nguyễn Thị Hồng Phúc</span></span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/:id" element={<RoutineDetailPage />} />
          <Route path="*" element={<section className="page"><div className="empty-card"><h2>Không tìm thấy trang</h2><NavLink className="button button-primary" to="/">Về kho bài tập</NavLink></div></section>} />
        </Routes>
      </main>
      <WorkoutTimerBar />
      <footer className="site-footer"><span>2026 PULSE TRAINING</span><span>NHỊP ĐỘ CỦA BẠN, MỤC TIÊU CỦA BẠN</span></footer>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}
