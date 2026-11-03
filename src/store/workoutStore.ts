import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { EXERCISES } from '../data/exercises';
import type { Routine } from '../types';

interface WorkoutState {
  savedIds: string[];
  routines: Routine[];
  queueIds: string[];
  activeExerciseId: string | null;
  remainingSeconds: number;
  isRunning: boolean;
  toggleSaved: (id: string) => void;
  queueExercise: (id: string) => void;
  beginExercise: (id: string) => void;
  createRoutine: (name: string) => void;
  removeRoutine: (id: string) => void;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  startRoutine: (exerciseIds: string[]) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
}

const exerciseDuration = (id: string) => EXERCISES.find((exercise) => exercise.id === id)?.duration ?? 0;

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      savedIds: [],
      routines: [],
      queueIds: [],
      activeExerciseId: null,
      remainingSeconds: 0,
      isRunning: false,
      toggleSaved: (id) => set((state) => ({
        savedIds: state.savedIds.includes(id)
          ? state.savedIds.filter((savedId) => savedId !== id)
          : [...state.savedIds, id],
      })),
      queueExercise: (id) => set((state) => ({
        queueIds: state.queueIds.includes(id) ? state.queueIds : [...state.queueIds, id],
      })),
      beginExercise: (id) => set((state) => ({
        activeExerciseId: id,
        remainingSeconds: exerciseDuration(id),
        isRunning: true,
        queueIds: state.queueIds.filter((queuedId) => queuedId !== id),
      })),
      createRoutine: (name) => set((state) => ({
        routines: [...state.routines, { id: `routine-${Date.now()}-${state.routines.length}`, name, exerciseIds: [] }],
      })),
      removeRoutine: (id) => set((state) => ({ routines: state.routines.filter((routine) => routine.id !== id) })),
      addExerciseToRoutine: (routineId, exerciseId) => set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === routineId && !routine.exerciseIds.includes(exerciseId)
            ? { ...routine, exerciseIds: [...routine.exerciseIds, exerciseId] }
            : routine,
        ),
      })),
      removeExerciseFromRoutine: (routineId, exerciseId) => set((state) => ({
        routines: state.routines.map((routine) =>
          routine.id === routineId
            ? { ...routine, exerciseIds: routine.exerciseIds.filter((id) => id !== exerciseId) }
            : routine,
        ),
      })),
      startRoutine: (exerciseIds) => {
        const [firstId, ...remainingIds] = exerciseIds;
        if (!firstId) return;
        set({
          activeExerciseId: firstId,
          remainingSeconds: exerciseDuration(firstId),
          isRunning: true,
          queueIds: remainingIds,
        });
      },
      pauseTimer: () => set({ isRunning: false }),
      resumeTimer: () => {
        if (get().activeExerciseId && get().remainingSeconds > 0) set({ isRunning: true });
      },
      stopTimer: () => set({ activeExerciseId: null, remainingSeconds: 0, isRunning: false, queueIds: [] }),
      tickTimer: () => {
        const state = get();
        if (!state.isRunning || !state.activeExerciseId) return;
        if (state.remainingSeconds > 1) {
          set({ remainingSeconds: state.remainingSeconds - 1 });
          return;
        }
        const [nextId, ...remainingIds] = state.queueIds;
        if (nextId) {
          set({
            activeExerciseId: nextId,
            remainingSeconds: exerciseDuration(nextId),
            queueIds: remainingIds,
          });
        } else {
          set({ activeExerciseId: null, remainingSeconds: 0, isRunning: false });
        }
      },
    }),
    {
      name: 'pulse-workout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedIds: state.savedIds,
        routines: state.routines,
        queueIds: state.queueIds,
        activeExerciseId: state.activeExerciseId,
        remainingSeconds: state.remainingSeconds,
        isRunning: state.isRunning,
      }),
    },
  ),
);
