import { memo, useEffect } from 'react';
import { useSessionStore } from './useSessionStore';
import CountdownBar from './CountdownBar';

function SessionControls() {
  const queueLength = useSessionStore((state) => state.queue.length);
  const currentIndex = useSessionStore((state) => state.currentIndex);
  const isRunning = useSessionStore((state) => state.isRunning);
  const toggleRun = useSessionStore((state) => state.toggleRun);
  const next = useSessionStore((state) => state.next);
  const prev = useSessionStore((state) => state.prev);

  return (
    <div className="timer-actions">
      <button className="button button-secondary timer-control" type="button" disabled={currentIndex < 0} onClick={prev}>← Trước</button>
      <button className="button button-primary timer-control" type="button" disabled={queueLength === 0} onClick={toggleRun}>{isRunning ? 'Ⅱ Tạm dừng' : '▶ Bắt đầu'}</button>
      <button className="button button-secondary timer-control" type="button" disabled={currentIndex < 0} onClick={next}>Sau →</button>
    </div>
  );
}

function SessionBarComponent() {
  const queue = useSessionStore((state) => state.queue);
  const currentIndex = useSessionStore((state) => state.currentIndex);
  const isRunning = useSessionStore((state) => state.isRunning);
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
        <span className="workout-label">
          {currentExercise ? `Đang tập: ${currentExercise.name} – HLV ${currentExercise.trainer}` : 'Chưa bắt đầu buổi tập'}
        </span>
        <small>Buổi tập: {queue.length} bài</small>
      </div>
      <CountdownBar exercise={currentExercise} />
      <SessionControls />
    </aside>
  );
}

export default memo(SessionBarComponent);
