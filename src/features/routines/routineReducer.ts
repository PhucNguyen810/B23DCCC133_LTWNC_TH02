export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export type RoutineAction =
  | { type: 'create'; routine: Routine }
  | { type: 'rename'; routineId: string; name: string }
  | { type: 'remove'; routineId: string }
  | { type: 'addExercise'; routineId: string; exerciseId: string }
  | { type: 'removeExercise'; routineId: string; exerciseId: string };

export function routineReducer(state: Routine[], action: RoutineAction): Routine[] {
  switch (action.type) {
    case 'create':
      return [...state, action.routine];
    case 'rename':
      return state.map((routine) =>
        routine.id === action.routineId ? { ...routine, name: action.name } : routine,
      );
    case 'remove':
      return state.filter((routine) => routine.id !== action.routineId);
    case 'addExercise':
      return state.map((routine) =>
        routine.id === action.routineId && !routine.exerciseIds.includes(action.exerciseId)
          ? { ...routine, exerciseIds: [...routine.exerciseIds, action.exerciseId] }
          : routine,
      );
    case 'removeExercise':
      return state.map((routine) =>
        routine.id === action.routineId
          ? { ...routine, exerciseIds: routine.exerciseIds.filter((id) => id !== action.exerciseId) }
          : routine,
      );
  }
}

export function withLogger(reducer: typeof routineReducer): typeof routineReducer {
  return (state, action) => {
    const nextState = reducer(state, action);
    if (import.meta.env.DEV) {
      console.log(`[routine] ${action.type}`, { stateBefore: state, stateAfter: nextState });
    }
    return nextState;
  };
}
