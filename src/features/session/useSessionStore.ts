import { create } from 'zustand';
import type { Exercise } from '../../types';

export interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,
  startSession: (exercises, startIndex) => {
    const currentIndex = exercises.length === 0
      ? -1
      : Math.max(0, Math.min(Math.floor(startIndex), exercises.length - 1));
    set({
      queue: exercises,
      currentIndex,
      isRunning: currentIndex !== -1,
      elapsed: 0,
    });
  },
  toggleRun: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    if (queue.length === 0) return;
    if (currentIndex === -1) {
      set({ currentIndex: 0, isRunning: true, elapsed: 0 });
      return;
    }

    const exercise = queue[currentIndex];
    if (!exercise) return;
    set({
      isRunning: !isRunning,
      elapsed: !isRunning && elapsed >= exercise.duration ? 0 : elapsed,
    });
  },
  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < 0) return;
    if (currentIndex >= queue.length - 1) {
      set({ isRunning: false });
      return;
    }
    set({ currentIndex: currentIndex + 1, elapsed: 0 });
  },
  prev: () => {
    const { currentIndex, elapsed } = get();
    if (currentIndex < 0) return;
    if (elapsed > 3 || currentIndex === 0) {
      set({ elapsed: 0 });
      return;
    }
    set({ currentIndex: currentIndex - 1, elapsed: 0 });
  },
  addToSession: (exercise) => {
    const { queue } = get();
    if (queue.some((queuedExercise) => queuedExercise.id === exercise.id)) return;
    set({ queue: [...queue, exercise] });
  },
  tick: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    const exercise = queue[currentIndex];
    if (!isRunning || !exercise) return;

    const nextElapsed = elapsed + 1;
    set({ elapsed: nextElapsed });
    if (nextElapsed >= exercise.duration) get().next();
  },
}));
