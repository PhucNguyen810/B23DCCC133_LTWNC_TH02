import { beforeEach, describe, expect, it } from 'vitest';
import { useWorkoutStore } from '../../store/workoutStore';

beforeEach(() => {
  useWorkoutStore.setState({
    savedIds: [],
    routines: [],
    queueIds: [],
    activeExerciseId: null,
    remainingSeconds: 0,
    isRunning: false,
  });
});

describe('workout timer state', () => {
  it('starts the next queued exercise when the active one ends', () => {
    useWorkoutStore.setState({
      activeExerciseId: 'e1',
      remainingSeconds: 1,
      isRunning: true,
      queueIds: ['e2'],
    });

    useWorkoutStore.getState().tickTimer();

    expect(useWorkoutStore.getState()).toMatchObject({
      activeExerciseId: 'e2',
      remainingSeconds: 67,
      isRunning: true,
      queueIds: [],
    });
  });

  it('stops cleanly when there are no more queued exercises', () => {
    useWorkoutStore.setState({
      activeExerciseId: 'e1',
      remainingSeconds: 1,
      isRunning: true,
      queueIds: [],
    });

    useWorkoutStore.getState().tickTimer();

    expect(useWorkoutStore.getState()).toMatchObject({
      activeExerciseId: null,
      remainingSeconds: 0,
      isRunning: false,
    });
  });
});
