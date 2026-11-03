import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { useRoutineDispatch, useRoutines } from './RoutineContexts';
import type { Routine } from './routineReducer';

interface RoutineCreateFormProps {
  isDuplicateName: (name: string) => boolean;
}

const RoutineCreateForm = memo(function RoutineCreateForm({ isDuplicateName }: RoutineCreateFormProps) {
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Tên giáo án không được để trống');
      return;
    }
    if (isDuplicateName(trimmedName)) {
      setError('Tên giáo án đã tồn tại');
      return;
    }
    dispatch({
      type: 'create',
      routine: {
        id: `routine-${Date.now()}-${globalThis.crypto.randomUUID()}`,
        name: trimmedName,
        exerciseIds: [],
      },
    });
    setName('');
    setError('');
  };

  return (
    <form className="create-routine-form" onSubmit={handleSubmit}>
      <label htmlFor="routine-name">Tên giáo án</label>
      <div className="create-routine-controls">
        <input id="routine-name" value={name} onChange={(event) => {
          setName(event.target.value);
          setError('');
        }} placeholder="Ví dụ: Ngày ngực" maxLength={60} />
        <button className="button button-primary" type="submit">Tạo</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
});

function RoutineCard({ routine, onRemove }: { routine: Routine; onRemove: (id: string) => void }) {
  return (
    <div className="routine-card">
      <span className="routine-icon">↗</span>
      <NavLink className="routine-card-content" to={`/routines/${routine.id}`}>
        <strong>{routine.name}</strong>
        <small>{routine.exerciseIds.length} bài</small>
      </NavLink>
      <button className="button button-secondary routine-delete" type="button" onClick={() => onRemove(routine.id)}>Xóa</button>
    </div>
  );
}

export default function RoutinesPage() {
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  const latestRoutines = useRef(routines);
  useEffect(() => {
    latestRoutines.current = routines;
  }, [routines]);
  const isDuplicateName = useCallback((name: string) => {
    const normalizedName = name.toLocaleLowerCase('vi');
    return latestRoutines.current.some((routine) => routine.name.toLocaleLowerCase('vi') === normalizedName);
  }, []);
  const handleRemove = useCallback((routineId: string) => dispatch({ type: 'remove', routineId }), [dispatch]);

  return (
    <section className="page routines-page">
      <div className="page-heading">
        <div><p className="eyebrow">LỊCH TẬP CỦA BẠN</p><h1>Giáo án</h1><p className="subheading">Kết hợp các bài tập thành một buổi tập của riêng bạn.</p></div>
        <span className="routine-count">{routines.length}<small>giáo án</small></span>
      </div>
      <RoutineCreateForm isDuplicateName={isDuplicateName} />
      {routines.length === 0 ? (
        <div className="empty-card routine-empty"><span className="empty-icon">▤</span><h2>Bắt đầu với giáo án đầu tiên</h2><p>Đặt tên cho giáo án, sau đó thêm các bài tập yêu thích.</p></div>
      ) : (
        <div className="routine-grid">
          {routines.map((routine) => <RoutineCard key={routine.id} routine={routine} onRemove={handleRemove} />)}
        </div>
      )}
    </section>
  );
}
