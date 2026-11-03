import { describe, expect, it, vi } from 'vitest';
import { routineReducer } from './routineReducer';
import { withLogger } from './withLogger';
import type { Routine } from './routineReducer';

const initialRoutines: Routine[] = [
  { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] },
];

describe('routineReducer', () => {
  it('tạo, đổi tên, thêm không trùng, bỏ bài và xóa giáo án bất biến', () => {
    const created = routineReducer(initialRoutines, {
      type: 'create',
      routine: { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
    });
    expect(created).toHaveLength(2);
    expect(initialRoutines).toHaveLength(1);

    const renamed = routineReducer(created, { type: 'rename', routineId: 'r2', name: 'Chân' });
    const withExercise = routineReducer(renamed, { type: 'addExercise', routineId: 'r1', exerciseId: 'e2' });
    const duplicate = routineReducer(withExercise, { type: 'addExercise', routineId: 'r1', exerciseId: 'e2' });
    expect(duplicate[0]?.exerciseIds).toEqual(['e1', 'e2']);
    expect(duplicate[1]?.name).toBe('Chân');

    const withoutExercise = routineReducer(duplicate, { type: 'removeExercise', routineId: 'r1', exerciseId: 'e1' });
    const unchangedForMissingId = routineReducer(withoutExercise, { type: 'remove', routineId: 'missing' });
    expect(unchangedForMissingId).toEqual(withoutExercise);
    const removed = routineReducer(withoutExercise, { type: 'remove', routineId: 'r2' });
    expect(removed).toEqual([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e2'] }]);
  });

  it('ghi log action cùng state trước và sau trong môi trường phát triển', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const next = withLogger(routineReducer)(initialRoutines, {
      type: 'rename',
      routineId: 'r1',
      name: 'Ngực',
    });

    expect(next[0]?.name).toBe('Ngực');
    expect(log).toHaveBeenCalledWith('[routine] rename', {
      stateBefore: initialRoutines,
      stateAfter: next,
    });
    log.mockRestore();
  });
});
