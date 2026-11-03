import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ListChildComponentProps } from 'react-window';
import { FixedSizeList } from 'react-window';
import { EXERCISES, GROUPS } from '../../data/exercises';
import { ExerciseRow } from './ExerciseRow';
import { useRoutineDispatch, useRoutines } from '../routines/RoutineContexts';
import { useSavedStore } from '../saved/useSavedStore';
import { useSessionStore } from '../session/useSessionStore';
import { useDebounce } from '../../hooks/useDebounce';
import type { Exercise, MuscleGroup } from '../../types';

type SortOption = 'default' | 'name' | 'duration';

interface ExerciseRowData {
  exercises: Exercise[];
  onStart: (exercise: Exercise, index: number) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
  onAddToRoutine: (exerciseId: string) => void;
  savedIds: string[];
  queuedIds: ReadonlySet<string>;
  canAddToRoutine: boolean;
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
      <input type="search" value={keyword} onChange={handleSearchInputChange} placeholder="Tên bài tập hoặc huấn luyện viên" />
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
  savedIds,
  queuedIds,
  onStart,
  onToggleSaved,
  onQueue,
  onAddToRoutine,
  canAddToRoutine,
}: ExerciseRowData) {
  const rowData = useMemo(
    () => ({ exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds, canAddToRoutine, onAddToRoutine }),
    [exercises, onStart, onToggleSaved, onQueue, savedIds, queuedIds, canAddToRoutine, onAddToRoutine],
  );
  if (exercises.length === 0) return <div className="empty-state">Không tìm thấy bài tập nào</div>;

  return (
    <FixedSizeList
      className="exercise-list"
      height={560}
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

export default function LibraryPage() {
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

    if (sort === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    if (sort === 'duration') return filtered.sort((a, b) => a.duration - b.duration);
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
    if (activeRoutineId) dispatch({ type: 'addExercise', routineId: activeRoutineId, exerciseId });
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
      <div className="results-line" aria-live="polite">Tìm thấy <strong>{visibleExercises.length}</strong> bài tập</div>
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
