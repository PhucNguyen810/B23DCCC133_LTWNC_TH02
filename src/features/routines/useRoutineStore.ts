import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Routine } from '../../types';

interface RoutineState {
  routines: Routine[];
  createRoutine: (name: string) => void;
  removeRoutine: (id: string) => void;
  addExerciseToRoutine: (routineId: string, exerciseId: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
}

function isRoutine(value: unknown): value is Routine {
  if (typeof value !== 'object' || value === null || !('id' in value) || !('name' in value) || !('exerciseIds' in value)) {
    return false;
  }
  return typeof value.id === 'string'
    && typeof value.name === 'string'
    && Array.isArray(value.exerciseIds)
    && value.exerciseIds.every((id: unknown) => typeof id === 'string');
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      routines: [],
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
    }),
    {
      name: 'pulse-workout-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ routines: state.routines }),
      migrate: (persistedState) => {
        if (typeof persistedState !== 'object' || persistedState === null || !('routines' in persistedState) || !Array.isArray(persistedState.routines)) {
          return { routines: [] };
        }
        return { routines: persistedState.routines.filter(isRoutine) };
      },
    },
  ),
);
