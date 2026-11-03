import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { Routine, RoutineAction } from './routineReducer';

export const RoutineStateContext = createContext<Routine[] | undefined>(undefined);
export const RoutineDispatchContext = createContext<Dispatch<RoutineAction> | undefined>(undefined);

export function useRoutines(): Routine[] {
  const value = useContext(RoutineStateContext);
  if (value === undefined) throw new Error('useRoutines phải được dùng bên trong RoutineProvider.');
  return value;
}

export function useRoutineDispatch(): Dispatch<RoutineAction> {
  const value = useContext(RoutineDispatchContext);
  if (value === undefined) throw new Error('useRoutineDispatch phải được dùng bên trong RoutineProvider.');
  return value;
}
