import { memo } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';

interface ExerciseRowProps {
  index: number;
  exercise: Exercise;
  isSaved: boolean;
  isQueued: boolean;
  onStart: (exercise: Exercise, index: number) => void;
  onToggleSaved: (id: string) => void;
  onQueue: (id: string) => void;
}

function ExerciseRowComponent({ index, exercise, isSaved, isQueued, onStart, onToggleSaved, onQueue }: ExerciseRowProps) {
  return (
    <div className="exercise-row">
      <span className="exercise-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="exercise-title"><strong>{exercise.name}</strong><small>{exercise.group} <span>·</span> {formatDuration(exercise.duration)}</small></span>
      <span className="exercise-trainer">{exercise.trainer}</span>
      <span className="group-tag">{exercise.group}</span>
      <span className="exercise-duration">{formatDuration(exercise.duration)}</span>
      <span className="row-actions">
        <button className="button button-start" type="button" onClick={() => onStart(exercise, index)}>▶ Bắt đầu</button>
        <button className={`icon-button save-button${isSaved ? ' is-saved' : ''}`} type="button" aria-label={isSaved ? 'Bỏ lưu bài tập' : 'Lưu bài tập'} aria-pressed={isSaved} onClick={() => onToggleSaved(exercise.id)}>{isSaved ? '★' : '☆'}</button>
        <button className={`icon-button queue-button${isQueued ? ' is-queued' : ''}`} type="button" aria-label={isQueued ? `${exercise.name} đã ở trong buổi tập` : `Thêm ${exercise.name} vào buổi tập`} aria-pressed={isQueued} onClick={() => onQueue(exercise.id)}>{isQueued ? '✓' : '+'}</button>
      </span>
    </div>
  );
}

export const ExerciseRow = memo(ExerciseRowComponent);
