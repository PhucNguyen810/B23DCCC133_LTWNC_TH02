import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { RoutineProvider } from './RoutineContext';
import { useRoutineDispatch, useRoutines } from './RoutineContexts';

function RoutineHarness() {
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();
  return (
    <>
      <button type="button" onClick={() => dispatch({
        type: 'create',
        routine: { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      })}>Tạo</button>
      <span>{routines.length}</span>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('RoutineProvider', () => {
  it('persists reducer state to workout-routines', async () => {
    render(<RoutineProvider><RoutineHarness /></RoutineProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Tạo' }));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('workout-routines') ?? '[]')).toEqual([
        { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      ]);
    });
  });
});
