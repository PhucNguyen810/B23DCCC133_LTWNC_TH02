import { NavLink, useParams } from 'react-router-dom';
import { EXERCISES } from '../../data/exercises';
import { useRoutineDispatch, useRoutines } from './RoutineContexts';
import { useSessionStore } from '../session/useSessionStore';
import type { Exercise } from '../../types';

export default function RoutineDetailPage() {
  const { id } = useParams();
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  const startSession = useSessionStore((state) => state.startSession);
  const routine = routines.find((item) => item.id === id);

  if (!routine) {
    return <section className="page"><div className="empty-card"><h2>Không tìm thấy giáo án</h2><NavLink className="button button-primary" to="/routines">Quay lại giáo án</NavLink></div></section>;
  }

  const exercises = routine.exerciseIds
    .map((exerciseId) => EXERCISES.find((exercise) => exercise.id === exerciseId))
    .filter((exercise): exercise is Exercise => exercise !== undefined);
  const totalSeconds = exercises.reduce((total, exercise) => total + exercise.duration, 0);
  const handleRemoveExercise = (exerciseId: string) => dispatch({
    type: 'removeExercise',
    routineId: routine.id,
    exerciseId,
  });

  return (
    <section className="page routine-detail-page">
      <NavLink className="back-link" to="/routines">← Tất cả giáo án</NavLink>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">GIÁO ÁN</p>
          <h1>{routine.name}</h1>
          <p className="subheading">Tổng thời gian: {Math.floor(totalSeconds / 60)} phút {totalSeconds % 60} giây</p>
        </div>
        <button className="button button-primary" type="button" disabled={exercises.length === 0} onClick={() => startSession(exercises, 0)}>▶ Tập tất cả</button>
      </div>
      {exercises.length === 0 ? (
        <div className="empty-card"><span className="empty-icon">＋</span><h2>Giáo án đang trống</h2><p>Chọn giáo án trong Kho bài tập để thêm động tác.</p><NavLink className="button button-secondary" to="/">Mở kho bài tập</NavLink></div>
      ) : (
        <div className="routine-exercise-list">
          {exercises.map((exercise, index) => (
            <div className="routine-exercise" key={exercise.id}>
              <span className="routine-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="routine-exercise-info"><strong>{exercise.name}</strong><small>{exercise.group} <span>·</span> {exercise.trainer}</small></span>
              <span className="duration-value">{Math.floor(exercise.duration / 60)}:{String(exercise.duration % 60).padStart(2, '0')}</span>
              <button className="button button-secondary" type="button" onClick={() => handleRemoveExercise(exercise.id)}>Bỏ</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
