import { beforeEach, describe, expect, it } from 'vitest';
import { useRoutineStore } from './useRoutineStore';

beforeEach(() => {
  useRoutineStore.setState({ routines: [] });
  useRoutineStore.persist.clearStorage();
});

describe('useRoutineStore', () => {
  it('creates routines, adds unique exercises, and removes routines', () => {
    const { createRoutine, addExerciseToRoutine, removeExerciseFromRoutine, removeRoutine } = useRoutineStore.getState();
    createRoutine('Buổi tập thân trên');
    const routine = useRoutineStore.getState().routines[0]!;

    addExerciseToRoutine(routine.id, 'e1');
    addExerciseToRoutine(routine.id, 'e1');
    expect(useRoutineStore.getState().routines[0]?.exerciseIds).toEqual(['e1']);

    removeExerciseFromRoutine(routine.id, 'e1');
    expect(useRoutineStore.getState().routines[0]?.exerciseIds).toEqual([]);
    removeRoutine(routine.id);
    expect(useRoutineStore.getState().routines).toEqual([]);
  });
});
