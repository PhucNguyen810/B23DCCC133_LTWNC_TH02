import type { RoutineAction, Routine } from './routineReducer';

type RoutineReducer = (state: Routine[], action: RoutineAction) => Routine[];

export function withLogger(reducer: RoutineReducer): RoutineReducer {
  return (state, action) => {
    const nextState = reducer(state, action);
    if (import.meta.env.DEV) {
      console.log(`[routine] ${action.type}`, { stateBefore: state, stateAfter: nextState });
    }
    return nextState;
  };
}
