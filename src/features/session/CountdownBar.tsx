import { useSessionStore } from './useSessionStore';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';

export default function CountdownBar({ exercise }: { exercise: Exercise | undefined }) {
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
