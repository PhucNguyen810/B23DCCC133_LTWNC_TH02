import { useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { EXERCISES } from '../../data/exercises';
import { ExerciseRow } from '../library/ExerciseRow';
import { useSavedStore } from './useSavedStore';
import { useSessionStore } from '../session/useSessionStore';
import type { Exercise } from '../../types';

export default function SavedPage() {
  const savedIds = useSavedStore((state) => state.ids);
  const toggleSaved = useSavedStore((state) => state.toggle);
  const queue = useSessionStore((state) => state.queue);
  const startSession = useSessionStore((state) => state.startSession);
  const addToSession = useSessionStore((state) => state.addToSession);
  const exercises = useMemo(
    () => savedIds.map((id) => EXERCISES.find((exercise) => exercise.id === id)).filter((exercise): exercise is Exercise => exercise !== undefined),
    [savedIds],
  );
  const queuedIds = useMemo(() => new Set(queue.map((exercise) => exercise.id)), [queue]);
  const onStart = useCallback((_exercise: Exercise, index: number) => startSession(exercises, index), [startSession, exercises]);
  const onToggleSaved = useCallback((id: string) => toggleSaved(id), [toggleSaved]);
  const onQueue = useCallback((id: string) => {
    const exercise = EXERCISES.find((item) => item.id === id);
    if (exercise) addToSession(exercise);
  }, [addToSession]);

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">BỘ SƯU TẬP CỦA BẠN</p><h1>Bài tập đã lưu</h1><p className="subheading">Những động tác bạn muốn quay lại.</p></div>
        {exercises.length > 0 && <button className="button button-primary" type="button" onClick={() => startSession(exercises, 0)}>▶ Tập tất cả</button>}
      </div>
      {exercises.length === 0 ? (
        <div className="empty-card"><span className="empty-icon">☆</span><h2>Bạn chưa lưu bài tập nào.</h2><NavLink className="button button-primary" to="/">Khám phá bài tập</NavLink></div>
      ) : (
        <div className="saved-list">
          <div className="list-heading"><span>BÀI TẬP</span><span>HUẤN LUYỆN VIÊN</span><span>NHÓM CƠ</span><span>THỜI LƯỢNG</span><span>THAO TÁC</span></div>
          <div className="saved-exercises">
            {exercises.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                index={index}
                exercise={exercise}
                isSaved
                isQueued={queuedIds.has(exercise.id)}
                onStart={onStart}
                onToggleSaved={onToggleSaved}
                onQueue={onQueue}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
