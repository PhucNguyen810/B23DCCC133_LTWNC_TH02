import { useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import { RoutineDispatchContext, RoutineStateContext } from './RoutineContexts';
import { routineReducer } from './routineReducer';
import { withLogger } from './withLogger';
import type { Routine } from './routineReducer';

const STORAGE_KEY = 'workout-routines';
const LEGACY_STORAGE_KEY = 'pulse-workout-storage';

function isRoutine(value: unknown): value is Routine {
  if (typeof value !== 'object' || value === null || !('id' in value) || !('name' in value) || !('exerciseIds' in value)) {
    return false;
  }
  return typeof value.id === 'string'
    && typeof value.name === 'string'
    && Array.isArray(value.exerciseIds)
    && value.exerciseIds.every((id: unknown) => typeof id === 'string');
}

function readRoutines(): Routine[] {
  const savedValue = localStorage.getItem(STORAGE_KEY);
  if (savedValue !== null) {
    try {
      const parsed: unknown = JSON.parse(savedValue);
      if (Array.isArray(parsed)) return parsed.filter(isRoutine);
      console.error(`Dữ liệu ${STORAGE_KEY} không đúng định dạng.`);
      return [];
    } catch (error) {
      console.error(`Không thể đọc ${STORAGE_KEY}.`, error);
      return [];
    }
  }

  const legacyValue = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyValue) return [];
  try {
    const parsed: unknown = JSON.parse(legacyValue);
    if (typeof parsed === 'object' && parsed !== null && 'state' in parsed
      && typeof parsed.state === 'object' && parsed.state !== null
      && 'routines' in parsed.state && Array.isArray(parsed.state.routines)) {
      return parsed.state.routines.filter(isRoutine);
    }
    return [];
  } catch (error) {
    console.error(`Không thể chuyển dữ liệu giáo án cũ từ ${LEGACY_STORAGE_KEY}.`, error);
    return [];
  }
}

function initializeRoutines(): Routine[] {
  return readRoutines();
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, dispatch] = useReducer(withLogger(routineReducer), undefined, initializeRoutines);
  const stateValue = useMemo(() => routines, [routines]);
  const dispatchValue = useMemo(() => dispatch, [dispatch]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  return (
    <RoutineStateContext.Provider value={stateValue}>
      <RoutineDispatchContext.Provider value={dispatchValue}>
        {children}
      </RoutineDispatchContext.Provider>
    </RoutineStateContext.Provider>
  );
}
